import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class GroupsController {
  //그룹 목록 조회
  async getAllGroups(req, res) {
    try {
      const { page, limit, order, orderBy, search } = req.validatedQuery;

      const DEFAULT_PAGE = 1;
      const MIN_LIMIT = 1;
      const MAX_LIMIT = 10;

      const pageNum = Math.max(page, DEFAULT_PAGE);
      const limitNum = Math.min(Math.max(limit, MIN_LIMIT), MAX_LIMIT);

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
        badges: Array.isArray(data.badges) ? data.badges : [],
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
    const resultBody = {};

    try {
      const {
        name,
        description,
        photoUrl = '',
        goalRep,
        likeCount = 0,
        badgeYn = false,
        point = 0,
        discordWebhookUrl,
        discordInviteUrl,
        ownerNickname,
        ownerPassword,
      } = req.body;

      //필수값 검증
      if (
        !name ||
        !description ||
        !goalRep ||
        !discordWebhookUrl ||
        !discordInviteUrl ||
        !ownerNickname ||
        !ownerPassword
      ) {
        return res
          .status(400)
          .json({ error: "필수 작성 내용이 누락되었습니다." });
      }

      //그룹 생성
      const results = await prisma.$transaction(async (tx) => {
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
            nickname: ownerNickname,
            password: ownerPassword,
          },
        });
        //2. 참가자 등록(그룹오너) : 그룹생성시 사용했던 nickname, password 자동부과
        const participant = await tx.participant.create({
          data: {
            nickname: group.nickname,
            password: group.password,
            groupId: group.id,
          },
        });
        return {group, participant};
      });

      //Response Body 전송
      const resBody = {
        groupId: results.group.groupId,
        id: results.group.id,
        name: results.group.name,
        description: results.group.description,
        photoUrl: results.group.photoUrl,
        goalRep: results.group.goalRep,
        discordWebhookUrl: results.group.discordWebhookUrl,
        discordInviteUrl: results.group.discordInviteUrl,
        likeCount: results.group.likeCount,
        tags: [ results.group.tags ],
        owner: {
          id: results.group.id,
          nickname: results.group.nickname,
          createdAt: results.group.createdAt,
          updatedAt: results.group.updatedAt
        },
        participants: [
          {
            id: results.participant.id,
            nickname: results.participant.nickname,
            createdAt: results.participant.createdAt,
            updatedAt: results.participant.updatedAt
          }
        ],
        createdAt: results.group.createdAt,
        updatedAt: results.group.updatedAt,
        badges: [ results.group.badges ]
      };
      return res.status(201).json(resBody);

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
        photoUrl = '',
        goalRep,
        likeCount = 0,
        badgeYn = false,
        point = 0,
        discordWebhookUrl,
        discordInviteUrl,
        ownerNickname,
        ownerPassword,
      } = req.body;

      //필수값 검증
      if (
        !name ||
        !description ||
        !goalRep ||
        !discordWebhookUrl ||
        !discordInviteUrl ||
        !ownerNickname ||
        !ownerPassword
      ) {
        return res
          .status(400)
          .json({ error: "필수 작성 내용이 누락되었습니다." });
      }

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
          nickname: ownerNickname,
          password: ownerPassword,
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


    /**
     *  그룹참가등록 
     * @param {*} nickname
     * @param {*} password
     * @param {*} groupId(FK)
     */
    addGroupParticipant = async (req, res) => {
        try{
            const reqGroupId = parseInt(req.params.groupId);
            const {
                nickname,
                password
            } = req.body;
            //필수값검증
            if(
                !nickname ||
                !password ||
                !reqGroupId
            ){
                return res.status(400).json({error: "필수 작성 내용이 누락되었습니다."})
            };
            //가입여부 중복체크
            const dupaddNickName = await prisma.participant.findFirst({
                where: {
                    groupId: reqGroupId,
                    nickname: nickname
                }
            });
            if (isNaN(dupaddNickName)) {
                return res.status(400).json({error: "이미 가입한 그룹입니다."});
            };
            //그룹참가자 등록
            const participant = await prisma.participant.create({
                data: {
                    nickname,
                    password,
                    groupId: reqGroupId
                }
            });
            //response 객체등록을 위한 조회
            const group = await prisma.group.findUnique({
              where: {
                id: reqGroupId
              }
            });

            const resBody = {
              groupId: group.id,
              id: group.id,
              name: group.name,
              description: group.description,
              photoUrl: group.photoUrl,
              goalRep: group.goalRep,
              discordWebhookUrl: group.discordWebhookUrl,
              discordInviteUrl: group.discordInviteUrl,
              likeCount: group.likeCount,
              tags: [ group.tags ],
              owner: {
                id: group.id,
                nickname: group.nickname,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt
              },
              participants: [
                {
                  id: participant.id,
                  nickname: participant.nickname,
                  createdAt: participant.createdAt,
                  updatedAt: participant.updatedAt
                }
              ],
              createdAt: participant.createdAt,
              updatedAt: participant.updatedAt,
              badges: [ group.badges ]
            };
            res.status(201).json(resBody);

        } catch (error) {
            console.log(error);
            res.status(400).json({error: "그룹참가 등록에 실패했습니다!"});
        };
    };

    /**
     * 그룹참가취소 
     * @param {*} groupId
     */
    deletelGroupParticipant = async (req, res) => {
        try{
            const groupId = parseInt(req.params.groupId);
            console.log(`[GroupsController] deletelGroupParticipant groupId: ${groupId}`);
            const {
              nickname,
              password
            } = req.body;
            //필수값 검증
            if( !nickname ||
                !password 
            ){
              return res.status(400).json({error: "필수 작성 내용이 누락되었습니다."})
            };
            //비밀번호 일치검증
            const checkPassword = await prisma.participant.findFirst({
              where: {
                groupId,
                nickname,
                password
              }
            });
            //일치않으면 가입취소 불가            
            if(!checkPassword){
              return res.status(401).json({error: "Wroing password"});
            };
            //삭제하기 위한 키값 조회
            const participant = await prisma.participant.findFirst({
               where: {
                    groupId: groupId,
                    nickname: nickname,
                    password: password
               } 
            });
            //가입취소 처리
            const result = await prisma.participant.delete({
                where: { 
                    id: participant.id,
                    groupId,
                    nickname,
                    password
                  }
            });
            //가입취소 결과반환
            const resBody = {
              nickname: result.nickname,
              password: result.password
            };
            res.status(200).json(resBody);

        } catch (error) {
            console.log(error);
            res.status(400).json({error: "그룹참가 취소에 실패했습니다!"});
        };
    };
}

export default new GroupsController();
