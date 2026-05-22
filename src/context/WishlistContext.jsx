import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const savedWishlist =
      localStorage.getItem('wishlist');

    if (savedWishlist) {
      setWishlistItems(
        JSON.parse(savedWishlist)
      );
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(
      'wishlist',
      JSON.stringify(wishlistItems)
    );
  }, [wishlistItems]);

  // Add to wishlist
  const addToWishlist = (product) => {
    const exists = wishlistItems.find(
      (item) => item.id === product.id
    );

    if (exists) return;

    setWishlistItems((prev) => [
      ...prev,
      product,
    ]);
  };

  // Remove from wishlist
  const removeFromWishlist = (id) => {
    setWishlistItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // Toggle wishlist
  const toggleWishlist = (product) => {
    const exists = wishlistItems.find(
      (item) => item.id === product.id
    );

    if (exists) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Check if item exists
  const isInWishlist = (id) => {
    return wishlistItems.some(
      (item) => item.id === id
    );
  };

  // Total count
  const count = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        count,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// Custom Hook
export function useWishlist() {
  return useContext(WishlistContext);
}