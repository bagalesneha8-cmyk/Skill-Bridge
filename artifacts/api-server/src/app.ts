import express, { type Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(pinoHttp());
app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.includes('/video-upload')) {
    console.log(`[VIDEO UPLOAD DEBUG] ${req.method} ${req.url}`);
    console.log(`[VIDEO UPLOAD DEBUG] Content-Type: ${req.headers['content-type']}`);
  }
  next();
});
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.get("/test", (req: Request, res: Response) => {
  res.json({ message: "Root test working" });
});

app.use("/api", router);

export default app;
