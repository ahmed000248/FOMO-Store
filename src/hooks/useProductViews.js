/**
 * useProductViews Hook
 * 
 * Safely registers product details views during details page mounting.
 * Includes a lock mechanism to prevent duplicate tracker execution inside
 * React 18+ Strict Mode double-render mounts.
 */
import { useEffect, useRef } from 'react';
import { trackEvent } from '../services/analyticsService';

export const useProductViews = (product) => {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!product || trackedRef.current) return;

    // Set lock
    trackedRef.current = true;

    // Track views dynamically
    trackEvent('product_view', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price
    });

  }, [product]);
};
