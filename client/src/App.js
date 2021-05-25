import React, { useState } from "react";
import "./App.css";
import GitHubIcon from "@material-ui/icons/GitHub";
import axios from "axios";

const App = () => {
  const [channelURL, setChannelURL] = useState("");
  const [scrapedData, setScrapedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const submitUrl = async (e) => {
    e.preventDefault();
    if (channelURL === "") return;
    setScrapedData({});
    try {
      setLoading(true);
      const creator = await axios.post("http://localhost:4000/creators", {
        channelURL,
      });
      setScrapedData(creator.data);
    } catch (error) {
      error.response.data.msg && setServerError(error.response.data.msg);

      console.log(serverError);
      setTimeout(() => {
        setServerError(null);
      }, 5000);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="app ">
        <header className="header flex_center">
          <h1>Setup Tour</h1>
          <form>
            <input
              type="text"
              placeholder="Youtube Video URL"
              required
              onChange={(e) => {
                setChannelURL(e.target.value);
              }}
            />
            <button onClick={submitUrl}>Submit</button>
          </form>
          <div>
            <h3>Example URls</h3>
            <p>https://www.youtube.com/watch?v=qnxo_jR83bM</p>
            <p>https://www.youtube.com/watch?v=TQfIUS52QHA</p>
            <p>https://www.youtube.com/channel/UC-91UA-Xy2Cvb98deRXuggA</p>
          </div>
        </header>
        {serverError && (
          <div className="flex_center">
            <h2>{serverError}</h2>
          </div>
        )}
        {loading && (
          <div className="flex_center">
            <h2>Loading Please wait...</h2>
          </div>
        )}
        {scrapedData.channelName && (
          <div className="channel_info flex_center">
            <img src={scrapedData.avatarURL} alt="avatar_img" />
            <h3>{scrapedData.channelName}</h3>
          </div>
        )}
        {scrapedData.items && (
          <div className="items_container">
            {scrapedData.items.map((item) => {
              return (
                <div className="item flex_center">
                  <img src={item.imgSrc} alt="gear_img" />
                  <h5>{item.itemName}</h5>
                  <button>
                    <a href={item.link} rel="noreferrer" target="_blank">
                      Buy Now
                    </a>
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <footer className="footer flex_center">
          Made by Sanyam
          <a href="www.google.com">
            <GitHubIcon fontSize="large"></GitHubIcon>
          </a>
        </footer>
      </div>
    </>
  );
};

export default App;
