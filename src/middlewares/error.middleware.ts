import { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import { ApiError } from '../exceptions/ApiError';

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (error instanceof ApiError) {
    const { status, errors, message } = error;

    res.status(status).send({ message, success: false, errors });

    return;
  }

  res.status(500).send({
    message: (error as Error).message || 'Internal error',
    success: false,
    errors: {},
  });

  return;
};
