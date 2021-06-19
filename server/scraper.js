const puppeteer = require("puppeteer");

const scrapeChannel = async (url) => {
  try {
    // open headless browser
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [
        "--incognito",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
        '--disable-setuid-sandbox',
      ],
      ignoreHTTPSErrors: true,
    });

    console.log(`Opening ${url}`);

    //open a new page
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
    );
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url, { waitUntil: "load", timeout: 0 });

    // Wait for the required DOM to be rendered
    await page.waitForSelector("a.yt-formatted-string");

    /* let urls = await page.$$eval("a.yt-formatted-string", (links) => {
      const filteredLinks = links
        .map((link) => link.textContent)
        .filter(
          (link) => link.toLowerCase().indexOf("amzn.to" || "amazon") !== -1
        );
      console.log("after", filteredLinks);
      return filteredLinks;
    }); */

    // Extract all links from below selector & gets only amazon links
    let urls = await page.evaluate(() => {
      const links = document.querySelectorAll(`a.yt-formatted-string`);
      let filteredLinks = [];
      for (let i = 0; i < links.length; i++) {
        if (
          links[i].innerText
            .trim()
            .toLowerCase()
            .includes("amzn.to" || "amazon") &&
          !filteredLinks.includes(links[i].innerText.trim())
        ) {
          filteredLinks.push(links[i].innerText.trim());
        }
      }
      return filteredLinks;
    });
    console.log(urls);

    // if no urls then exit
    if (urls.length <= 0) {
      await browser.close();
      return null;
    }

    let scrapedData = {
      items: [],
    };

    console.log("processing urls");

    //item to scrape
    const [channel] = await page.$x('//*[@id="text"]/a');
    const channelText = await channel.getProperty("textContent");
    const channelName = await channelText.jsonValue();
    //console.log(typeof channelName);
    scrapedData["channelName"] = channelName;

    /*
    const [avatarImg] = await page.$x(
      "/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[8]/div[3]/ytd-video-secondary-info-renderer/div/div[2]/ytd-video-owner-renderer/a/yt-img-shadow/img"
    );
    */

    const [, avatarURL] = await page.$$eval("#avatar > img#img", (imgs) =>
      imgs.map((img) => img.src)
    );

    //const [avatarImg] = await page.$x('(//*[@id="img"])');
    /* const avatarSrc = await avatarImg.getProperty("src");
    const avatarURL = await avatarSrc.jsonValue(); */
    //scrapedData[avatarURL];
    scrapedData["avatarURL"] = avatarURL;

    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let newPage = await browser.newPage();
        await newPage.setUserAgent(
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
        );
        await newPage.setDefaultNavigationTimeout(0);
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

module.exports = { scrapeChannel };
