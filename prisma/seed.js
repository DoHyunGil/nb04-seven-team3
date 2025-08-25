import { PrismaClient } from "@prisma/client";
import { GROUP } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  const group = await prisma.group.create({
    data: {
      name: "NAME",
      description: "DESC",
      photoUrl: "",
      goalRep: 123,
      likeCount: 456,
      badgeYn: false,
      point: 789,
      discordWebhookUrl: "",
      discordInviteUrl: "",
      nickname: "TEST",
      password: "PASSWD",
    },
  });

  const user = await prisma.participant.create({
    data: {
      nickname: "TEST",
      password: "PASSWD",
      group: {
        connect: { id: group.id },
      },
    },
  });

  prisma.group.update({
    where: { id: group.id },
    data: {
      participant: {
        connect: { id: user.id },
      },
    },
  });

  const record = await prisma.record.create({
    data: {
      type: "RUN",
      description: "RECORD_DESC",
      duration: 111,
      distance: 1123.123123,
      author: {
        connect: { id: user.id },
      },
      group: {
        connect: { id: group.id },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
