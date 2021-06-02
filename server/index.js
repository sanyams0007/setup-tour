const express = require("express");
const { scrapeChannel } = require("./scraper.js");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4000;

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Setup Explorer!");
});

app.post(
  "/creators",
  (req, res, next) => {
    req.setTimeout(600000);
    next();
  },
  async (req, res) => {
    if (!req.body.channelURL.includes(`https://www.youtube.com`))
      return res.status(400).json({
        msg: "Invalid URL.",
      });

    const channelData = await scrapeChannel(req.body.channelURL);

    if (channelData === null || channelData === undefined)
      return res.status(400).json({
        msg: "No Urls found in the link.",
      });

    console.log("processing done");
    console.log(channelData);
    res.status(200).json(channelData);
    /* setTimeout(() => {
      res.status(200).json(channelData);
    }, 60 * 2 * 1000); */
  }
);

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

server.timeout = 60 * 10 * 1000;
