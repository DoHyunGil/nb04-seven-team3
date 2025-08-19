import express from "express";
import RecordsController from "../controller/recordsController.js";

const router = express.Router();

// POST - 그룹 운동 기록 생성
router.post("/:groupId/records", RecordsController.createRecord);

export default router;
