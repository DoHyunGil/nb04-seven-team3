import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class LikesController {
  // 그룹 좋아요 추가
  async addLike(req, res) {
    const groupId = Number(req.params.groupId);
    const { nickname } = req.body;

    try {
      // 그룹 존재 여부 확인
      const group = await prisma.group.findUnique({ where: { id: groupId } });
      if (!group) {
        return res.status(404).json({ error: "그룹이 존재하지 않습니다." });
      }

      // 좋아요 생성 (중복 방지)
      const like = await prisma.like.upsert({
        where: {
          groupId_nickname: { groupId, nickname },
        },
        update: {},
        create: {
          groupId,
          nickname,
        },
      });

      return res.status(201).json({ message: "추천 완료", like });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "서버 오류" });
    }
  }

  // 그룹 좋아요 취소
  async removeLike(req, res) {
    const groupId = Number(req.params.groupId);
    const { nickname } = req.body;

    try {
      await prisma.like.delete({
        where: {
          groupId_nickname: { groupId, nickname },
        },
      });

      return res.status(200).json({ message: "취소 완료" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "서버 오류" });
    }
  }
}

export default new LikesController();
