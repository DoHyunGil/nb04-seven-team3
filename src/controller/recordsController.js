import { PrismaClient, ActivityType } from "@prisma/client";
import createError from "http-errors";

const prisma = new PrismaClient();

class RecordsController {
  async getRecordList(req, res, next) {
    const groupId = Number(req.params.groupId);
    const { page, limit, order, orderBy, search } = req.query;

    let sortingOrder = { createdAt: order };
    if (orderBy == "time") sortingOrder = { duration: order };

    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          records: {
            where: {
              author: {
                nickname: {
                  contains: search,
                },
              },
            },
            include: {
              author: true,
            },
            orderBy: sortingOrder,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
          },
          _count: {
            select: { records: true },
          },
        },
      });

      const result = group.records.map((record) => ({
        id: record.id,
        exerciseType: record.type,
        description: record.description,
        time: record.duration,
        distance: record.distance,
        photos: record.photos,
        author: {
          id: record.author.id,
          nickname: record.author.nickname,
        },
      }));

      const count = group._count.records;

      return res.status(200).json({
        data: result,
        total: count,
      });
    } catch (err) {
      return next(createError(500, err));
    }
  }

  createRecord = async (req, res) => {
    const groupIdNum = Number(req.params.groupId); // groupId 문자열 -> 숫자 변환
    const {
      exerciseType,
      description,
      time,
      distance,
      //photos,
      authorNickname,
      authorPassword,
    } = req.body;

    // groupId 검증
    if (isNaN(groupIdNum)) {
        return res.status(400).json({ error: "잘못된 groupId 값입니다." });
      }

    // 필수 값 검증
    if (
      !exerciseType ||
      !description ||
      time == null ||
      distance == null ||
      !authorNickname ||
      !authorPassword
    ) {
      return res
        .status(400)
        .json({ error: "필수 작성 내용이 누락되었습니다." });
    }

    // ActivityType 매핑
    const typeMap = {
      run: ActivityType.RUN,
      bike: ActivityType.BIKE,
      swim: ActivityType.SWIM,
    };

    const activityTypeEnum = typeMap[exerciseType.toLowerCase()];
    if (!activityTypeEnum) {
      return res.status(400).json({ error: "Invalid ActivityType" });
    }

    try {
      // 참여자 인증
      const participant = await prisma.participant.findFirst({
      where: {
        nickname: authorNickname,
        groupId: groupIdNum, 
      },
      select: {
        id: true,
        nickname: true,
        password: true,
      },
    });

    if (!participant || participant.password !== authorPassword) {
    return res
      .status(401)
      .json({ error: "참여자가 존재하지 않거나 인증에 실패했습니다." });
    }
      // 사진 배열 변환
      //const photosArray = Array.isArray(photos) ? photos : [];

      // Record 생성
      const newRecord = await prisma.record.create({
        data: {
          type: activityTypeEnum,
          description,
          duration: time,
          distance,
          //photos: photosArray,
          groupId: groupIdNum,
          authorId: participant.id,
        },
        include: { author: true },
      });

      // 응답 데이터 변환
      //const photoUrls = newRecord.photos.flatMap((p) => p.photos);

      return res.status(201).json({
        id: newRecord.id,
        type: newRecord.type,
        description: newRecord.description,
        time: newRecord.duration,
        distance: newRecord.distance,
        photos: [],
        //photos: newRecord.photos,  << DB에 저장된 string[], 교체 예정.
        author: {
          id: newRecord.author.id,
          nickname: newRecord.author.nickname,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}

export default new RecordsController();
