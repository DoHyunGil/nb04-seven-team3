import { PrismaClient } from '@prisma/client';
import { z } from "zod";

const prisma = new PrismaClient();

class TagsController {
  /**
   * API명 : 태그 목록조회
   * @param : {*} 
   */
  async getAllTags(req, res) {
    try{
       console.log('[TagsController] getAllTags..'); 
       const {
          page = 1,
          limit = 10,
          order = 'asc',
          orderBy = 'id',
          search = ''
        } = req.query;
        
        const pageNum = Number(page);
        const limitNum = Number(limit);
        console.log(`search: ${search}`);

        const tags = await prisma.tag.findMany({
            where: {
              name: { contains: search },
            },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy:{
                    id: 'asc',
                }
        });

        const totalCount = await prisma.tag.count({
            where: {
              name: { contains: search },
            },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy:{
                    id: 'asc',
                }
        });
        console.log(`totalCount: ${totalCount}`);
        //response body 평탄화
        const result = {}; 
        const data = tags.map((tag) => ({
            id: tag.id,
            name: tag.name
        }));
        result.data = data;
        result['total'] = totalCount;
        return res.status(200).json(result);

    } catch (error) {
      console.log(error);
      res.status(400).json({ "path": "groupId", 
                             "message": "groupId must be integer"});
    }
  };
  /**
   * API명 : 태그 상세조회
   * @param : {*} tagId
   */
  getTags = async (req, res) => {
    try{
        const id = Number(req.params.id);
        //zod적용
        const createInputId = z.number().min(1, { message: '태그ID는 0이상 이어야 합니다.' });
        const validInputData = createInputId.parse(id);
        console.log(`[TagsController] getTags  id: ${validInputData}`);

        if( isNaN(validInputData) ){
          return res.status(400).json( {message: '태그ID값이 없습니다.'} );
        }
        const tags = await prisma.tag.findFirst({
            where: { id },
        });
        res.status(200).send(tags);

    } catch (error) {
      console.log(error);
      res.status(400).json({ error: '태그상세 조회에 실패했습니다!' });
    }
  };

};

export default new TagsController();