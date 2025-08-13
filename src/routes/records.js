import express from "express";
import RecordsController from "src/controllers/recordsController.js";

const router = express.Router();

// POST - 그룹 운동 기록 생성
router.post("/:groupId/records", (req, res) =>
  RecordsController.createRecord(req, res)
);

export default router;
