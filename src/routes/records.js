import express from "express";
import recordsController from "../controller/recordsController.js";

const router = express.Router({ mergeParams: true });

// // POST - 그룹 운동 기록 생성
router.post("/", recordsController.createRecord);

router.get("/", recordsController.getRecordList);

router.get("/:groupId/record/rank", recordsController.getRankRecords);

//미사용
// router.get("/:groupId/record/", recordsController.getRecord);

export default router;
