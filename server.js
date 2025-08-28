import express from "express";
import cors from "cors";
import groupRouters from "./src/routes/groups.js";
import imageRouter from "./src/routes/images.js";
import path from "path";
import tagsRouters from "./src/routes/tags.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import * as dotenv from "dotenv";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // 프론트 서버 주소
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/images", imageRouter);

app.use("/groups", groupRouters);
app.use("/tags", tagsRouters);
app.use("/images", express.static(path.join(process.cwd(), "uploads")));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("server running");
});
