import express from "express";
import groupsController from "../controller/groupsController.js";

const router = express.Router();

//Group 생성
router.post("/", groupsController.createRecord);

//Group 수정
router.patch("/:id", groupsController.updateRecord);

//Group 삭제
router.delete("/:id", groupsController.deleteRecord);

export default router;
