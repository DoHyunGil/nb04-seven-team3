import express from "express";
import recordsController from "../controller/recordsController.js";

const router = express.Router();

// // POST - 그룹 운동 기록 생성
router.post("/:groupId/records", recordsController.createRecord);

router.get("/:groupId/record/rank", recordsController.getRankRecords);

router.get("/:groupId/record", recordsController.getRecordList);

router.get("/:groupId/record/", recordsController.getRecord);

export default router;
