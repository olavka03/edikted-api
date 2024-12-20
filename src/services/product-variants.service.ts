import { gql } from 'graphql-request';
import { shopifyGraphqlClient } from '../graphql';
import { parseShopifyGID } from '../utils/parseShopifyGID';
import {
  ID,
  ProductVariantInventoryPolicy,
  ProductVariantsBulkInput,
  ShippingProtectionVariantByFieldResponse,
  ShippingProtectionVariantByIDResponse,
  ShippingProtectionVariantCreateResponse,
  ShopifyGIDType,
} from '../types';

interface RetrieveFirstByFieldProps {
  key: string;
  value: string;
}

interface CreateShippingProtectionProps {
  productId: ID;
  shippingProtectionInput: ProductVariantsBulkInput[];
}

export const retrieveById = async (productVariantId: string) => {
  const getProductQuery = gql`
    query GetProductVariant($id: ID!) {
      productVariant(id: $id) {
        id
        title
        price
      }
    }
  `;

  const variabels = {
    id: parseShopifyGID(productVariantId, ShopifyGIDType.ProductVariant),
  };

  const { productVariant } =
    await shopifyGraphqlClient.request<ShippingProtectionVariantByIDResponse>(
      getProductQuery,
      variabels,
    );

  return productVariant;
};

export const retrieveFirstByField = async ({
  key,
  value,
}: RetrieveFirstByFieldProps) => {
  const getProductVariantsQuery = gql`
    query ProductVariantsList($query: String!) {
      productVariants(first: 1, query: $query) {
        nodes {
          id
          title
          price
        }
      }
    }
  `;

  const variabels = {
    query: `${key}:${value}`,
  };

  const data =
    await shopifyGraphqlClient.request<ShippingProtectionVariantByFieldResponse>(
      getProductVariantsQuery,
      variabels,
    );

  return data.productVariants.nodes?.[0] || null;
};

export const create = async ({
  shippingProtectionInput,
  productId,
}: CreateShippingProtectionProps) => {
  const createProductVariantMutation = gql`
    mutation ProductVariantsCreate(
      $productId: ID!
      $variants: [ProductVariantsBulkInput!]!
    ) {
      productVariantsBulkCreate(productId: $productId, variants: $variants) {
        productVariants {
          id
          title
          price
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
    variants:
      shippingProtectionInput?.map((input) => ({
        ...input,
        inventoryPolicy: ProductVariantInventoryPolicy.Continue,
      })) || [],
  };

  const { productVariantsBulkCreate } =
    await shopifyGraphqlClient.request<ShippingProtectionVariantCreateResponse>(
      createProductVariantMutation,
      variables,
    );

  const { productVariants, userErrors } = productVariantsBulkCreate;

  return {
    shippingProtection: productVariants?.[0] || null,
    userErrors,
  };
};
