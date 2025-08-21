import express from 'express';
import UploadController from '../controller/uploadController';
import uploadMiddleware from '../middlewares/uploadMiddleware';

const router = express.Router();

router.post(
  '/',
  uploadMiddleware.array('image', 20),
  UploadController.imagesUpload
);

export default router;
