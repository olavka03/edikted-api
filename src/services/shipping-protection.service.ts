import { gql } from 'graphql-request';
import { shopifyGraphqlClient } from '../graphql';
import {
  ID,
  ProductVariantsBulkInput,
  ShippingProtectionVariantByFieldResponse,
  ShippingProtectionVariantByIDResponse,
  ShippingProtectionVariantCreateResponse,
  ShopifyGIDType,
  ShippingProtectionProductByTagResponse,
  ShippingProtectionProductByIDResponse,
  CreateProductInput,
  ShippingProtectionProductCreateResponse,
  OptionCreateInput,
  CreateDefaultOptionResponse,
  ShippingProtectionDefaultValues,
  ProductVariantInventoryPolicy,
  RetrievePublicationsResponse,
  PublishProductResponse,
} from '../types';
import { parseShopifyGID } from '../utils/parseShopifyGID';

interface CreateShippingProtectionProps {
  productId: ID;
  shippingProtectionInput: ProductVariantsBulkInput[];
}

interface RetrieveFirstByFieldProps {
  key: string;
  value: string;
}

interface PublishProductProps {
  productId: ID;
  input: {
    publicationId: string;
  }[];
}

export const retrieveVariantById = async (productVariantId: string) => {
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

export const retrieveFirstVariantByField = async ({
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

export const retrieveProductById = async (productId: string) => {
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

export const retrieveProductsByTag = async (tag: string) => {
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

export const createProduct = async (productInput: CreateProductInput) => {
  const createProductMutation = gql`
    mutation ProductCreate($input: ProductInput!) {
      productCreate(input: $input) {
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
    input: productInput,
  };

  const { productCreate } =
    await shopifyGraphqlClient.request<ShippingProtectionProductCreateResponse>(
      createProductMutation,
      variabels,
    );

  return productCreate;
};

export const createVariant = async ({
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

export const createDefaultOption = async (productId: string) => {
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

export const retrievePublications = async () => {
  const getPublicationsQuery = gql`
    query GetPublications {
      publications(first: 10) {
        nodes {
          id
          name
        }
      }
    }
  `;

  const { publications } =
    await shopifyGraphqlClient.request<RetrievePublicationsResponse>(
      getPublicationsQuery,
    );

  return publications.nodes;
};

export const publishProduct = async ({
  productId,
  input,
}: PublishProductProps) => {
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
