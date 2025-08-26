import { PrismaClient, BadgeType } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkAndApplyBadge(groupId, badgeType) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { badges: true },
    });

    // badges가 배열인지 확인하고, 존재하지 않거나 이미 포함된 경우 null 반환
    if (
      !group ||
      !Array.isArray(group.badges) ||
      group.badges.includes(badgeType)
    ) {
      return null;
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        badges: {
          push: badgeType,
        },
      },
      select: { badges: true },
    });

    return updatedGroup.badges;
  } catch (error) {
    console.error(
      `그룹 ${groupId}에 배지 '${badgeType}'를 적용하는 중 오류 발생:`,
      error
    );
    return null;
  }
}
