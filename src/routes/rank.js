import express from "express";
import rankController from "../controller/rankController.js";
const router = express.Router({ mergeParams: true });

router.get("/", rankController.getRankList.bind(rankController));

export default router;