import React, { useEffect } from 'react';
import {
  Heart,
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Truck,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import type { IProduct } from '../../types';

interface WishlistDrawerProps {
  onSelectProduct?: (product: IProduct) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ onSelectProduct }) => {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    removeFromWishlist,
    clearWishlist,
    totalSavedCount,
  } = useWishlist();

  const { addItem, setIsCartOpen } = useCart();
  const [justMovedId, setJustMovedId] = React.useState<string | null>(null);

  // Body scroll lock on open
  useEffect(() => {
    if (isWishlistOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isWishlistOpen]);

  const handleMoveToBag = (product: IProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const isUnst =
      String(product.subcategory || '').toLowerCase() === 'unstitched' ||
      String(product.category || '').toLowerCase().includes('unstitched') ||
      product.name.toLowerCase().includes('unstitched');

    const defaultSize = isUnst ? 'Unstitched' : (product.sizes[0] || 'Standard');
    addItem(product, defaultSize, 1);
    setJustMovedId(product._id);

    setTimeout(() => {
      setJustMovedId(null);
    }, 1500);
  };

  const handleAddAllToBag = () => {
    wishlist.forEach((product) => {
      if (product.stock > 0 && product.stockState !== 'out_of_stock') {
        const isUnst =
          String(product.subcategory || '').toLowerCase() === 'unstitched' ||
          String(product.category || '').toLowerCase().includes('unstitched') ||
          product.name.toLowerCase().includes('unstitched');
        const defaultSize = isUnst ? 'Unstitched' : (product.sizes[0] || 'Standard');
        addItem(product, defaultSize, 1);
      }
    });
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleWhatsAppInquiry = (product: IProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `As-salamu alaykum! I have saved "${product.name}" in my Wishlist (SKU: ${product.sku || 'N/A'}, Price: Rs. ${product.retailPrice.toLocaleString()}). Is this in stock for COD dispatch?`
    );
    window.open(`https://wa.me/923235277238?text=${message}`, '_blank');
  };

  if (!isWishlistOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-stone-950/70 backdrop-blur-xs p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-title"
    >
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={() => setIsWishlistOpen(false)} />

      <motion.div
        initial={{ x: '100%', opacity: 0.8 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.8 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative w-full max-w-md bg-white flex flex-col h-[100dvh] sm:h-[92vh] sm:rounded-2xl shadow-2xl overflow-hidden z-10 box-border border-l sm:border border-stone-200"
      >
        {/* Header */}
        <div className="flex-none px-4 py-3.5 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Heart className="w-5 h-5 fill-rose-400" />
            </div>
            <div>
              <h2 id="wishlist-title" className="font-serif text-base font-bold tracking-tight text-white leading-tight">
                My Saved Wishlist
              </h2>
              <p className="text-[11px] text-amber-200/90">
                {totalSavedCount} {totalSavedCount === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalSavedCount > 0 && (
              <button
                onClick={clearWishlist}
                className="text-[11px] font-semibold text-stone-400 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-stone-800"
                title="Clear all saved items"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              aria-label="Close wishlist drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3">
          {totalSavedCount === 0 ? (
            <div className="py-20 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center border border-rose-100 shadow-inner">
                <Heart className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="font-serif text-base font-bold text-stone-900">Your Wishlist is Empty</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Click the heart icon on any product to save your favorite luxury suits and outfits here for later!
                </p>
              </div>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlist.map((item) => {
                const isOutOfStock = item.stock <= 0 || item.stockState === 'out_of_stock';
                const savings =
                  item.compareAtPrice && item.compareAtPrice > item.retailPrice
                    ? item.compareAtPrice - item.retailPrice
                    : 0;

                const primaryImage =
                  item.images[0] ||
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={item._id}
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(item);
                        setIsWishlistOpen(false);
                      }
                    }}
                    className="group relative flex gap-3 p-3 bg-white border border-stone-200/90 rounded-2xl hover:border-amber-400/60 hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-20 h-24 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-100">
                      <img
                        src={primaryImage}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-stone-950/70 flex items-center justify-center p-1">
                          <span className="text-[9px] font-bold text-white uppercase text-center leading-tight">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider truncate">
                            {item.category} • {item.fabric}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWishlist(item._id);
                            }}
                            className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                            title="Remove from wishlist"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="font-serif text-xs sm:text-sm font-semibold text-stone-900 line-clamp-1 group-hover:text-amber-900 transition-colors">
                          {item.name}
                        </h4>

                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                            Rs. {item.retailPrice.toLocaleString()}
                          </span>
                          {item.compareAtPrice && item.compareAtPrice > item.retailPrice && (
                            <span className="text-[10px] text-stone-400 line-through">
                              Rs. {item.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                          {savings > 0 && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                              Save Rs. {savings.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={(e) => handleMoveToBag(item, e)}
                          disabled={isOutOfStock}
                          className={`flex-1 min-h-[32px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                            isOutOfStock
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                              : justMovedId === item._id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-900 hover:bg-amber-600 text-white active:bg-amber-700'
                          }`}
                        >
                          {justMovedId === item._id ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Added to Bag</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Move to Bag</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleWhatsAppInquiry(item, e)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors"
                          title="Ask on WhatsApp"
                          aria-label="Ask on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Bulk Action */}
        {totalSavedCount > 0 && (
          <div className="flex-none p-3.5 bg-stone-50 border-t border-stone-200 space-y-2">
            <button
              onClick={handleAddAllToBag}
              className="w-full min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add All Available to Bag ({totalSavedCount})</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500 text-center">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>Nationwide Express COD • Fast Dispatch</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
