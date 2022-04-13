import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import InfiniteScroll from "react-infinite-scroll-component";

import "./App.css";

function getURL(currentPage, encodedQuery) {
  return `https://api.flickr.com/services/rest/?method=flickr.photos.search&safe_search=1&format=json&nojsoncallback=1&api_key=${process.env.REACT_APP_API_KEY}&content_type=1&is_getty=1&page=${currentPage}&tags=${encodedQuery}`;
}
function getPhotoURL(photo) {
  return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
}

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [photos, setPhotos] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = (page) => {
    const encodedQuery = encodeURIComponent(searchQuery);
    axios({
      url: getURL(page, encodedQuery),
      method: "GET",
    }).then(
      (res) => {
        if (res.status < 400) {
          if (res.data.photos.page !== 1) {
            setPhotos([...photos, ...res.data.photos.photo]);
          } else {
            setPhotos(res.data.photos.photo);
          }
          setHasNextPage(res.data.photos.page < res.data.photos.pages);
          setCurrentPage(res.data.photos.page + 1);
        }
        if (res.status === 500) {
          return Promise.reject({
            status: 500,
            data: "Something went wrong.",
          });
        }
      },
      (error) => {
        return Promise.reject({
          status: error?.response?.status,
          data: error.message,
        });
      }
    );
  };
  useEffect(() => {
    if (searchQuery) {
      setHasNextPage(true);
      fetchData(1);
      setPhotos([]);
    }
  }, [searchQuery]);

  const changeHandler = (event) => {
    setSearchQuery(event.target.value);
  };

  const debouncedChangeHandler = useCallback(debounce(changeHandler, 1000), []);
  return (
    <div className="App">
      <input
        className="input"
        onChange={debouncedChangeHandler}
        type="text"
        placeholder="Type a query..."
      />
      {photos && searchQuery && (
        <InfiniteScroll
          dataLength={photos.length}
          next={() => fetchData(currentPage)}
          hasMore={hasNextPage}
          loader={photos.length ? <h4>Loading...</h4> : null}
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
          {photos.map((photo, key) => {
            const srcPath = getPhotoURL(photo);
            return (
              <img
                className="image"
                src={srcPath}
                alt={photo.title}
                key={key}
              />
            );
          })}
        </InfiniteScroll>
      )}
    </div>
  );
}

export default App;
