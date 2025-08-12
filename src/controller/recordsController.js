import { PrismaClient } from "@prisma/client";
import { orderBy } from "lodash";

const prisma = new PrismaClient();

class RecordsController {
  createRecord(req, res, next){
  }

  async getRecordList(req, res, next){
    // pagenation
    const {page, take, sort} = req.query;

    const pageNumber = Number(page) || 1;
    const takeNumber = Number(take) || 10;
    const skip = ( pageNumber - 1) * takeNumber;
    // 정렬 
    const sortType = ["최신순", "운동시간순"];

    // 가지치기
    if(skip < 0 ) return res.status(400).json({error: "skip은 음수가 되면 안됩니다"})
    
    if(!sortType.include(sort)) return res.status(400).json({error: "정렬 기능 범위 확인 "});

    try {
      const recordList = await prisma.record.findMany({
        where:{
          page:{pageNumber},
          take:{takeNumber},
          skip
        },

        select:{ // 닉네임, 거리, 운동시간, 운동 종류, 사진 표시
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
      res.status(500).json(error.message)
    }
  }
  getRankRecord(req, res, next){
   
    
    // prunning 
   
    
    try {
      const rank = await.prisma.record.findMany({})
    } catch (error) {
      
    }
  }

  getRecord(req, res, next){

    try {
      
    } catch (error) {
      
    }
  }
}

export default new RecordsController();
