import { RequestHandler } from 'express';
import { ApiError } from '../exceptions/ApiError';
import * as productsService from '../services/products.service';
import * as productVariantsService from '../services/product-variants.service';
import * as productOptionsService from '../services/product-options.service';
import * as publicationsService from '../services/publications.service';
import { validateGraphqlResponse } from '../utils/validateGraphqlResponse';
import {
  ProductVariantsBulkInput,
  ShippingProtectionDefaultValues,
} from '../types';

export const createShippingProtectionVariant: RequestHandler = async (
  req,
  res,
) => {
  const shippingProtectionInput = req.body as ProductVariantsBulkInput[];
  const { tag } = req.query as { tag?: string };

  let productId: string | null = null;
  let productHasOnlyDefaultVariant = false;

  const shippingProtectionProduct = await productsService.retrieveByTag(
    tag || ShippingProtectionDefaultValues.Tag,
  );

  const availableShippingProtectionProduct = shippingProtectionProduct.find(
    ({ variantsCount }) => variantsCount.count < 100,
  );

  if (
    !shippingProtectionProduct.length ||
    !availableShippingProtectionProduct
  ) {
    const {
      product: createdShippingProtectionProduct,
      userErrors: createProductErrors,
    } = await productsService.create({
      title: ShippingProtectionDefaultValues.Title,
      tags: [ShippingProtectionDefaultValues.Tag],
      descriptionHtml: ShippingProtectionDefaultValues.Description,
      productOptions: [
        {
          name: ShippingProtectionDefaultValues.OptionName,
          values: [
            {
              name: ShippingProtectionDefaultValues.OptionValue,
            },
          ],
        },
      ],
      metafields: [
        {
          namespace: 'seo',
          key: 'hidden',
          type: 'number_integer',
          value: '1',
        },
      ],
      productType: ShippingProtectionDefaultValues.Tag,
    });

    validateGraphqlResponse(
      createProductErrors,
      'Error occured during creating shipping protection product',
    );

    productId = createdShippingProtectionProduct.id;
    productHasOnlyDefaultVariant =
      createdShippingProtectionProduct.hasOnlyDefaultVariant;
  } else {
    productId = availableShippingProtectionProduct.id;
    productHasOnlyDefaultVariant =
      availableShippingProtectionProduct.hasOnlyDefaultVariant;
  }

  if (!productId) {
    throw new ApiError(400, 'Invalid product ID');
  }

  if (productHasOnlyDefaultVariant) {
    const { userErrors: createOptionErrors } =
      await productOptionsService.createDefault(productId);

    validateGraphqlResponse(
      createOptionErrors,
      'Error occured during creating shipping protection product option',
    );
  }

  const availablePublications = await publicationsService.retrieve(10);

  const { userErrors: publishProductErrors } = await productsService.publish({
    productId,
    input:
      availablePublications?.map(({ id }) => ({ publicationId: id })) || [],
  });

  validateGraphqlResponse(
    publishProductErrors,
    'Error occured publishing product',
  );

  const { shippingProtection, userErrors: createProductVariantErrors } =
    await productVariantsService.create({
      shippingProtectionInput,
      productId,
    });

  validateGraphqlResponse(
    createProductVariantErrors,
    'Error occured during creating shipping protection variant',
  );

  res.json(shippingProtection);
};

export const retrieveShippingProtectionProducts: RequestHandler = async (
  req,
  res,
) => {
  const { id } = req.params as { id?: string };
  const { tag } = req.query as { tag?: string };

  if (id) {
    const shippingProtectionProduct = await productsService.retrieveById(id);

    res.json([shippingProtectionProduct]);

    return;
  }

  if (tag) {
    const shippingProtectionProducts = await productsService.retrieveByTag(tag);

    res.json(shippingProtectionProducts);

    return;
  }

  throw new ApiError(400, 'You did not provide an id or tag');
};

export const retrieveShippingProtectionVariant: RequestHandler = async (
  req,
  res,
) => {
  const params = req.params as { id?: string };
  const query = req.query as {
    field: string;
    value: string;
  };

  const shippingProtectionId = params?.id || '';

  if (!shippingProtectionId && (!query?.field || !query?.value)) {
    throw new ApiError(400, 'Invalid shipping protection ID or query');
  }

  if (shippingProtectionId) {
    const shippingProtection =
      await productVariantsService.retrieveById(shippingProtectionId);

    res.json(shippingProtection);

    return;
  }

  const shippingProtection = await productVariantsService.retrieveFirstByField({
    key: query.field,
    value: query.value,
  });

  res.json(shippingProtection);
};
