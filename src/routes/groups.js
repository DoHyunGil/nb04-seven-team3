import express from "express";
import groupsController from "../controller/groupsController.js";

const router = express.Router();

//Record로 가는 경로
router.get("/:groupId/records", recordsRouter);
router.post("/:groupId/records", recordsRouter);

//Group 생성
router.post("/", groupsController.createGroupRecord);

//Group 수정
router.patch("/:id", groupsController.updateGroupRecord);

//Group 삭제
router.delete("/:id", groupsController.deleteGroupRecord);



export default router;
