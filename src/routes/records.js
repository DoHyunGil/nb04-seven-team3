import express from "express";
import recordsController from "../controller/recordsController.js";

const router = express.Router();

const recordsController = new recordsController();
router.get('/',recordsController.getRecordList)
router.get('/',recordsController.getRankRecord)
router.get('/:id', recordsController.getRecord)

export default router;
