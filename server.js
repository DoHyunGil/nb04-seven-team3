import express from "express";
import groupRouters from "./src/routes/groups.js";
import recordsRouter from "./src/routes/records.js";
import tagsRouters from "./src/routes/tags.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use("/groups", groupRouters);
app.use("/records", recordsRouter);
app.use("/tags", tagsRouters);

app.listen(PORT, () => {
  console.log("server running");
});
