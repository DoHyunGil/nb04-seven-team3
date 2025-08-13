import express from 'express';
import { PrismaClient } from '@prisma/client/';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/groups', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      order = 'desc',
      orderBy = 'createdAt',
      search = '',
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};
    const groups = await prisma.group.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy:
        orderBy === 'participantCount'
          ? { participant: { _count: order } }
          : { [orderBy]: order },
      select: {
        name: true,
        nickname: true,
        imgurl: true,
        tag: true,
        tgetcount: true,
        recomdcount: true,
        _count: { select: { participant: true } },
      },
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: '서버 오류' });
  }
});

router.get('/groups/:groupId', async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'groupId가 유효하지 않습니다.' });
    }
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        name: true,
        description: true,
        nickname: true,
        imgurl: true,
        tag: true,
        tgetcount: true,
        _count: { select: { participant: true } },
        discodesvrUrl: true,
      },
    });
    const { _count, ...rest } = group;

    res.status(200).json({
      ...rest,
      participantCount: _count.participant,
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류' });
  }
});

export default router;
