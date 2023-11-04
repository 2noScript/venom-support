import express from "express";
import axios from "axios";
import NodeCache from "node-cache";

import "dotenv/config";

const port = process.env.PORT || 4003;
const server = express();
const cache = new NodeCache();

const oneDaySeconds = 24 * 60 * 60;

server.get("/", (req, res, next) => {
  res.send("server on");
});

server.get("/proxy", async (req, res, next) => {
  const { src, url } = req.query;
  const cachedData = cache.get(url);

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
        responseType: "stream",
        headers: {
          referer: src,
          origin: src,
          "X-Requested-With": "XMLHttpRequest",
        },
        timeout: 10000,
      });

      const dataStream = response.data;
      const chunks = [];
      dataStream.on("data", (chunk) => {
        chunks.push(chunk);
      });
      dataStream.on("end", () => {
        const responseData = Buffer.concat(chunks);
        cache.set(url, responseData, oneDaySeconds);
        res.send(responseData);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(404).json({ error });
    }
  }
});
server.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
