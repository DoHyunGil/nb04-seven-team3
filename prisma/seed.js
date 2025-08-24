import groupSeed from "./group.seed.js";
import recordSeed from "./record.seed.js";
import userSeed from "./user.seed.js";

async function main() {
    await groupSeed();
    await userSeed();
    await recordSeed();

   /* 
  await prisma.rank.create({
    data:{
        rankValue: 1,
        recordId: records[0].id,
        participantId: users[0].id,
        groupId: groups[0].id,
    }
  })
*/
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
