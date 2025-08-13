import express from "express";
import recordsController from "../controller/recordsController.js";

const router = express.Router();

const recordsController = new recordsController();
router.get('/records',recordsController.getRecordList)
router.get('/records/rank',recordsController.getRankRecord)
router.get('/:groupId/records', recordsController.getRecord)

export default router;
