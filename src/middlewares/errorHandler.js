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

    // message가 객체 타입이면, 그대로 JSON 응답으로 반환
    if (typeof message === "object") {
      return res.status(status).json(message);
    }

    // err 객체에 path 프로퍼티가 있으면, 응답에 path와 message를 함께 반환하기 위해 처리
    if (err.path) {
      return res.status(status).json({ path: err.path, message });
    }

    // message가 문자열일 경우, message 프로퍼티로 감싸서 JSON 응답 반환
    return res.status(status).json({ message });
  }

  console.error("예기치 못한 에러 발생 : " + err);
  return res.status(500).json({ message: "서버 내부 오류 발생" });
}
