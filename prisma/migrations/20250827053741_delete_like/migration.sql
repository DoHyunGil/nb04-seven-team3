/*
  Warnings:

  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_participantId_fkey";

-- DropTable
DROP TABLE "Like";
