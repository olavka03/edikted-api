import { RequestHandler } from 'express';
import { ApiError } from '../exceptions/ApiError';
import * as shippingProtectionService from '../services/shipping-protection.service';
import {
  ProductVariantsBulkInput,
  ShippingProtectionDefaultValues,
} from '../types';
import { validateGraphqlResponse } from '../utils/validateGraphqlResponse';

export const createShippingProtectionVariant: RequestHandler = async (
  req,
  res,
) => {
  const shippingProtectionInput = req.body as ProductVariantsBulkInput[];
  const { tag } = req.query as { tag?: string };

  let productId: string | null = null;
  let productHasOnlyDefaultVariant = false;

  const shippingProtectionProduct =
    await shippingProtectionService.retrieveProductsByTag(
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
    } = await shippingProtectionService.createProduct({
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
      await shippingProtectionService.createDefaultOption(productId);

    validateGraphqlResponse(
      createOptionErrors,
      'Error occured during creating shipping protection product option',
    );
  }

  const availablePublications =
    await shippingProtectionService.retrievePublications();

  const { userErrors: publishProductErrors } =
    await shippingProtectionService.publishProduct({
      productId,
      input:
        availablePublications?.map(({ id }) => ({ publicationId: id })) || [],
    });

  validateGraphqlResponse(
    publishProductErrors,
    'Error occured publishing product',
  );

  const { shippingProtection, userErrors: createProductVariantErrors } =
    await shippingProtectionService.createVariant({
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
    const shippingProtectionProduct =
      await shippingProtectionService.retrieveProductById(id);

    res.json([shippingProtectionProduct]);

    return;
  }

  if (tag) {
    const shippingProtectionProducts =
      await shippingProtectionService.retrieveProductsByTag(tag);

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
      await shippingProtectionService.retrieveVariantById(shippingProtectionId);

    res.json(shippingProtection);

    return;
  }

  const shippingProtection =
    await shippingProtectionService.retrieveFirstVariantByField({
      key: query.field,
      value: query.value,
    });

  res.json(shippingProtection);
};
