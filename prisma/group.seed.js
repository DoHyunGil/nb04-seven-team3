import { PrismaClient } from "@prisma/client";
import { GROUPS } from "./mock.js";

const prisma = new PrismaClient();

async function groupSeed() {
  // 기존 데이터 삭제
  await prisma.group.deleteMany();

  // 목 데이터 삽입
  await prisma.group.createMany({
    data: GROUPS,
    skipDuplicates: true,
  });
}
export default groupSeed;