import express from "express";
import groupRouters from "./src/routes/groups.js";
import recordRouters from "./src/routes/records.js";

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());


app.use("/groups", recordRouters); 
app.use("/groups", groupRouters);

// 공통 된부분이
app.listen(PORT, () => {
  console.log("server running");
});
