import React, { createContext, useContext, useState, useEffect } from 'react';
import type { IProduct } from '../types';

interface WishlistContextType {
  wishlist: IProduct[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: IProduct) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  totalSavedCount: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  toastMessage: string | null;
  dismissToast: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<IProduct[]>(() => {
    try {
      const saved = localStorage.getItem('nehsaan_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nehsaan_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not save wishlist to storage:', e);
    }
  }, [wishlist]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p._id === productId);
  };

  const toggleWishlist = (product: IProduct) => {
    const exists = isInWishlist(product._id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p._id !== product._id));
      showToast(`Removed "${product.name}" from your Wishlist`);
    } else {
      setWishlist((prev) => [product, ...prev]);
      showToast(`Saved "${product.name}" to your Wishlist ❤️`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast('Wishlist cleared');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  const dismissToast = () => {
    setToastMessage(null);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        totalSavedCount: wishlist.length,
        isWishlistOpen,
        setIsWishlistOpen,
        toastMessage,
        dismissToast,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
