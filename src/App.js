import { useState, useEffect } from "react";
import axios from "axios";

import "./App.css";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [photos, setPhotos] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    if (searchQuery) {
      const encodedQuery = encodeURIComponent(searchQuery);
      setTimeout(() => {
        axios({
          url: `https://api.flickr.com/services/rest/?method=flickr.photos.search&safe_search=1&format=json&nojsoncallback=1&api_key=15b67c2a8b4288ff1fddf5eb56655cfb&content_type=1&is_getty=1&tags=${encodedQuery}`,
          method: "GET",
        }).then(
          (res) => {
            if (res.status < 400) {
              // const returnedPhotos = Promise.resolve(res.data);
              setHasNextPage(res.data.page < res.data.pages);
              setPhotos(res.data.photos.photo);
            }
            if (res.status === 500) {
              return Promise.reject({
                status: 500,
                data: "Something went wrong.",
              });
            }
            // throw Promise.reject({ status: res.status, data: res.data });
          },
          (error) => {
            return Promise.reject({
              status: error?.response?.status,
              data: error.message,
            });
          }
        );
      }, 2000);
    }
  }, [searchQuery]);
  console.log(photos);
  return (
    <div className="App">
      <form
        onSubmit={() => {
          console.log("submited");
        }}
      >
        <label>
          Name:
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
            }}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <div>
        {photos &&
          searchQuery &&
          photos.map((photo, key) => {
            const srcPath =
              "https://farm" +
              photo.farm +
              ".staticflickr.com/" +
              photo.server +
              "/" +
              photo.id +
              "_" +
              photo.secret +
              ".jpg";
            return <img src={srcPath} alt={photo.title} key={key} />;
          })}
      </div>
    </div>
  );
}

export default App;
