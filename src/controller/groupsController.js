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

  /**
   *  시스템명 : SEVEN
   *  API명 : 그룹 등록
   *  @param : {*} RequestBody
   */
  createGroupRecord = async (req, res) => {
    console.log('groupsController createGroupRecord()..');

    try {
      const {
        name,
        description,
        photoUrl,
        goalRep,
        likeCount = 0,
        badgeYn = false,
        point = 0,
        discordWebhookUrl,
        discordInviteUrl,
        nickname,
        password,
      } = req.body;

      //필수값 검증
      if (
        !name ||
        !description ||
        !photoUrl ||
        !goalRep ||
        !discordWebhookUrl ||
        !discordInviteUrl ||
        !nickname ||
        !password
      ) {
        return res
          .status(400)
          .json({ error: '필수 작성 내용이 누락되었습니다.' });
      }

      //nickname 중복방지 체크
      const dupNickname = await prisma.group.findMany({
        where: {
          nickname: nickname,
        },
        select: { id: true, nickname: true, password: true },
      });
      if (isNaN(dupNickname)) {
        return res.status(400).json({ error: '중복된 닉네임이 존재합니다.' });
      }

      const group = await prisma.group.create({
        data: {
          name,
          description,
          photoUrl,
          goalRep,
          likeCount,
          badgeYn,
          point,
          discordWebhookUrl,
          discordInviteUrl,
          nickname,
          password,
        },
      });
      res.status(200).send(group);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: '그룹등록에 실패했습니다!' });
    }
  };

  /**
   *  시스템명 : SEVEN
   *  API명 : 그룹 수정
   *  @param : {*} RequestBody
   */
  updateGroupRecord = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const {
        name,
        description,
        photoUrl,
        goalRep,
        likeCount = 0,
        badgeYn = false,
        point = 0,
        discordWebhookUrl,
        discordInviteUrl,
        nickname,
        password,
      } = req.body;

      //필수값 검증
      if (
        !name ||
        !description ||
        !photoUrl ||
        !goalRep ||
        !discordWebhookUrl ||
        !discordInviteUrl ||
        !nickname ||
        !password
      ) {
        return res
          .status(400)
          .json({ error: '필수 작성 내용이 누락되었습니다.' });
      }

      console.log(`groupsController updateGroupRecord()..  groupId:${id} `);

      const group = await prisma.group.update({
        where: { id },
        data: {
          name,
          description,
          photoUrl,
          goalRep,
          likeCount,
          badgeYn,
          point,
          discordWebhookUrl,
          discordInviteUrl,
          nickname,
          password,
        },
      });
      res.status(200).send(group);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: '그룹수정에 실패했습니다!' });
    }
  };

  /**
   *  시스템명 : SEVEN
   *  API명 : 그룹 삭제
   *  @param : {*} RequestBody
   */
  deleteGroupRecord = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`groupsController deleteGroupRecord()..  groupId:${id} `);

      const group = await prisma.group.delete({
        where: { id },
      });
      res.status(200).send(group);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: '그룹삭제에 실패했습니다!' });
    }
  };
}

export default new GroupsController();
