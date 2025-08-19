import { PrismaClient, ActivityType } from "@prisma/client";

const prisma = new PrismaClient();

class RecordsController {
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

    /*
    try {
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

