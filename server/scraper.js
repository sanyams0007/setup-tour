const puppeteer = require("puppeteer");

const scrapeChannel = async (url) => {
  try {
    const browser = await puppeteer.launch();
    console.log(`Opening ${url}`);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load", timeout: 0 });

    // Wait for the required DOM to be rendered
    await page.waitForSelector(
      ".yt-simple-endpoint.style-scope.yt-formatted-string"
    );
    let scrapedData = {
      items: [],
    };

    // Extract all links from below selector & gets only amazon links
    let urls = await page.$$eval(
      ".yt-simple-endpoint.style-scope.yt-formatted-string",
      (links) => {
        links = links
          .map((link) => link.textContent)
          .filter(
            (link) => link.toLowerCase().indexOf("amzn.to" || "amazon") !== -1
          );
        return links;
      }
    );
    //console.log(urls);

    // if no urls then exit
    if (urls.length <= 0) {
      //console.log("null");
      await browser.close();
      return null;
    }

    //item to scrape
    const [channel] = await page.$x('//*[@id="text"]/a');
    const channelText = await channel.getProperty("textContent");
    const channelName = await channelText.jsonValue();
    //console.log(typeof channelName);
    scrapedData["channelName"] = channelName;

    const [avatarImg] = await page.$x(
      "/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[8]/div[3]/ytd-video-secondary-info-renderer/div/div[2]/ytd-video-owner-renderer/a/yt-img-shadow/img"
    );
    //const [avatarImg] = await page.$x('//*[@id="img"]');
    const avatarSrc = await avatarImg.getProperty("src");
    const avatarURL = await avatarSrc.jsonValue();
    //scrapedData[avatarURL];
    scrapedData["avatarURL"] = avatarURL;

    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let newPage = await browser.newPage();
        await newPage.goto(link, { waitUntil: "load", timeout: 0 });

        await newPage.waitForSelector("#productTitle");
        await newPage.waitForSelector("#landingImage");

        // get the gear item name
        /* const [item] = await newPage.$x(
          "/html/body/div[2]/div[2]/div[5]/div[5]/div[4]/div[1]/div/h1/span"
        ); */
        const [item] = await newPage.$x('//*[@id="productTitle"]');
        const name = await item.getProperty("textContent");
        let itemName = await name.jsonValue();
        itemName = itemName.replace(/('|\\n)/gi, "").trim();
        //console.log(itemName.replace(/('|\\n)/gi, "").trim());

        // get the gear item img
        /* const [img] = await newPage.$x(
            "/html/body/div[2]/div[2]/div[5]/div[5]/div[3]/div[1]/div[1]/div/div/div[2]/div[1]/div[1]/ul/li[1]/span/span/div/img"
        ); */
        const [img] = await newPage.$x('//*[@id="landingImage"]');
        const src = await img.getProperty("src");
        const imgSrc = await src.jsonValue();

        // get the gear item price
        /*     const [price] = await newPage.$x('//*[@id="priceblock_ourprice"]');
      const txt = await price.getProperty("textContent");
      const itemPrice = await txt.jsonValue(); */
        resolve({ link, itemName, imgSrc });
        await newPage.close();
      });

    for (link in urls) {
      let currentPageData = await pagePromise(urls[link]);
      scrapedData["items"].push(currentPageData);
      //scrapedData.items.push(currentPageData);
      //console.log(currentPageData);
    }

    //console.log(scrapedData);
    await browser.close();
    return scrapedData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

//https://www.youtube.com/watch?v=TQfIUS52QHA
/* scrapeChannel("https://www.youtube.com/channel/UC-91UA-Xy2Cvb98deRXuggA"); */

module.exports = { scrapeChannel };