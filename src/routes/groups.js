import express from "express";
import GroupsController from "../controller/groupsController.js";
// import TagsController from "../controller/tagsController.js";

const router = express.Router();

//Group 생성
router.post("/", GroupsController.createGroupRecord);

//Group 수정
router.patch("/:id", GroupsController.updateGroupRecord);

//Group 삭제
router.delete("/:id", GroupsController.deleteGroupRecord);

//Group 목록 전체 조회
router.get("/", GroupsController.getAllGroups);

//Group 목록 상세 조회
router.get("/:groupId", GroupsController.getGroupById);



export default router;
