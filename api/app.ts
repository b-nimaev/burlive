import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config(); // Загружаем переменные окружения из файла .env

import userRouter from './routes/userRouter';
import authenticateToken from './middleware/authenticateToken';
import sentencesRouter from './routes/sentenceRouter';

const app = express();
app.use(bodyParser.json());
app.use('/api/users', userRouter);
app.use('/api/sentences', authenticateToken, sentencesRouter);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
// Подключение к базе данных
// mongoose.connect(process.env.DB_CONNECTION_STRING)
//   .then(() => {
//     console.log('Подключено к базе данных');

//   })
//   .catch((error) => {
//     console.error('Ошибка при подключении к базе данных:', error);
//   });


export default app