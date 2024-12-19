import { Router } from 'express';
import { catchError } from '../utils/catchError';
import * as shippingProtectionController from '../controllers/shipping-protection.controller';

export const shippingProtectionRouter = Router();

shippingProtectionRouter.post(
  '/create',
  catchError(shippingProtectionController.createShippingProtectionVariant),
);
shippingProtectionRouter.get(
  '/retrieve/:id?',
  catchError(shippingProtectionController.retrieveShippingProtectionProducts),
);
shippingProtectionRouter.get(
  '/retrieve/variant/:id?',
  catchError(shippingProtectionController.retrieveShippingProtectionVariant),
);
