import RecordsController from "./recordsController.js";

const controller = new RecordsController();



const fakeReq = {
  params: { groupId:  1},
  body: {
    ActivityType: "run",
    description: "테스트 조깅",
    time: 1200,
    distance: 3.5,
    photos: ["http://example.com/photo1.jpg"],
    authorNickname: "juno",
    authorPassword: "1234",
  },
};

// fake response (res)
const fakeRes = {
  status: (code) => ({
    json: (data) => console.log("status:", code, "data:", data),
  }),
};

// async 함수니까 await 필요
(async () => {
  await controller.createRecord(fakeReq, fakeRes);
})();