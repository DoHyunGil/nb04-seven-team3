import express from "express";
import UploadController from "../controller/uploadController.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  uploadMiddleware.array("image", 20),
  UploadController.imagesUpload
);

export default router;
