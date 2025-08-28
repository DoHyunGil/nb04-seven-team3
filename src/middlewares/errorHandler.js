import { Prisma } from "@prisma/client";
import httpError from "http-errors";

export default function errorHandler(err, req, res, next) {
  console.error("에러 : " + err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "데이터를 찾을 수 없습니다." });
    }
  }

  if (httpError.isHttpError(err)) {
    const status = Number(err.statusCode);
    const message = err.message;

    return res.status(status).json({ message });
  }

  console.error("예기치 못한 에러 발생 : " + err);
  return res.status(500).json({ message: "서버 내부 오류 발생" });
}
