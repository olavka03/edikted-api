import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const PORT = process.env.PORT || 3001;
export const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '';
export const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';
