import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class LikesController {
  // 그룹 좋아요 추가
  async addLike(req, res) {
    const groupId = Number(req.params.groupId);

    try {
      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: { likeCount: { increment: 1 } },
      });

      return res.status(200).json({
        message: "추천 완료",
        likeCount: updatedGroup.likeCount,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "서버 오류" });
    }
  }

  // 그룹 좋아요 취소
  async removeLike(req, res) {
    const groupId = Number(req.params.groupId);

    try {
      // likeCount가 0보다 클 때만 감소
      const group = await prisma.group.findUnique({ where: { id: groupId } });
      if (!group) return res.status(404).json({ error: "그룹이 존재하지 않습니다." });

      const newLikeCount = group.likeCount > 0 ? group.likeCount - 1 : 0;

      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: { likeCount: newLikeCount },
      });

      return res.status(200).json({
        message: "추천 취소 완료",
        likeCount: updatedGroup.likeCount,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "서버 오류" });
    }
  }

  // 그룹 추천수 조회
  async getLikeCount(req, res) {
    const groupId = Number(req.params.groupId);

    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { likeCount: true },
      });

      if (!group) return res.status(404).json({ error: "그룹이 존재하지 않습니다." });

      return res.status(200).json({ likeCount: group.likeCount });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "서버 오류" });
    }
  }
}

export default new LikesController();

