import express from "express";
import GroupLikesController from "../controller/likesController.js";

const router = express.Router();

// POST - 그룹 운동 기록 좋아요 생성
router.post('/:groupId/likes', GroupLikesController.addLike);

// DELETE - 그룹 운동 기록 좋아요 삭제
router.delete("/:groupId/likes", GroupLikesController.removeLike);

export default router;
