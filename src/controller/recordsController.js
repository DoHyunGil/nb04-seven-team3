import { PrismaClient, ActivityType } from "@prisma/client";

const prisma = new PrismaClient();
const allowedRanks = ["MONTHLY", "WEEKLY"];

class RecordsController {
  async getRecordList(req, res, next) {
    const groupId = Number(req.params.groupId);
    const { page, limit, order, orderBy, serach } = req.query;

    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          records: {
            include: {
              author: true,
            },
          },
        },
      });

      const result = group.records.map((record) => ({
        id: record.id,
        exerciseType: record.type,
        description: record.description,
        time: record.duration,
        distance: record.distance,
        photos: [],
        author: {
          id: record.author.id,
          nickname: record.author.nickname,
        },
      }));

      const count = result.length;

      return res.status(200).json({
        data: result,
        total: count,
      });
    } catch (err) {
      res.status(400).send({ message: err });
    }
  }

  // async getRecordList(req, res) {
  //   const { nickname, page, limit, sortType, like } = req.query;

  //   // Pagination
  //   const pageNumber = Number(page) || 1;
  //   const limitNumber = Number(limit) || 10;
  //   const skip = (pageNumber - 1) * limitNumber;
  //   const groupId = Number(req.params.groupId);

  //   console.log(
  //     typeof pageNumber,
  //     typeof limitNumber,
  //     typeof skip,
  //     typeof groupId,
  //     typeof like
  //   );
  //   console.log("Requested query: ", req.query);
  //   console.log("Requseted data: ", req);
  //   // Validation
  //   if (skip < 0)
  //     return res.status(400).json({
  //       error: "Skip value cannot be negative",
  //     });
  //   if (like < 0)
  //     return res.status(400).json({
  //       error: "Like value cannot be negative",
  //     });

  //   const sortMap = {
  //     latest: { createdAt: "desc" },
  //     duration: { duration: "desc" },
  //   };

  //   try {
  //     const uniqueGroup = await prisma.record.findUnique({
  //       where: { id: groupId },
  //     });
  //     if (!uniqueGroup)
  //       return res.status(400).json({ error: "Group does not exist" });

  //     const recordList = await prisma.record.findMany({
  //       where: {
  //         groupId,
  //         ...(nickname
  //           ? { nickname: { contains: nickname, mode: "insensitive" } }
  //           : {}),
  //       },
  //       limit: limitNumber,
  //       skip,
  //       orderBy: sortMap[sortType] ? [sortMap[sortType]] : [],
  //     });

  //     if (recordList.length === 0) return res.status(200).json([]);
  //     return res.status(200).json({
  //       message: "Record list retrieved successfully",
  //       data: recordList,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json(error.message);
  //   }
  // }

  getPreviousWeekRange(year, month) {
    const firstOfMonth = new Date(year, month - 1, 1);
    return {
      start: startOfWeek(subWeeks(firstOfMonth, 1), { weekStartsOn: 1 }),
      end: endOfWeek(subWeeks(firstOfMonth, 1), { weekStartsOn: 1 }),
    };
  }

  getCurrentMonthRange() {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
  }

  async getRankRecords(req, res, next) {
    // Pagination
    const { page, limit, sort: rank_type, nickname } = req.query;
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Determine weekly/monthly rank range
    let start, end;
    if (rank_type === "MONTHLY") {
      ({ start, end } = this.getCurrentMonthRange());
    } else if (rank_type === "WEEKLY") {
      ({ start, end } = this.getPreviousWeekRange(2025, 8));
    }

    console.log("req query: ", req.query);

    // Validation
    if (isNaN(pageNumber) || isNaN(limitNumber))
      return res.status(400).json({ error: "Invalid pagination values" });
    if (skip < 0)
      return res.status(400).json({ error: "Skip value must be positive" });
    if (!allowedRanks.includes(rank_type) && typeof rank_type !== "string")
      return res.status(400).json({ error: "Invalid sort type for rank list" });

    const dateFilter = {
      recordDate: {
        gte: start,
        lte: end,
      },
    };

    const whereCondition = {
      ...dateFilter,
      ...(nickname
        ? { nickname: { contains: nickname, mode: "insensitive" } }
        : {}),
    };

    try {
      const rankList = await prisma.record.findMany({
        limit: limitNumber,
        skip,
        where: whereCondition,
        orderBy: {
          recordCount: "desc",
        },
        select: {
          recordTime: true,
          nickname: true,
        },
      });

      res.status(200).json({
        message: "Rank list retrieved successfully",
        data: rankList,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  }

  async getRecord(req, res, next) {
    const groupId = Number(req.params.groupId);
    const {
      description,
      activityType,
      distance,
      nickname,
      recordTime,
      photos,
    } = req.query;

    const distanceNumber = Number(distance);
    const recordTimeNumber = Number(recordTime);

    console.log("Query parameters:", req.query);
    console.log(
      "Distance type:",
      typeof distanceNumber,
      "Record time type:",
      typeof recordTimeNumber,
      "Group index type:",
      typeof groupId
    );

    // Validation
    if (typeof activityType !== "string")
      return res
        .status(400)
        .json({ message: "Exercise type must be a string" });
    if (typeof nickname !== "string")
      return res.status(400).json({ message: "Nickname must be a string" });

    if (isNaN(groupId))
      return res.status(400).json({
        path: "groupId",
        message: "groupId must be an integer",
      });

    if (isNaN(distanceNumber))
      return res.status(400).json({ message: "Distance must be an integer" });
    if (isNaN(recordTimeNumber))
      return res
        .status(400)
        .json({ message: "Record time must be an integer" });

    try {
      // Check if group exists
      const group = await prisma.group.findUnique({ where: { groupId } });
      if (!group)
        return res.status(404).json({ error: "Group does not exist" });

      // Fetch records for the group
      const record = await prisma.record.findMany({
        where: { id: groupId },
        ...(nickname && { nickname }),
        ...(description && { description }),
        ...(activityType && { activityType }),
        ...(distance && { distance: distanceNumber }),
        ...(recordTime && { recordTime: recordTimeNumber }),
        ...(photos && { photos }),
      });

      res.status(200).json({
        message: "Successfully retrieved the group's workout records",
        data: record,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  }

  createRecord = async (req, res) => {
    const groupIdNum = Number(req.params.groupId); // groupId 문자열 -> 숫자 변환
    const {
      ActivityType: activityTypeStr,
      description,
      time,
      distance,
      photos,
      authorNickname,
      authorPassword,
    } = req.body;

    // groupId 검증
    if (!Number.isInteger(groupIdNum)) {
      return res.status(400).json({
        path: "groupId",
        message: "groupId must be integer",
      });
    }

    // 필수 값 검증
    if (
      !activityTypeStr ||
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
    const activityTypeEnum = typeMap[activityTypeStr.toLowerCase()];
    if (!activityTypeEnum) {
      return res.status(400).json({ error: "Invalid ActivityType" });
    }

    try {
      /*
      // 그룹 존재 여부 확인
      // select로 필요한 필드만 가져오기, 필요 없는 필드까지 가져오지 않도록 조건 추가
      const group = await prisma.group.findFirst({
        where: { id: groupIdNum },
        select: { id: true, name: true },
      });
      if (!group) {
        return res.status(404).json({ error: "그룹이 존재하지 않습니다." });
      }

      // 참여자 인증
      // groupId와 nickname 조건을 같이 걸어 조회, nickname 단독 조회 대신 groupId 조건도 포함 가능
      const participant = await prisma.participant.findFirst({
        where: {
          nickname: authorNickname,
          groups: { some: { id: groupIdNum } },
        },
        select: { id: true, nickname: true, password: true },
      });
      if (!participant || participant.password !== authorPassword) {
        return res
          .status(401)
          .json({ error: "참여자가 존재하지 않거나 인증에 실패했습니다." });
      }
          */

      // 사진 배열 변환
      const photosArray = Array.isArray(photos) ? photos : [];

      // Record 생성
      const newRecord = await prisma.record.create({
        data: {
          type: activityTypeEnum,
          description,
          duration: time,
          distance,
          authorId: participant.id,
          groupId: groupIdNum,
          photos: {
            create: photosArray.map((url) => ({ photos: [url] })),
          },
        },
        include: { photos: true, author: true },
      });

      // 응답 데이터 변환
      const photoUrls = newRecord.photos.flatMap((p) => p.photos);

      return res.status(201).json({
        id: newRecord.id,
        type: newRecord.type,
        description: newRecord.description,
        time: newRecord.duration,
        distance: newRecord.distance,
        photos: photoUrls,
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
