import express, { Request, Response } from "express";
import "dotenv/config";

const port = process.env.PORT || 4003;
const app = express();

app.get("/proxy", async (req: Request, res: Response) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
