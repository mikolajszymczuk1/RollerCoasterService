import express, { type Router } from 'express';
import { container } from '@/config/container';
import RedisClient from '@/infrastructure/database/redisClient';
import { ContainerTypes } from '@/types/common';

const rollercoasterRouter: Router = express.Router();

rollercoasterRouter.get('/ping', async (req, res): Promise<void> => {
  const redisClient = container.get<RedisClient>(ContainerTypes.RedisClient).getClient();
  const testValue = await redisClient.get('test');
  console.log(testValue);

  res.status(200).json({ msg: 'pong !' });
});

export default rollercoasterRouter;
