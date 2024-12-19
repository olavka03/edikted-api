import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './error.middleware';

export const middlewares = {
  cors: cors({
    origin: '*',
  }),
  json: express.json(),
  error: errorMiddleware,
};
