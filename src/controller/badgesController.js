import { PrismaClient, BadgeType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 배지를 그룹에 추가 (조건 만족 여부는 외부에서 판단)
 * 중복 배지는 자동 무시됨
 *
 * @param {number} groupId - 그룹 ID
 * @param {BadgeType} badgeType - 부여할 배지 타입
 * @returns {Promise<BadgeType[] | null>} - 업데이트된 badges 배열 또는 null (이미 있었던 경우)
 */
export async function checkAndApplyBadge(groupId, badgeType) {
  try {
    const updatedGroup = await prisma.group.update({
      where: {
        id: groupId,
        NOT: {
          badges: {
            has: badgeType, // 이미 가지고 있지 않은 경우만
          },
        },
      },
      data: {
        badges: {
          push: badgeType,
        },
      },
      select: {
        badges: true,
      },
    });

    return updatedGroup.badges; // 성공적으로 추가된 경우
  } catch (error) {
    // 조건에 안 맞아 update가 수행되지 않으면 Prisma가 에러를 던지므로 null 반환
    return null;
  }
}
