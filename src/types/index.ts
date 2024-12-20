/* eslint-disable no-unused-vars */
export type ID = string;

export type Money = string;

export enum ProductVariantInventoryPolicy {
  Deny = 'DENY',
  Continue = 'CONTINUE',
}

export enum MediaContentType {
  EXTERNAL_VIDEO = 'EXTERNAL_VIDEO',
  IMAGE = 'IMAGE',
  MODEL_3D = 'MODEL_3D',
  VIDEO = 'VIDEO',
}

export interface InventoryItemInput {
  cost?: Money;
  tracked?: boolean;
}

export interface InventoryLevelInput {
  locationId: ID;
  available: number;
}

export interface Publication {
  id: ID;
  name: string;
}

export type MetafieldType =
  | 'single_line_text_field'
  | 'multi_line_text_field'
  | 'number_integer'
  | 'number_decimal'
  | 'boolean'
  | 'date'
  | 'json';

export interface MetafieldInput {
  namespace: string;
  key: string;
  value: unknown;
  type: MetafieldType;
  description?: string;
}

export interface UserError {
  field: string;
  message: string;
}

export interface VariantOptionValueInput {
  optionName: string;
  name: string;
}

export interface ProductVariantsBulkInput {
  barcode?: string;
  compareAtPrice?: Money;
  id?: ID;
  inventoryItem?: InventoryItemInput;
  inventoryPolicy?: ProductVariantInventoryPolicy;
  inventoryQuantities?: InventoryLevelInput[];
  mediaId?: ID;
  mediaSrc?: string[];
  metafields?: MetafieldInput[];
  optionValues?: VariantOptionValueInput[];
  price?: Money;
  taxable?: boolean;
  taxCode?: string;
}

export interface CreateShippingProtectionsBody {
  productVariants: ProductVariantsBulkInput[];
  productMedia?: CreateMediaInput[];
}

export interface OptionCreateInput {
  name: string;
  values: {
    name: string;
  }[];
}

export interface CreateMediaInput {
  originalSource: string;
  mediaContentType: MediaContentType;
  alt?: string;
}

export interface CreateProductInput {
  product: {
    categoryId?: string;
    claimOwnership?: {
      bundles?: boolean;
    };
    collectionsToJoin?: string[];
    collectionsToLeave?: string[];
    combinedListingRole?: 'PRIMARY' | 'SECONDARY' | 'HIDDEN';
    customProductType?: string;
    descriptionHtml?: string;
    giftCard?: boolean;
    giftCardTemplateSuffix?: string;
    handle?: string;
    id?: string;
    metafields?: MetafieldInput[];
    productOptions?: OptionCreateInput[];
    productType?: string;
    redirectNewHandle?: boolean;
    requiresSellingPlan?: boolean;
    seo?: {
      title?: string;
      description?: string;
    };
    status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
    tags?: string[];
    templateSuffix?: string;
    title: string;
    vendor?: string;
  };
  media?: CreateMediaInput[];
}

export interface ShippingProtection {
  id: ID;
  title: string;
}

export interface ShippingProtectionProduct extends ShippingProtection {
  hasOnlyDefaultVariant: boolean;
  variants: {
    nodes: {
      selectedOptions: {
        name: string;
        value: string;
      }[];
    }[];
  };
  variantsCount: {
    count: number;
  };
}

export interface ShippingProtectionVariant extends ShippingProtection {
  price: Money;
}

export interface ShippingProtectionProductByIDResponse {
  product: ShippingProtectionProduct;
}

export interface ShippingProtectionProductByTagResponse {
  products: {
    nodes: ShippingProtectionProduct[];
  };
}

export interface ShippingProtectionProductCreateResponse {
  productCreate: {
    product: ShippingProtectionProduct;
    userErrors: UserError[];
  };
}

export interface ShippingProtectionVariantCreateResponse {
  productVariantsBulkCreate: {
    productVariants: ShippingProtectionVariant[];
    userErrors: UserError[];
  };
}

export interface ShippingProtectionVariantByFieldResponse {
  productVariants: {
    nodes: ShippingProtectionVariant[];
  };
}

export interface ShippingProtectionVariantByIDResponse {
  productVariant: ShippingProtectionVariant;
}

export interface CreateDefaultOptionResponse {
  productOptionsCreate: {
    product: {
      id: string;
    };
    userErrors: UserError[];
  };
}

export interface RetrievePublicationsResponse {
  publications: {
    nodes: Publication[];
  };
}

export interface PublishProductResponse {
  publishablePublish: {
    userErrors: UserError[];
  };
}

export enum ShopifyGIDType {
  Product = 'Product',
  ProductVariant = 'ProductVariant',
}

export enum ShippingProtectionDefaultValues {
  Title = 'Shipping Protection',
  Tag = 'shipping-protection',
  Description = '<p>Shipping Protection Product</p>',
  OptionName = 'ID',
  OptionValue = 'default',
}
