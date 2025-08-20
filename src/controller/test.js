import RecordsController from "./recordsController";

const fakeRecords = [
  { id: 1, description: "달리기", author: { nickname: "juno" } },
  { id: 2, description: "사이클", author: { nickname: "jenny" } },
];
const fakeGroup = [
  {id: 0, name: "운동재미"},
  {id: 1, name: "운동인생" }
]
const ACTIVITY_TYPES = [
  {id: 0, name: "run", display_name: "달리기"},
  {id: 1, name: "cycle", display_name: "자전거"},
  {id: 2, name: "swim", display_name: "수영"}
]
class FakeRecordsController extends RecordsController {
  getRecordList = async (req, res) => {
    const group = fakeGroup;
    const record = fakeRecords;

  }
}
