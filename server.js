import express from "express";
import groupRouters from "./src/routes/groups.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/groups", groupRouters);

app.listen(PORT, () => {
  console.log("server running");
});
