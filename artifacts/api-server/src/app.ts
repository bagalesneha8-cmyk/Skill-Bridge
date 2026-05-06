import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use((req, res, next) => {
  if (req.url.includes('/video-upload')) {
    console.log(`[VIDEO UPLOAD DEBUG] ${req.method} ${req.url}`);
    console.log(`[VIDEO UPLOAD DEBUG] Content-Type: ${req.headers['content-type']}`);
  }
  next();
});
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.get("/test", (req, res) => {
  res.json({ message: "Root test working" });
});

app.use("/api", router);

export default app;
