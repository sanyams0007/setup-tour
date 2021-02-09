import React, { useState } from "react";
import "./App.css";
import GitHubIcon from "@material-ui/icons/GitHub";
import axios from "axios";

const App = () => {
  const [channelURL, setChannelURL] = useState("");
  const [scrapedData, setScrapedData] = useState({});
  const [serverError, setServerError] = useState(null);

  const submitUrl = async (e) => {
    e.preventDefault();
    if (channelURL === "") return;
    setScrapedData({});

    try {
      const creator = await axios.post("http://localhost:5000/creators", {
        channelURL,
      });
      //console.log(creator);
      setScrapedData(creator.data);
    } catch (error) {
      error.response.data.msg && setServerError(error.response.data.msg);

      console.log(serverError);
      setTimeout(() => {
        setServerError(null);
      }, 5000);
    }
  };

  return (
    <>
      <div className="app ">
        <div className="header flex_center">
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
        </div>
        {serverError && (
          <div className="flex_center">
            <h2>{serverError}</h2>
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
      </div>
      <footer className="footer flex_center">
        Made by Sanyam
        <a href="www.google.com">
          <GitHubIcon fontSize="large"></GitHubIcon>
        </a>
      </footer>
    </>
  );
};

export default App;
