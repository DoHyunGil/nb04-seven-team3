-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('PARTICIPATION_10', 'RECORD_100', 'LIKE_100');

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "badges" "BadgeType"[] DEFAULT ARRAY[]::"BadgeType"[];
