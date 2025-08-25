import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class GroupsController {
  //그룹 목록 조회
  async getAllGroups(req, res) {
    try {
      const { page, limit, order, orderBy, search } = req.validatedQuery;

      const pageNum = Math.max(page, 1);
      const limitNum = Math.min(Math.max(limit, 1), 10);
      const where = search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {};

      const total = await prisma.group.count({ where });
      if ((pageNum - 1) * limitNum >= total) {
        return res
          .status(400)
          .json({ error: "요청한 페이지가 존재하지 않습니다." });
      }

      const data = await prisma.group.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy:
          orderBy === "participantCount"
            ? { _count: { participant: order } }
            : { [orderBy]: order },
        include: {
          _count: {
            select: { participant: true },
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
        },
      });
      //response body 평탄화
      const result = data.map(({ _count, ...groups }) => ({
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
          createdAt: groups.createdAt.toISOString(),
          updatedAt: groups.updatedAt.toISOString(),
        },
        participants: groups.participant.map((p) => ({
          id: p.id,
          nickname: p.nickname,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
        createdAt: groups.createdAt.toISOString(),
        updatedAt: groups.updatedAt.toISOString(),
        badges: groups.badgeYn,
      }));

      res.json({ data: result, total });
    } catch (error) {
      res.status(500).json({ error: `서버 오류 ${error.message}` });
    }
  }

  // 그룹 상세 조회
  async getGroupById(req, res) {
    try {
      const groupId = req.validatedParams.groupId;
      const data = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
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
        return res.status(404).json({ error: "그룹을 찾을 수 없습니다." });
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
          createdAt: data.createdAt.toISOString(),
          updatedAt: data.updatedAt.toISOString(),
        },
        participants: data.participant.map((p) => ({
          id: p.id,
          nickname: p.nickname,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
        createdAt: data.createdAt.toISOString(),
        updatedAt: data.updatedAt.toISOString(),
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
    console.log("groupsController createGroupRecord()..");

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
          .json({ error: "필수 작성 내용이 누락되었습니다." });
      }

      //nickname 중복방지 체크
      const dupNickname = await prisma.group.findMany({
        where: {
          nickname: nickname,
        },
        select: { id: true, nickname: true, password: true },
      });
      if (isNaN(dupNickname)) {
        return res.status(400).json({ error: "중복된 닉네임이 존재합니다." });
      }

      //그룹 생성
      const result = await prisma.$transaction(async (tx) => {
        //1. 그룹 생성
        const group = await tx.group.create({
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
        console.log(
          `group: ${group.id}, nickname: ${group.nickname}, password: ${group.password}`
        );
        //2. 참가자 등록(그룹오너) : 그룹생성시 사용했던 nickname, password 자동부과
        const participant = await tx.participant.create({
          data: {
            nickname: group.nickname,
            password: group.password,
            groupId: group.id,
          },
        });
      });
      res.status(200).send({ message: "그룹생성 되었습니다!" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: "그룹등록에 실패했습니다!" });
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
          .json({ error: "필수 작성 내용이 누락되었습니다." });
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
      res.status(400).json({ error: "그룹수정에 실패했습니다!" });
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

      const result = await prisma.$transaction(async (tx) => {
        //1. 참가자삭제
        const participant = await tx.participant.deleteMany({
          where: { groupId: id },
        });
        //2. 그룹삭제
        const group = await tx.group.delete({
          where: { id },
        });
      });
      res.status(200).send({ message: "그룹삭제 되었습니다!" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: "그룹삭제에 실패했습니다!" });
    }
  };
}

export default new GroupsController();
