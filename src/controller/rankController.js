import { PrismaClient } from "@prisma/client";
import { record } from "zod";

const prisma = new PrismaClient();

class rankController {
  // 주간 월간 범위 함수
  async getRange(rangeType) {
    const today = new Date();
    if (rangeType === "MONTHLY") {
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        ),
      };
    } else if (rangeType === "WEEKLY") {
      const dayOfWeek = today.getDay();
      const start = new Date(today); // monday

      start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // last of week(sunday)
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    throw new Error("invalid rangeType");
  }
  // 범위 함수를 매개변수로 받는 비동기 함수
  async fetchRank(groupId, rangeType) {
    const { start, end } = await this.getRange(rangeType);

    //랭크 데이터 모델에서 데이터 정렬
    const records = await prisma.record.findMany({
      where: {
        author: { groupId },
        createdAt: { gte: start, lte: end },
      },
      include: { author: true },
    });
    let records_map = {};
    records.forEach((rec) => {
      const pid = rec.authorId;
      if (!records_map[pid]) {
        records_map[pid] = {
          authorId: pid,
          nickname: rec.author.nickname,
          recordTime: 0,
          recordCount: 0,
        };
      }
      records_map[pid].recordCount += 1;
      console.log(rec.duration);
      records_map[pid].recordTime += rec.duration;
    });
    const rankList = Object.values(records_map)
      .sort((a, b) => b.recordCount - a.recordCount)
      .map((g, idx) => ({ ...g, rank: idx + 1 }));
    return rankList;
  }
  // 월간 혹은 주간에 따른 운동 기록이 많은 그룹 순서대로 나타내기
  async getRankList(req, res) {
    console.log("groupId:", req.params.groupId);
    try {
      const groupId = Number(req.params.groupId);

      const duration = req.query.duration || "WEEKLY";

      if (!groupId || isNaN(groupId))
        return res.status(400).json("check groupId");
      if (typeof duration !== "string")
        throw new Error("duration은 문자열이여야 합니다");
      const weeklyRank = await this.fetchRank(Number(groupId), "WEEKLY");
      const monthlyRank = await this.fetchRank(Number(groupId), "MONTHLY");

      //에러 코드
      // const [weeklyRank, monthlyRank] = promise.all([
      //   this.fetchRank(Number(groupId), "WEEKLY"),
      //   this.fetchRank(Number(groupId), "MONTHLY"),
      // ]);

      const rankList = duration === "WEEKLY" ? weeklyRank : monthlyRank;
      res.status(200).json(rankList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
export default new rankController();
