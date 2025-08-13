import { PrismaClient, ActivityType } from "@prisma/client";

const prisma = new PrismaClient();

class RecordsController {
  async createRecord(req, res) {
    const { groupId } = req.params;
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
    if (!Number.isInteger(Number(groupId))) {
      return res.status(400).json({
        path: "groupId",
        message: "groupId must be integer",
      });
    }

    //  필수 값 검증
    if (
      !activityTypeStr ||
      !description ||
      time == null ||
      distance == null ||
      !authorNickname ||
      !authorPassword
    ) {
      return res.status(400).json({ error: "필수 작성 내용이 누락되었습니다." });
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
      // 그룹 존재 여부 확인
      const group = await prisma.group.findUnique({
        where: { id: Number(groupId) },
      });
      if (!group) {
        return res.status(404).json({ error: "그룹이 존재하지 않습니다." });
      }

      // 참여자 인증
      const participant = await prisma.participant.findUnique({
        where: { nickname: authorNickname },
      });
      if (!participant || participant.password !== authorPassword) {
        return res
          .status(401)
          .json({ error: "참여자가 존재하지 않거나 인증에 실패했습니다." });
      }

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
          groupId: Number(groupId),
          photos: {
            create: photosArray.map((url) => ({
              photos: [url],
            })),
          },
        },
        include: {
          photos: true,
          author: true,
        },
      });

      // 응답 데이터 변환
      const photoUrls = newRecord.photos.flatMap((p) => p.photos);

      return res.status(201).json({
        id: newRecord.id,
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
  }
}

export default new RecordsController();
