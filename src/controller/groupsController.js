import { PrismaClient } from '@prisma/client';

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
      const data = await prisma.group.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy:
          orderBy === 'participantCount'
            ? { participant: { _count: order } }
            : { [orderBy]: order },
        select: {
          id: true,
          name: true,
          description: true,
          photoUrl: true,
          goalRep: true,
          discordWebhookUrl: true,
          discordInviteUrl: true,
          likeCount: true,
          createdAt: true,
          updatedAt: true,
          badgeYn: true,
          nickname: true,
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
        participant: {
          select: {
            id: true,
            nickname: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      });
      //response body 평탄화
      const result = data.map((groups) => ({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        photoUrl: groups.photoUrl,
        goalRep: groups.goalRep,
        discordWebhookUrl: groups.discordWebhookUrl,
        discordInviteUrl: groups.discordInviteUrl,
        likeCount: groups.likeCount,
        tags: groups.tags.map((t) => t.tag.name),
        owner: {
          id: groups.id,
          nickname: groups.nickname,
          createdAt: groups.createdAt.getTime(),
          updatedAt: groups.updatedAt.getTime(),
        },
        participants: groups.participant.map((p) => ({
          id: p.id,
          nickname: p.nickname,
          createdAt: p.createdAt.getTime(),
          updatedAt: p.updatedAt.getTime(),
        })),
        createdAt: groups.createdAt.getTime(),
        updatedAt: groups.updatedAt.getTime(),
        badges: groups.badgeYn,
      }));

      res.json({ data: result, total: result.length });
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
      const data = await prisma.group.findUnique({
        where: { id: groupId },
        select: {
          id: true,
          name: true,
          description: true,
          photoUrl: true,
          goalRep: true,
          discordWebhookUrl: true,
          discordInviteUrl: true,
          likeCount: true,
          createdAt: true,
          updatedAt: true,
          badgeYn: true,
          nickname: true,
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
          participant: {
            select: {
              id: true,
              nickname: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!data) {
        return res.status(404).json({ error: '그룹을 찾을 수 없습니다.' });
      }

      //response body 평탄화
      const result = {
        id: data.id,
        name: data.name,
        description: data.description,
        photoUrl: data.photoUrl,
        goalRep: data.goalRep,
        discordWebhookUrl: data.discordWebhookUrl,
        discordInviteUrl: data.discordInviteUrl,
        likeCount: data.likeCount,
        tags: data.tags.map((t) => t.tag.name),
        owner: {
          id: data.id,
          nickname: data.nickname,
          createdAt: data.createdAt.getTime(),
          updatedAt: data.updatedAt.getTime(),
        },
        participants: data.participant.map((p) => ({
          id: p.id,
          nickname: p.nickname,
          createdAt: p.createdAt.getTime(),
          updatedAt: p.updatedAt.getTime(),
        })),
        createdAt: data.createdAt.getTime(),
        updatedAt: data.updatedAt.getTime(),
        badges: data.badgeYn,
      };

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: `서버 오류 ${error.message}` });
    }
  }
}

export default new GroupsController();
