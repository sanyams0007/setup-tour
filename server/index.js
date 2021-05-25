const express = require("express");
const { scrapeChannel } = require("./scraper.js");
const app = express();
const cors = require("cors");

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 4000;

/* app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
}); */

app.get("/", (req, res) => {
  res.send("Setup Explorer!");
});

app.post("/creators", async (req, res) => {
  const channelData = await scrapeChannel(req.body.channelURL);
  console.log("processed : ", channelData);
  if (channelData === null)
    return res.status(400).json({
      msg: "No Data found with the given link.",
    });
  res.json(channelData);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
