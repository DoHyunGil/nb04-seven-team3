import express from "express";
import GroupsController from "../controller/groupsController.js";
import recordsRouter from "./records.js";
import rankRouter from"./rank.js"
// import TagsController from "../controller/tagsController.js";


import groupGetValidation from "../schemas/groups/group.get.schema.js";


const router = express.Router();

//records 라우팅
router.use("/:groupId/records", recordsRouter);

router.use("/:groupId/rank", rankRouter)
//Group 생성
router.post("/", GroupsController.createGroupRecord);

//Group 수정
router.patch("/:id", GroupsController.updateGroupRecord);

//Group 삭제
router.delete("/:id", GroupsController.deleteGroupRecord);

//Group 목록 전체 조회
router.get("/", groupGetValidation, GroupsController.getAllGroups);

//Group 목록 상세 조회
router.get("/:groupId", groupGetValidation, GroupsController.getGroupById);



export default router;
