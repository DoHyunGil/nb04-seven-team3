import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class LikesController {
  // 그룹 좋아요 추가
  async addLike(req, res) {
    const groupId = Number(req.params.groupId);
    const { participantId } = req.body;

    try {
      // 그룹 존재 여부 확인
      const group = await prisma.group.findUnique({ where: { id: groupId } });
      if (!group) {
        return res.status(404).json({ error: "그룹이 존재하지 않습니다." });
      }

      // 트랜잭션으로 좋아요 + 추천수 증가
      const result = await prisma.$transaction(async (tx) => {
        /*
        // 개선 후 수정 예정
        // 중복 좋아요 방지
        const existing = await tx.like.findUnique({
          where: { groupId_participantId: { groupId, participantId } },
        });

        if (existing) {
          return { message: "이미 좋아요가 추가된 상태입니다.", like: existing };
        }
        */

        // 좋아요 생성
        const like = await tx.like.create({
          data: { groupId, participantId },
        });

        // 추천수 증가
        await tx.group.update({
          where: { id: groupId },
          data: {
            recommendCount: { increment: 1 },
          },
        });

        return { message: "추천 완료", like };
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "서버 오류" });
    }
  }

  // 그룹 좋아요 취소
  async removeLike(req, res) {
    const groupId = Number(req.params.groupId);
    const { participantId } = req.body;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 좋아요 존재 여부 확인
        const existing = await tx.like.findUnique({
          where: { groupId_participantId: { groupId, participantId } },
        });

        if (!existing) {
          return { error: "이미 좋아요가 취소된 상태입니다." };
        }

        // 좋아요 삭제
        await tx.like.delete({
          where: { groupId_participantId: { groupId, participantId } },
        });

        // 추천수 감소 (0 미만 방지)
        const updatedGroup = await tx.group.update({
          where: { id: groupId },
          data: {
            recommendCount: {
              decrement: 1,
            },
          },
        });

        // 음수 방어, recommendCount가 0 미만이면 다시 0으로 수정
        if (updatedGroup.recommendCount < 0) {
          await tx.group.update({
            where: { id: groupId },
            data: { recommendCount: 0 },
          });
        }

        return { message: "취소 완료" };
      });

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
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
        select: { recommendCount: true },
      });

      if (!group) {
        return res.status(404).json({ error: "그룹이 존재하지 않습니다." });
      }

      return res.status(200).json({ groupId, recommendCount: group.recommendCount });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "서버 오류" });
    }
  }
}

export default new LikesController();