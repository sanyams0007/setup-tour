const express = require("express");
const { scrapeChannel } = require("./scraper.js");
const app = express();
const cors = require("cors");

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Setup Explorer!");
});

app.post("/creators", async (req, res) => {
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
  res.json(channelData);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
