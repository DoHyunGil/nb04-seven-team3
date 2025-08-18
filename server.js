import express from "express";
import groupRouters from "./src/routes/groups";
import recordsRouter from "./src/routes/records.js";

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use("/groups", groupRouters);
app.use("/groups", recordsRouter);

app.listen(PORT, () => {
  console.log("server running");
});
