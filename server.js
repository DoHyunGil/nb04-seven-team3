import express from "express";
import groupRouters from "./src/routes/groups.js";
import recordsRouter from "./src/routes/records.js";
import imageRouter from "./src/routes/images.js";
import path from "path";
import tagsRouters from "./src/routes/tags.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use("/images", express.static(path.join(process.cwd(), "uploads")));
app.use("/images", imageRouter);

app.use("/groups", groupRouters);
app.use("/records", recordsRouter);
app.use("/tags", tagsRouters);

app.listen(PORT, () => {
  console.log("server running");
});
