import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class TagsController {
  /**
   * API명 : 태그 목록조회
   * @param : {*} 
   */
  getAllTags = async (req, res) => {
    try{
        console.log('[TagsController] getAllTags..');
        const tags = await prisma.tag.findMany({
            orderBy:{
                id: 'asc'
            },
        });
        res.status(200).send(tags);

    } catch (error) {
      console.log(error);
      res.status(400).json({ error: '태그목록 조회에 실패했습니다!' });
    }
  };
  /**
   * API명 : 태그 상세조회
   * @param : {*} tagId
   */
  getTags = async (req, res) => {
    try{
        const id = req.params.id;
        console.log(`[TagsController] getTags  id: ${id}`);
        const tags = await prisma.tag.findFirst({
            where: {
                id: parseInt(id)
            },
            include: {
              activityTags: {
                include: {
                  group: true,
                }
              }
            },
        });
        res.status(200).send(tags);

    } catch (error) {
      console.log(error);
      res.status(400).json({ error: '태그목록 조회에 실패했습니다!' });
    }
  };

};

export default new TagsController();