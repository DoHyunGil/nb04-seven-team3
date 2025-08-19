import { PrismaClient } from '@prisma/client';
import { group } from 'console';

const prisma = new PrismaClient();

class GroupsController {
  //그룹 목록 조회
  async getAllGroups(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        order = 'desc',
        orderBy = 'createdAt',
        search = '',
      } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const where = search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {};
      const groups = await prisma.group.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy:
          orderBy === 'participantCount'
            ? { groupParticipants: { _count: order } }
            : { [orderBy]: order },
        select: {
          id: true,
          name: true,
          description: true,
          photoUrl: true,
          goalRep: true,
          discordWebhookUrl: true,
          discordInviteUrl: true,
          recommendCount: true,
          createdAt: true,
          updatedAt: true,
          badgeYn: true,
          owner: {
            select: {
              id: true,
              nickname: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
          groupParticipants: {
            select: {
              participant: {
                select: {
                  id: true,
                  nickname: true,
                  createdAt: true,
                  undatedAt: true,
                },
              },
            },
          },
        },
      });
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: `서버 오류 ${error.message}` });
    }
  }

  // 그룹 상세 조회
  async getGroupById(req, res) {
    try {
      const groupId = Number(req.params.groupId);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: 'groupId가 유효하지 않습니다.' });
      }
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: {
          name: true,
          owner: {
            select: {
              nickname: true,
            },
          },
          description: true,
          photoUrl: true,
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
          goalRep: true,
          _count: { select: { groupParticipants: true } },
          discordInviteUrl: true,
        },
      });
      const { _count, ...rest } = group;

      res.status(200).json({
        ...rest,
        participantCount: _count.groupParticipants,
      });
    } catch (error) {
      res.status(500).json({ error: `서버 오류 ${error.message}` });
    }
  }
}

export default new GroupsController();
