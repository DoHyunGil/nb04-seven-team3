import express from "express";
import cors from "cors";
import groupRouters from "./src/routes/groups.js";
import recordsRouter from "./src/routes/records.js";
import imageRouter from "./src/routes/images.js";
import path from "path";
import tagsRouters from "./src/routes/tags.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:3000", // 프론트 서버 주소
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/images", imageRouter);

app.use("/groups", groupRouters);
app.use("/tags", tagsRouters);
app.use("/records", recordsRouter);
app.use("/images", express.static(path.join(process.cwd(), "uploads")));

app.listen(PORT, () => {
  console.log("server running");
});
