import { PrismaClient} from "@prisma/client";


const prisma = new PrismaClient();

class rankController {
    // 주간 월간 범위 함수
    async getRange(rangeType) {
        const today = new Date()
        if( rangeType === "MONTHLY"){
            return { 
                start :new Date(today.getFullYear(), today.getMonth() , 1),
                end : new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59,59,999)
            }
        }
        else if(rangeType === "WEEKLY"){
            const dayOfWeek = today.getDay()
            const end = new Date(today); // monday

            end.setDate(today.getDate() -  (dayOfWeek === 0 ? 6: dayOfWeek - 1)) // last of week(sunday)
            end.setHours(0,0,0,0)

            const start = new Date(end)
            start.setDate(start.getDate() - 6)
            start.setHours(23, 59, 59,999)
            return {start, end }
        }
        throw new Error("invalid rangeType")
    }
    // 범위 함수를 매개변수로 받는 비동기 함수 
    async fetchRank(groupId, rangeType){
        const{start, end} = await this.getRange(rangeType)
        console.log(rangeType);
        console.log(this)
        //랭크 데이터 모델에서 데이터 정렬
        const ranking = await prisma.participant.groupBy({
            by:['id'],
            _count: { id: true },
            where:{
                ...(groupId ?{groupId : Number(groupId)}: {}),
                //createdAt:{gte :start, lte: end},
            },
            orderBy:{_count:{id:"desc"}}
        })
        console.log("ranking:",ranking)
        return ranking.map((g, idx) => ({
            rank :idx + 1,
            participantId: g.participantId,
            recordCount : g._count.id
        }))
    }

    // 월간 혹은 주간에 따른 운동 기록이 많은 그룹 순서대로 나타내기
    async getRankList(req, res){
         console.log("groupId:", req.params.groupId);
        try {
            const {groupId} = req.params;
            const duration = req.query.duration || "WEEKLY";
            console.log(duration)
           
    
            if(!groupId || isNaN(groupId)) return res.status(400).json("check groupId")
            if (typeof duration !== "string") throw new Error("duration은 문자열이여야 합니다");
    
            const WEEKLY = await this.fetchRank(Number(groupId), "WEEKLY")
            const MONTHLY = await this.fetchRank(Number(groupId),  "MONTHLY")

           const orderBy = duration === "WEEKLY"
            ? { weeklyCount: "desc" }
            : { monthlyCount: "desc" };
            const rankList = await prisma.group.findMany({
                where:{ id: groupId},
                orderBy
            })
            console.log(rankList)
            res.status(200).json(rankList)
        } catch (error) {
              res.status(500).json({ error: error.message });
        }

    }
    
}
export default new rankController();