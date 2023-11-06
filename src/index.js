import express from "express";
import axios from "axios";
import NodeCache from "node-cache";
import lodash from "lodash";
import "dotenv/config";

const { sample } = lodash;
const port = process.env.PORT || 4003;
const server = express();
const cache = new NodeCache();

const existenceTime = 3 * 60 * 60;
const exBrowserHeaderTime = 20 * 60 * 60;

server.get("/", (req, res, next) => {
  res.send("server on");
});

server.get("/proxy", async (req, res, next) => {
  const { src, url } = req.query;
  const cachedData = cache.get(url);

  let browserHeader = cache.get("browser-header");

  if (!browserHeader) {
    try {
      const { data } = await axios.get(
        "https://http-support.vercel.app/generate-browser-headers?limit=100"
      );
      cache.set("browser-header", data, exBrowserHeaderTime);
      browserHeader = data;
    } catch {
      browserHeader = [];
    }
  }

  if (!src) {
    res.status(400).json({
      message: "src is not empty",
    });
  } else if (!url) {
    res.status(400).json({
      message: "url is not empty",
    });
  } else if (cachedData) {
    console.log("Data found in cache");
    res.send(cachedData);
  } else {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        headers: {
          referer: src,
          origin: src,
          "X-Requested-With": "XMLHttpRequest",
          ...sample(browserHeader),
        },
        timeout: 10000,
      });

      const dataStream = response.data;
      const contentType = response.headers["content-type"];
      cache.set(url, dataStream, existenceTime);
      res.setHeader("Content-Type", contentType);
      res.send(dataStream);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(404).json({ error });
    }
  }
});
server.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
