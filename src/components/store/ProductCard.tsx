import React, { useState } from 'react';
import { ShoppingBag, Eye, Star, Sparkles, MessageCircle, Check, Truck, Flame, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { IProduct } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: IProduct;
  onSelect: (product: IProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);

  const isSaved = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0 || product.stockState === 'out_of_stock';
  const isLowStock = !isOutOfStock && product.stock > 0 && product.stock <= 5;

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.retailPrice
      ? Math.round(((product.compareAtPrice - product.retailPrice) / product.compareAtPrice) * 100)
      : null;

  const savingsAmount =
    product.compareAtPrice && product.compareAtPrice > product.retailPrice
      ? product.compareAtPrice - product.retailPrice
      : 0;

  const primaryImage =
    product.images[0] ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80';
  const secondaryImage = product.images[1] || null;

  const isUnstitched =
    String(product.subcategory || '').toLowerCase() === 'unstitched' ||
    String(product.category || '').toLowerCase().includes('unstitched') ||
    product.name.toLowerCase().includes('unstitched');

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    const defaultSize = isUnstitched ? 'Unstitched' : (product.sizes[0] || 'Standard');
    addItem(product, defaultSize, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `As-salamu alaykum! I am interested in: "${product.name}" (SKU: ${product.sku || 'N/A'}, Price: Rs. ${product.retailPrice.toLocaleString()}). Is this currently available for Cash on Delivery?`
    );
    window.open(`https://wa.me/923235277238?text=${message}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="group relative flex flex-col bg-white border border-stone-200/90 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-amber-400/50 transition-all duration-300"
    >
      {/* Top Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5 pointer-events-none">
        {product.sale && discountPercent && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-rose-600 to-red-500 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-md backdrop-blur-xs">
            <span>{discountPercent}% OFF</span>
          </span>
        )}

        {product.bestSeller && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-md border border-amber-500/20">
            <Sparkles className="w-3 h-3 text-stone-950" />
            <span>Best Seller</span>
          </span>
        )}

        {product.newArrival && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-950/90 text-stone-100 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded-full shadow-md backdrop-blur-xs border border-stone-700/50">
            <span>New Drop</span>
          </span>
        )}
      </div>

      {/* Top Right Controls: Wishlist Heart & Low Stock */}
      <div className="absolute top-2.5 right-2.5 z-20 flex flex-col items-end gap-1.5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`p-2 rounded-full backdrop-blur-md shadow-md transition-all ${
            isSaved
              ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-500/30'
              : 'bg-white/90 text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          aria-label={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isSaved ? 'fill-rose-600 text-rose-600' : 'text-stone-600'
            }`}
          />
        </motion.button>

        {isLowStock && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/90 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md animate-pulse pointer-events-none">
            <Flame className="w-3 h-3" />
            <span>{product.stock} Left</span>
          </span>
        )}
      </div>

      {/* Image Showcase Container with Cross-fade & Quick Hover Actions */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden cursor-pointer select-none"
      >
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`h-full w-full object-cover object-center transition-all duration-700 ease-out ${
            secondaryImage ? 'sm:group-hover:opacity-0 sm:group-hover:scale-108' : 'group-hover:scale-108'
          }`}
          loading="lazy"
        />

        {/* Secondary Hover Image Swap on Desktop */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate`}
            className="hidden sm:block absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-108 transition-all duration-700 ease-out pointer-events-none"
            loading="lazy"
          />
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-stone-900 border border-stone-700 text-white text-[11px] sm:text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Fabric & Stitching Floating Tags at Bottom of Image */}
        <div className="absolute bottom-2 inset-x-2 z-10 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 bg-stone-950/80 backdrop-blur-md text-amber-200 text-[10px] font-semibold rounded-md border border-stone-800/80 truncate max-w-[55%]">
            {product.fabric || 'Luxury Fabric'}
          </span>
          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-stone-900 text-[10px] font-bold rounded-md border border-stone-200/80 uppercase tracking-wider">
            {isUnstitched ? 'Unstitched' : 'Stitched'}
          </span>
        </div>

        {/* Creative Hover Floating Action Bar (Revealed on Desktop Hover) */}
        <div className="hidden sm:flex absolute inset-0 bg-stone-950/30 opacity-0 group-hover:opacity-100 transition-all duration-300 items-center justify-center gap-2 z-15 backdrop-blur-[1px]">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/95 text-stone-900 text-xs font-bold rounded-full shadow-xl hover:bg-white hover:text-amber-950 transition-colors"
            title="Quick View Details"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleWhatsAppInquiry}
            className="flex items-center justify-center p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl transition-colors"
            title="Inquire on WhatsApp"
            aria-label="Inquire on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-2.5">
        <div>
          {/* Category & Star Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 mb-1 gap-1">
            <span className="uppercase tracking-widest font-semibold text-stone-600 truncate">
              {product.category} {product.subcategory ? `• ${product.subcategory}` : ''}
            </span>
            <div className="flex items-center gap-1 shrink-0 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] text-stone-700">4.9</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelect(product)}
            className="font-serif text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 hover:text-amber-800 cursor-pointer transition-colors leading-snug group-hover:text-amber-900"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Color & SKU Info */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
            <span className="truncate">
              {product.color ? `Color: ${product.color}` : `SKU: ${product.sku}`}
            </span>
            {savingsAmount > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                Save Rs. {savingsAmount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Interactive Action Row */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs sm:text-base font-bold text-stone-900 font-serif">
                Rs. {product.retailPrice.toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.retailPrice && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                  Rs. {product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-800/80">
              <Truck className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">Cash on Delivery</span>
            </div>
          </div>

          {/* Add to Bag Button with Interactive "Added" feedback state */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`min-w-[40px] min-h-[40px] px-3 py-2 rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-sm ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                : 'bg-stone-900 hover:bg-amber-600 text-white shadow-md active:bg-amber-700'
            }`}
            title={isOutOfStock ? 'Out of stock' : justAdded ? 'Added to bag!' : 'Add to Bag'}
            aria-label="Add to bag"
          >
            <AnimatePresence mode="wait">
              {justAdded ? (
                <motion.div
                  key="checked"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1 text-[11px] font-bold"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span className="hidden sm:inline">Added</span>
                </motion.div>
              ) : (
                <motion.div
                  key="bag"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1 text-[11px] font-bold"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden lg:inline text-[11px]">Add</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
