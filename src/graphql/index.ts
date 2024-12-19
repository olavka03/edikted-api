import { GraphQLClient } from 'graphql-request';
import { SHOPIFY_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN } from '../env';

const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-07/graphql.json`;

const headers = {
  'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
};

export const shopifyGraphqlClient = new GraphQLClient(url, { headers });
