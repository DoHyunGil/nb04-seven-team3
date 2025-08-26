import { PrismaClient } from "@prisma/client";
import { RECORDS } from "./record.mock.js"

const prisma = new PrismaClient();

async function recordSeed() {
  //1. find created gruop
  const createdGroup = await prisma.group.findMany();

  //2. create  record data with group id.
  const recordWithGroupId = RECORDS.map((r)=> {
    // 3. by mapping each record, find record and record gruop name
    const group = createdGroup.find((g) => g.name === r.groupName);
    if (!group) throw new Error(`not found record of ${group}`); // if the group doesnt exist , throw error.
    return {
        // r is single record, g is single group
      groupId: group.id,
      authorId: r.authorId,
      exerciseType: r.exerciseType,
      type: r.type, 
      description: r.description,
      distance: r.distance,
      duration: r.duration,
      rank: r.rank,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  });
    await prisma.record.createMany({
        data : recordWithGroupId,
        skipDuplicates : true
  })
  console.log(recordWithGroupId)
    //for (const url of records.photos) 
    ///await prisma.record.findMany({
        //where: groupId
    //})
}

export default recordSeed;

  // call the record seed

