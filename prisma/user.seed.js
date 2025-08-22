import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function userSeed() {
  await prisma.participant.createMany({
    data: [
      { nickname: "Juno", password:"sdfs", groupId:171}, // 임시 값
      { nickname: "Alex", password:"asds", groupId:172}  // 임시 값
    ],
    skipDuplicates: true
  });
}