import express from "express";
import GroupLikesController from "../controller/likesController.js";

const router = express.Router({ mergeParams: true });

// POST - 그룹 운동 기록 좋아요 생성
router.post("/", GroupLikesController.addLike);

// DELETE - 그룹 운동 기록 좋아요 삭제
router.delete("/", GroupLikesController.removeLike);

export default router;
