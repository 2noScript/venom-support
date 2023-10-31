import express from "express";
import axios from "axios";
import "dotenv/config";

const port = process.env.PORT || 4003;
const server = express();

server.get("/", (req, res, next) => {
  res.send("server on");
});

server.get("/proxy", async (req, res, next) => {
  const { src, url } = req.query;

  if (!src) {
    res.status(400).json({
      message: "src is not empty",
    });
  } else if (!url) {
    res.status(400).json({
      message: "url is not empty",
    });
  }

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      headers: {
        referer: src,
        origin: src,
      },
      timeout: 10000,
    });
    response.data.pipe(res);
  } catch (err) {
    res.status(404).json({
      err,
    });
  }
});
server.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
