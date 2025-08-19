import { PrismaClient, ActivityType } from "@prisma/client";

const prisma = new PrismaClient();
const allowedRanks = ["월간순", "주간순"];
class RecordsController {
  async getRecordList(req, res, next) {
    const { nickname, page, take, sortType } = req.query;

    // pagenation
    const pageNumber = Number(page) || 1;
    const takeNumber = Number(take) || 10;
    const skip = (pageNumber - 1) * takeNumber;
    const groupId = Number(req.params.groupId);

    console.log(
      typeof pageNumber,
      typeof takeNumber,
      typeof skip,
      typeof groupId
    );
    console.log("요청된 파라미터: ", req.params);
    // 가지치기
    if (skip < 0)
      return res.status(400).json({ error: "skip은 음수가 되면 안됩니다" });

    const sortMap = {
      최신순: { createdAt: "desc" },
      "운동 시간순": { duration: "desc" },
    };

    try {
      const uniqueGroup = await prisma.record.findUnique({
        where: { id: groupId },
      });
      if (!uniqueGroup)
        return res.status(400).json({ error: "그룹 존재 유무 확인" });
      const recordList = await prisma.record.findMany({
        where: {
          groupId,
          ...(nickname
            ? { nickname: { contains: nickname, mode: "insensitive" } }
            : {}), // nickname 으로 조회 가능
        },
        take: takeNumber,
        skip,

        select: {
          // 닉네임, 거리, 운동시간, 운동 종류, 사진 표시
          nickname: true,
          distance: true,
          activityType: true,
          photos: true,
          duration: true,
        },

        //운동 시간 많은 순, 최신순으로 정렬
        orderBy: sortMap[sortType] ? [sortMap[sortType]] : [],
      });

      if (recordList.length === 0) return res.status(200).json([]);
      return res.status(200).json({
        message: "해당 리스트 조회 성공",
        data: recordList,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  }

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
    // pagination
    const { page, take, sort: rank_type, nickname } = req.query;
    const pageNumber = Number(page) || 1;
    const takeNumber = Number(take) || 10;
    const skip = (pageNumber - 1) * takeNumber;

    // sort for weekly or monthly
    let start, end;
    if (rank_type === "월간순") {
      ({ start, end } = this.getCurrentMonthRange());
    } else if (rank_type === "주간순") {
      ({ start, end } = this.getPreviousWeekRange(2025, 8));
    }

    // prunning
    if (isNaN(pageNumber) || isNaN(takeNumber))
      return res.status(400).json({ error: "페이지네이션 요청 리퀘스트 오류" });
    if (skip < 0)
      return res.status(400).json({ error: "페이지네이션 스킵값오류" });
    if (!allowedRanks.includes(rank_type) && typeof rank_type !== "string")
      return res.status(400).json({ error: "랭크 정렬 오류" });
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
        take: takeNumber,
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
        message: "랭크 리스트 조회 성공",
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

    console.log("조회 할 배열 :", req.query);
    console.log(
      "거리 정수 :",
      typeof distanceNumber,
      "기록 정수 :",
      typeof recordTimeNumber,
      "그룹 인덱스 정수:",
      groupId
    );

    // validation
    if (typeof activityType !== "string" || typeof nickname !== "string")
      return res.status(400).json({ message: " 문자열 오류" });

    if (isNaN(groupId))
      return res.status(400).json({
        path: "groupId",
        message: " GroupId 는 정수 여야합니다",
      });

    if (isNaN(distanceNumber) || isNaN(recordTimeNumber))
      return res.status(400).json({ message: "정수 확인" });

    try {
      const record = await prisma.record.findUnique({
        where: {
          id: groupId,
        },
        data: {
          id: record.id,
          exerciseType: record.type,
          description: record.description,
          author: {
            id: record.author.id,
            nickname: record.author.nickname
          }
        }
      });
      res.status(200).json({
        message: "해당 그룹의 운동기록 조회 성공",
        data: record,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  }
}
export default RecordsController; // X new ()
