import { gql } from 'graphql-request';
import { shopifyGraphqlClient } from '../graphql';
import { parseShopifyGID } from '../utils/parseShopifyGID';
import {
  CreateDefaultOptionResponse,
  OptionCreateInput,
  ShippingProtectionDefaultValues,
  ShopifyGIDType,
} from '../types';

export const createDefault = async (productId: string) => {
  const createOptionsMutation = gql`
    mutation createOptions($productId: ID!, $options: [OptionCreateInput!]!) {
      productOptionsCreate(productId: $productId, options: $options) {
        product {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    productId: parseShopifyGID(productId, ShopifyGIDType.Product),
    options: [
      {
        name: ShippingProtectionDefaultValues.OptionName,
        values: [{ name: ShippingProtectionDefaultValues.OptionValue }],
      },
    ] as OptionCreateInput[],
  };

  const { productOptionsCreate } =
    await shopifyGraphqlClient.request<CreateDefaultOptionResponse>(
      createOptionsMutation,
      variables,
    );

  return productOptionsCreate;
};
