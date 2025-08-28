-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_groupId_fkey";

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
