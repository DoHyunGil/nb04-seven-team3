import express from "express";
import groupRouters from "./src/routes/groups.js";
import likesRouter from "./src/routes/likes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use("/groups", groupRouters);
app.use("/groups", likesRouter);

app.listen(PORT, () => {
  console.log("server running");
});
