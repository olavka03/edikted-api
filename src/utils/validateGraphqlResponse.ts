import { ApiError } from '../exceptions/ApiError';
import { UserError } from '../types';

export const validateGraphqlResponse = (
  userErrors: UserError[],
  message?: string,
) => {
  if (!userErrors.length) {
    return;
  }

  const errors = userErrors.reduce(
    (acc, { field, message }) => {
      acc[field] = message;

      return acc;
    },
    {} as Record<string, string>,
  );

  throw new ApiError(400, message || 'Error occured', errors);
};
