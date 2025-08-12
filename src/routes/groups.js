import { PrismaClient } from "@prisma/client";
import express from "express";
import recordsRouter from "./records.js";

const router = express.Router();

router.get("/:groupId/records", recordsRouter);
router.post("/:groupId/records", recordsRouter);

export default router;
