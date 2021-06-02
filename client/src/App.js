import React, { useState } from "react";
import "./App.css";
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
    setLoading(true);

    //console.log("Start", new Date());
    try {
      const creator = await axios.post(
        "/creators",
        { channelURL },
        { timeout: 600000 }
      );
      setScrapedData(creator.data);
      // console.log("End", new Date());
      setLoading(false);
    } catch ({ response }) {
      //console.log("Error", new Date());

      setLoading(false);
      console.log(response);
      response && setServerError(response.data.msg);

      setTimeout(() => {
        setServerError(null);
      }, 5000);
    }

    /* console.log(new Date());
    axios({
      method: "post",
      url: "/creators",
      timeout: 60 * 10 * 1000,
      data: {
        channelURL,
      },
    })
      .then(function ({ data }) {
        console.log(new Date());
        setScrapedData(data);
        setLoading(false);
      })
      .catch(function ({ response }) {
        console.log(new Date());
        setLoading(false);
        console.log(response);
        response && setServerError(response.data.msg);

        setTimeout(() => {
          setServerError(null);
        }, 5000);
      });*/
  };

  return (
    <>
      <div className="app ">
        <header className="header flex_center">
          <h1>Setup Tour</h1>
          <form onSubmit={submitUrl} method="POST">
            <input
              type="text"
              placeholder="Youtube Video URL"
              required
              onChange={(e) => {
                setChannelURL(e.target.value);
              }}
            />
            <button type="submit">Submit</button>
          </form>
          <div style={{ padding: "10px" }}>
            <h3>Example URls</h3>
            <p>https://www.youtube.com/watch?v=jhS0w9umJR4</p>
            <p>https://www.youtube.com/watch?v=qnxo_jR83bM</p>
            <p>https://www.youtube.com/watch?v=TQfIUS52QHA</p>
            <p>https://www.youtube.com/channel/UC-91UA-Xy2Cvb98deRXuggA</p>
          </div>
        </header>
        {serverError && (
          <div className="error">
            <h2>{serverError}</h2>
          </div>
        )}
        {loading && (
          <div className="laoding">
            <h2 className="animate">Loading Please wait...</h2>
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
            {scrapedData.items.map((item, index) => (
              <div key={index} className="item flex_center">
                <img src={item.imgSrc} alt="gear_img" />
                <h5>{item.itemName}</h5>
                <button>
                  <a href={item.link} rel="noreferrer" target="_blank">
                    Buy Now
                  </a>
                </button>
              </div>
            ))}
          </div>
        )}
        <footer
          className="footer flex_center"
          style={{ justifyContent: "center" }}
        >
          <p>
            Made by Sanyam
            <a href="www.google.com">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                viewBox="0 0 24 24"
                width="20px"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <title>GitHub</title>
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </p>
        </footer>
      </div>
    </>
  );
};

export default App;
