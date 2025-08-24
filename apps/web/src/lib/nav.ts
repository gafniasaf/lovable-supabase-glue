export type Product = 'education' | 'expertfolio';

/**
 * Build an internal link for a product. If host-based routing is used, return path unchanged.
 * If later moving to path prefixes, update to prepend `/${product}`.
 */
export function linkFor(product: Product, path: `/${string}`) {
  return path;
}


