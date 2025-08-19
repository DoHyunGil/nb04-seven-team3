import { PrismaClient } from '@prisma/client';
import express from 'express';

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
    console.log('test...');
    res.send('Hello World');
});

/**
 * 조회 테스트 
 */
app.get('/group', async(req,res) => {
    try{
        console.log('get /group...');
        const groups = await prisma.Group.findMany();
        res.status(200).send(groups);
        console.log('그룹 조회 성공!')

    } catch(error) {
        console.log(error);
        res.status(500).json( { error: '그룹 조회 실패'} );
    } finally {
        await prisma.$disconnect();
    };
});

/**
 * 저장 테스트
 */
app.post('/group', async(req, res) => {
    console.log('post /group...');
    try{
        const group = await prisma.Group.create({
            data: req.body
        });
        res.status(200).send(group);
        console.log('그룹 등록 성공!')

    } catch(error) {
        console.log(error);
        res.status(404).json({ error: '저장 실패' });
    };
});


app.listen(3000, () => {
    console.log('[test.js] Server is strting..');
});

