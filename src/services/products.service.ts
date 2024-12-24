import { gql } from 'graphql-request';
import { shopifyGraphqlClient } from '../graphql';
import { parseShopifyGID } from '../utils/parseShopifyGID';
import {
  CreateProductInput,
  ID,
  PublishProductResponse,
  ShippingProtectionProductByIDResponse,
  ShippingProtectionProductByTagResponse,
  ShippingProtectionProductCreateResponse,
  ShopifyGIDType,
} from '../types';

interface PublishProductProps {
  productId: ID;
  input: {
    publicationId: string;
  }[];
}

export const retrieveById = async (productId: string) => {
  const getProductQuery = gql`
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        title
        hasOnlyDefaultVariant
        variants(first: 1) {
          nodes {
            selectedOptions {
              name
              value
            }
          }
        }
        variantsCount {
          count
        }
      }
    }
  `;

  const variables = {
    id: parseShopifyGID(productId, ShopifyGIDType.Product),
  };

  const { product } =
    await shopifyGraphqlClient.request<ShippingProtectionProductByIDResponse>(
      getProductQuery,
      variables,
    );

  return product;
};

export const retrieveByTag = async (tag: string) => {
  const getProductsQuery = gql`
    query GetProducts($query: String!) {
      products(first: 100, query: $query) {
        nodes {
          id
          title
          hasOnlyDefaultVariant
          variants(first: 1) {
            nodes {
              selectedOptions {
                name
                value
              }
            }
          }
          variantsCount {
            count
          }
        }
      }
    }
  `;

  const variables = {
    query: `tag:${tag}`,
  };

  const { products } =
    await shopifyGraphqlClient.request<ShippingProtectionProductByTagResponse>(
      getProductsQuery,
      variables,
    );

  return products.nodes || null;
};

export const create = async (createProductInput: CreateProductInput) => {
  const createProductMutation = gql`
    mutation ProductCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
      productCreate(input: $input, media: $media) {
        product {
          id
          title
          hasOnlyDefaultVariant
          variants(first: 1) {
            nodes {
              selectedOptions {
                name
                value
              }
            }
          }
          variantsCount {
            count
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variabels = {
    input: createProductInput.product,
    media: createProductInput?.media || [],
  };

  const { productCreate } =
    await shopifyGraphqlClient.request<ShippingProtectionProductCreateResponse>(
      createProductMutation,
      variabels,
    );

  return productCreate;
};

export const publish = async ({ productId, input }: PublishProductProps) => {
  const publishProductMutation = gql`
    mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    id: productId,
    input,
  };

  const { publishablePublish } =
    await shopifyGraphqlClient.request<PublishProductResponse>(
      publishProductMutation,
      variables,
    );

  return publishablePublish;
};
