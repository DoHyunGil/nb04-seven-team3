import { PrismaClient } from "@prisma/client";
import { GROUP } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  const group = await prisma.group.create({
    data: {
      name: "랭크 테스트",
      description: "랭크 테스트 할 곳",
      photoUrl: "",
      goalRep: 123,
      likeCount: 5,
      badgeYn: false,
      point: 789,
      discordWebhookUrl: "null",
      discordInviteUrl: "null",
      nickname: "TEST",
      password: "PASSWD",
    },
  });

  const group1 = await prisma.group.create({
    data: {
      name: "랭크 테스트",
      description: "랭크 테스트 할 곳",
      photoUrl: "",
      goalRep: 123,
      likeCount: 3,
      badgeYn: false,
      point: 789,
      discordWebhookUrl: "null",
      discordInviteUrl: "null",
      nickname: "TEST",
      password: "PASSWD",
    },
  });

  const group2 = await prisma.group.create({
    data: {
      name: "랭크 테스트",
      description: "랭크 테스트 할 곳",
      photoUrl: "",
      goalRep: 123,
      likeCount: 1,
      badgeYn: false,
      point: 789,
      discordWebhookUrl: "null",
      discordInviteUrl: "null",
      nickname: "TEST",
      password: "PASSWD",
    },
  });

  const group3 = await prisma.group.create({
    data: {
      name: "랭크 테스트2",
      description: "랭크 테스트 할 곳2",
      photoUrl: "",
      goalRep: 123,
      likeCount: 1000,
      badgeYn: false,
      point: 789,
      discordWebhookUrl: "null",
      discordInviteUrl: "null",
      nickname: "TEST",
      password: "PASSWD",
    },
  });

  const user1 = await prisma.participant.create({
    data: {
      nickname: "2등유저",
      password: "PASSWD",
      group: {
        connect: { id: group.id },
      },
    },
  });

  const user2 = await prisma.participant.create({
    data: {
      nickname: "3등유저",
      password: "PASSWD",
      group: {
        connect: { id: group.id },
      },
    },
  });

  const user3 = await prisma.participant.create({
    data: {
      nickname: "1등유저",
      password: "PASSWD",
      group: {
        connect: { id: group.id },
      },
    },
  });

  for (let i = 4; i <= 10; i++) {
    await prisma.participant.create({
      data: {
        nickname: `${i}등유저`,
        password: "PASSWD",
        group: {
          connect: { id: group.id },
        },
      },
    });
  }

  const user11 = await prisma.participant.create({
    data: {
      nickname: "11등유저",
      password: "PASSWD",
      group: {
        connect: { id: group2.id },
      },
    },
  });

  prisma.group.update({
    where: { id: group.id },
    data: {
      participant: {
        connect: [{ id: user1.id }, { id: user2.id }, { id: user3.id }],
      },
    },
  });

  prisma.group.update({
    where: { id: group2.id },
    data: {
      participant: {
        connect: [{ id: user11.id }],
      },
    },
  });

  //레코드 생성 루프
  for (let i = 0; i < 100; i++) {
    await prisma.record.create({
      data: {
        type: "RUN",
        description: "RECORD_DESC",
        duration: 111,
        distance: 1123.123123,
        author: {
          connect: { id: user3.id },
        },
        group: {
          connect: { id: group.id },
        },
      },
    });
  }

  for (let i = 0; i < 3; i++) {
    await prisma.record.create({
      data: {
        type: "RUN",
        description: "RECORD_DESC",
        duration: 111,
        distance: 1123.123123,
        author: {
          connect: { id: user1.id },
        },
        group: {
          connect: { id: group.id },
        },
      },
    });
  }

  for (let i = 0; i < 1; i++) {
    await prisma.record.create({
      data: {
        type: "RUN",
        description: "RECORD_DESC",
        duration: 111,
        distance: 1123.123123,
        author: {
          connect: { id: user2.id },
        },
        group: {
          connect: { id: group.id },
        },
      },
    });
  }

  /*
    // 기존 데이터 삭제
  await prisma.group.deleteMany();

  // 목 데이터 삽입
  await prisma.group.createMany({
    data: GROUP,
    skipDuplicates: true,
  });
  */
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
