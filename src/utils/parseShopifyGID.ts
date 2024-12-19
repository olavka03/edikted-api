import { ShopifyGIDType } from '../types';

export const parseShopifyGID = (id: string, gidType?: ShopifyGIDType) => {
  const gidStart = 'gid://shopify';

  if (id.startsWith(gidStart)) {
    return id;
  }

  if (!gidType) {
    return null;
  }

  return `${gidStart}/${gidType}/${id}`;
};
