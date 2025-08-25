import multer from "multer"; // multer 모듈을 불러옴, 파일 업로드 처리를 위해 사용
import path from "path"; // 파일 경로 다루기 위한 모듈
import fs from "fs"; // 파일 시스템 조작을 위한 모듈

const uploadDir = "uploads/"; // 업로드할 파일을 저장할 폴더 경로 지정

// 해당 폴더가 없으면 새로 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// multer가 업로드 파일을 어디에, 어떤 이름으로 저장할지 설정
const storage = multer.diskStorage({
  // 업로드할 파일의 저장 위치를 지정하는 콜백
  destination: (req, file, cb) => {
    cb(null, uploadDir); // 콜백 첫 번째 인자는 에러, 두 번째는 경로 -> 에러 없으니 null, 경로는 uploads/
  },
  // 저장될 파일 이름 설정 (예: record-1632345678901.jpg)
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // 확장자만 추출 (.png, .jpg 등)
    const timeStamp = Date.now();
    const filename = `record-${timeStamp}${ext}`;
    cb(null, filename);
  },
});

// multer 업로드 미들웨어 설정
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 최대 업로드 파일 크기 5MB 제한
  },
  // 업로드할 파일 타입 필터링 (이미지 파일만 허용)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/"))
      cb(null, true); // 이미지면 업로드 허용
    else cb(new Error("이미지 파일만 업로드 가능합니다.")); // 아니면 에러 반환
  },
});
