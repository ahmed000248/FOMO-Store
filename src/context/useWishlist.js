import { useContext } from 'react';
import { WishlistContext } from './WishlistContext';

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
};
