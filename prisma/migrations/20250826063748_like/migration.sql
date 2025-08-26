/*
  Warnings:

  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_recordId_fkey";

-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "photos" TEXT[];

-- DropTable
DROP TABLE "Photo";
