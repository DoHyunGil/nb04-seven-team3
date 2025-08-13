import { PrismaClient } from "@prisma/client";
import { orderBy } from "lodash";
import { toDate } from "date-fns";
import { type } from "node:os";
const prisma = new PrismaClient();
const allowedRanks = ["월간순","주간순"] 
class RecordsController {
  createRecord(req, res, next){
  }

  async getRecordList(req, res, next){
    
    const {nickname} =req.query;

    // pagenation
    const {page, take, sort} = req.query;

    const pageNumber = Number(page) || 1;
    const takeNumber = Number(take) || 10;
    const skip = ( pageNumber - 1) * takeNumber;
    // 정렬 
    const sortType = ["최신순", "운동시간순"];

    // 가지치기
    if(skip < 0 ) return res.status(400).json({error: "skip은 음수가 되면 안됩니다"})
    
    if(!sortType.includes(sort)) return res.status(400).json({error: "정렬 기능 범위 확인 "});

    try {
      const recordList = await prisma.record.findMany({
        where : nickname ? {nickname:{contains: nickname, mode:"insensitive" } }: {}, // nickname 으로 조회 가능
        page: pageNumber ,
        take: takeNumber ,
        skip,

        select: { // 닉네임, 거리, 운동시간, 운동 종류, 사진 표시
          nickname : true,
          distance : true,
          activityType: true,
          photos: true,
          duration : true
        },

        //운동 시간 많은 순, 최신순으로 정렬
        orderBy:{
          updatedAt: "desc",
          duration: "desc"
        }
      })
      return res.status(200).json({
        message : "해당 리스트 조회 성공",
        data: recordList
      })
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  }


  getWeekDateRange(year, month, weekOfMonth) {
    const firstOfmonth  = new Date(year,month  - 1, 1);
    const startDate = new Date(firstOfmonth)
    startDate.setDate (1 +(  weekOfMonth  - 1)* 7)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return { startDate, endDate };
  }
  async  getRankRecord(req, res, next){
   
    // pagination
    const {page, take, sort: rank_type} = req.query;
    const pageNumber = Number(page) || 1;
    const takeNumber = Number(take) || 10;
    const skip = (pageNumber - 1) * takeNumber
    
    // prunning 
    if (isNaN(pageNumber) || isNaN(takeNumber)) return res.status(400).json({error: "페이지네이션 요청 리퀘스트 오류"})
    if (skip < 0) return res.status(400).json({error : "페이지네이션 스킵값오류"})
    if (!allowedRanks.includes(sort)) return res.status(400).json({error : "랭크 정렬 오류"})
    try {
      const now = new Date();
      let  dateFilter = {};
      if (rank_type === "월간순"){
        const oneMonthAgo =  new Date(now)
        oneMonthAgo.setMonth(now.getMonth() - 1)
        dateFilter = {recordDate :{gte: oneMonthAgo, lte : now}}

      }else if(rank_type === "주간순"){
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setWeek(now.getDate() - 7)
        dateFilter = { recordDate : {gte : oneWeekAgo, lte : now}}
      }
      const rankList = await prisma.record.findMany({
        page: pageNumber,
        take: takeNumber,
        skip,
        where:{
          duration: rank_type === "월간순" ? "MONTHLY" : "WEEKLY",
          ...dateFilter
        },
        orderBy:{
          recordCount: "desc",
        }, 
        select: {
          recordTime: true,
          nickname: true,
        }
      });
      res.status(200).json({
        message : "랭크 리스트 조회 성공",
        data : rankList
      });
      
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message)
    }
  }

  async getRecord(req, res, next){
    const groupId = req.params.groupId
    const { description, activityType, distance, nickname, recordTime, photos } = req.query;
    
    const distanceNumber = Number(distance);
    const recordTimeNumber = Number(recordTime);

    if(typeof activityType !== "string" || typeof nickname !== "string" ) return res.status(400).json(error.message);

    if(isNaN(groupId) || isNaN(distanceNumber) || isNaN(recordTimeNumber))return res.status(400).json(error.messsage);
    
    try {
      const uniqueRecord = await prisma.record.findUnique({
        where:{
          id: groupId,
        },
        select:{
          activityType: true,
          distance: true,
          recordTime : true,
          nickname: true,
          photos: true,
          description: true
        }
      });
      res.status(200).json({
        message:"해당 그룹의 운동기록 조회 성공",
        data : uniqueRecord
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  }
}

export default new RecordsController();
