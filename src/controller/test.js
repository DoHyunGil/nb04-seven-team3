import RecordsController from "./recordsController";

class FakeRecordsController extends RecordsController {
  async createRecord(req, res) {
    // 부모 클래스의 검증 로직 실행
    const validationResult = this.validateRequest(req);
    if (validationResult.error) {
      return res.status(400).json(validationResult.error);
    }

    // DB 대신 fake data 생성
    const group = { id: Number(req.params.groupId), name: "Test Group" };
    const participant = { id: 1, nickname: req.body.authorNickname };

    const photosArray = Array.isArray(req.body.photos) ? req.body.photos : [];
    const typeMap = {
      run: "RUN",
      bike: "BIKE",
      swim: "SWIM",
    };
    const activityTypeEnum = typeMap[req.body.ActivityType.toLowerCase()];

    // 부모 검증 로직 그대로 쓰고, DB 호출만 가짜로
    const newRecord = {
      id: 1,
      groupId: group.id,
      type: activityTypeEnum,
      description: req.body.description,
      duration: req.body.time,
      distance: req.body.distance,
      photos: photosArray,
      author: participant,
    };

    return res.status(201).json(newRecord);
  }
}
