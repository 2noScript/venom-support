import express from "express";
import axios from "axios";
import { browserHeader} from 'fake-browser-headers'
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
  }  else {
     for(let i=0;i<5;i++){
       try{
        const response = await axios.get(url, {
          responseType: "stream",
          headers: {
            Referer: src,
            Origin: src,
            "X-Requested-With": "XMLHttpRequest",
           ...browserHeader()
          },
          timeout: 10000,
        });
       response.data.pipe(res)                               
       return
       }
       catch{
       }
     }}
      res.status(500).json({
        message:'fix bug'
      })
});
server.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
