import express from "express";
import recordsController from "../controller/recordsController.js";

const router = express.Router();

const record = new recordsController();
router.get('/records',record.getRecordList)
router.get('/records/rank',record.getRankRecord)
router.get('/:groupId/records', record.getRecord)

export default router;
