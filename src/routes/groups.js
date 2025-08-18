import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const groupRouter = express.Router();

groupRouter.use((req, res, next) => {
    console.log('Group Router 실행..');
    next();
});

groupRouter.route('/')
    /**
     *  시스템명 : SEVEN
     *  API명 : 그룹 등록
     *  @param : {*} RequestBody
     */
    .post(async (req, req) => {
        console.log('/group(그룹등록) is called..');
        try{
            const group = await prisma.group.create({
                data: req.body
            });
            res.status(200).send(group);
            
        } catch(error) {
            console.log(error);
            res.status(401).json( { error: '그룹등록에 실패했습니다!'} );
        } finally {
            await prisma.$disconnect();
        };
});

groupRouter.route('/dtl')
    /**
     *  시스템명 : SEVEN
     *  API명 : 그룹 상세조회
     *  @param : {*} RequestBody
     */
    .get(async (req, req) => {
        console.log('/group/dtl(그룹상세조회) is called..');
        try{
            const { id } = req.query.id;
            const group = await prisma.group.findUnique({
                where: {
                    id: parseInt(id)
                }
            });

            res.status(200).send(group);
            
        } catch(error) {
            console.log(error);
            res.status(401).json( { error: '그룹 상세조회에 실패했습니다!'} );
        } finally {
            await prisma.$disconnect();
        };
});





export default groupRouter;
