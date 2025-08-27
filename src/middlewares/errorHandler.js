import { Prisma } from "@prisma/client";
import httpError from "http-errors";

export default function errorHandler(err, req, res, next) {
  if (!httpError.isHttpError(err)) {
    console.error("예외적 에러 발생입니다. 에러를 패키지화 해주세요 : " + err);
    return res.status(500).send("에러");
  }

  console.error("에러 : " + err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "데이터를 찾을 수 없습니다." });
    }
  }

  const status = Number(err.status);
  const message = err.message;

  res.status(status).send(`에러 메시지 : ${message}`);
}
