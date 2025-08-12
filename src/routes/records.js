import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

//POST -- 그룹 운동 기록 생성
router.post("/groups/:groupId/records", async (req, res) => {
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

  // 검증 -- groupId 필수로 정수 체크
    if (!Number.isInteger(Number(groupId))) {
    return res.status(400).json({  //응답 -- 400 BAD REQUEST
      path: "groupId",
      message: "groupId must be integer",
    });
  }

  //검증 -- #필수 작성 내용 누락 확인
    if (!ActivityType || !description || !time == null || !distance == null || !authorNickname || !authorPassword) {
    return res.status(400).json({ error: "필수 작성 내용이 누락되었습니다." });
    }

  //검증 -- #ActivityType 매핑, 프론트엔드 인터페이스에 표기된대로
  const typeMap = {
    run: ActivityType.RUN,
    bike: ActivityType.BIKE,
    swim: ActivityType.SWIM,
  };

   const activityTypeEnum = typeMap[activityTypeStr.toLowerCase()];
  if (!activityTypeEnum) {
    return res.status(400).json({ error: "Invalid ActivityType" });
  }
  //검증 -- 그룹 존재 유무 판단
try {
    const group = await prisma.group.findUnique({
      where: { id: Number(groupId) },
    });
    if (!group) {
      return res.status(404).json({ error: "그룹이 존재하지 않습니다." });
    }

     //검증 -- Participant (유저) 인증, 닉네임 조회, 비밀번호 확인
    const participant = await prisma.participant.findUnique({
      where: { nickname: authorNickname },
    });
    // 인증 실패 시 401 Unauthorized 응답. (404와 비교해서 애매)
    if (!participant || participant.password !== authorPassword) {
      return res.status(401).json({ error: "참여자가 존재하지 않거나 인증에 실패했습니다." });
    }

    const photosArray = Array.isArray(photos) ? photos : [];

      //생성 -- 그룹 운동 기록 생성, 사진
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

    const photoUrls = newRecord.photos.flatMap((p) => p.photos);

    //응답 -- Response Body - 201 CREATED
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
});

export default router;
  
