import express from "express";
import TagsController from "../controller/tagsController.js";

const router = express.Router();

//태그목록조회
router.get("/", TagsController.getAllTags);
//태그상세조회
router.get("/:id", TagsController.getTags);

export default router;
