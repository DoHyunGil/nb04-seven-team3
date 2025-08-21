import express from 'express';
import groupRouters from './src/routes/groups.js';
import recordsRouter from './src/routes/records.js';
import imageRouter from './src/routes/images.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
// 'uploads' 폴더에 저장된 파일들을 '/images' URL로 외부에서 접근할 수 있게 합니다.
app.use('/images', express.static(path.join(process.cwd(), 'uploads')));
app.use('/images', imageRouter);

app.use('/groups', groupRouters);
app.use('/groups', recordsRouter);

app.listen(PORT, () => {
  console.log('server running');
});
