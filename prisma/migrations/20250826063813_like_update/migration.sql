/*
  Warnings:

  - You are about to drop the column `recordId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[groupId,participantId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_recordId_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_recordId_fkey";

-- DropIndex
DROP INDEX "Like_recordId_participantId_key";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "recordId",
ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "photos" TEXT[];

-- DropTable
DROP TABLE "Photo";

-- CreateIndex
CREATE UNIQUE INDEX "Like_groupId_participantId_key" ON "Like"("groupId", "participantId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
