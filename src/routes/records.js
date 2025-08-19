import express from "express";
import recordsController from "../controller/recordsController.js";

const router = express.Router();

const record = new recordsController();
router.get('/:groupId/records',record.getRecordList)
router.get('/record/rank',record.getRankRecords)
router.get('/:groupId/records', record.getRecord)
router.post('/:groupId/records',record.createRecord)

export default router;
