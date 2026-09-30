import React, { useState } from 'react';
import { ShoppingBag, Eye, Star, Sparkles, MessageCircle, Check, Truck, Flame, Heart, ArrowUpRight } from 'lucide-react';
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'];

  const currentDisplayImage = imagesList[activeImageIndex] || imagesList[0];
  const secondaryImage = imagesList[1] || null;

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
      className="group relative flex flex-col bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-[0_20px_45px_-12px_rgba(180,83,9,0.18)] hover:border-amber-400/70 transition-all duration-300"
    >
      {/* Top Floating Glassmorphism Badges (Sale, Best Seller, New Drop) */}
      <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5 pointer-events-none">
        {product.sale && discountPercent && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-rose-600 via-rose-500 to-red-500 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-md border border-white/20">
            <span>{discountPercent}% OFF</span>
          </span>
        )}

        {product.bestSeller && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-lg border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-stone-950 fill-stone-950" />
            <span>Best Seller</span>
          </span>
        )}

        {product.newArrival && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-950/90 text-stone-100 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded-full shadow-md backdrop-blur-md border border-stone-700/60">
            <span>Eid Edit 2026</span>
          </span>
        )}
      </div>

      {/* Top Right Controls: Floating Wishlist Glass Button & Low Stock Indicator */}
      <div className="absolute top-2.5 right-2.5 z-20 flex flex-col items-end gap-1.5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-all border ${
            isSaved
              ? 'bg-rose-50/95 text-rose-600 border-rose-300 shadow-rose-500/20 ring-2 ring-rose-500/30'
              : 'bg-white/90 text-stone-700 border-white/60 hover:text-rose-600 hover:bg-white'
          }`}
          title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          aria-label={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isSaved ? 'fill-rose-600 text-rose-600' : 'text-stone-700'
            }`}
          />
        </motion.button>

        {isLowStock && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-600/90 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md animate-pulse pointer-events-none border border-orange-400/40">
            <Flame className="w-3 h-3 text-yellow-300" />
            <span>{product.stock} Left</span>
          </span>
        )}
      </div>

      {/* Full-Bleed Image Showcase Container: Completely fills card with zero empty letterboxing */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-[4/5] sm:aspect-[3/4] w-full bg-stone-100 overflow-hidden cursor-pointer select-none"
      >
        {/* Full Edge-to-Edge Image with object-top: Model's head and dress neckline are always preserved */}
        <img
          src={currentDisplayImage}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />

        {/* Secondary Hover Image Swap on Desktop (If user has not manually clicked another dot) */}
        {secondaryImage && activeImageIndex === 0 && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="hidden sm:block absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700 ease-out pointer-events-none"
            loading="lazy"
          />
        )}

        {/* Subtle Bottom Shadow Vignette (blends photo gracefully into card info) */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none"></div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center z-15">
            <span className="bg-stone-900/90 border border-stone-700 text-white text-[11px] sm:text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-2xl">
              Out of Stock
            </span>
          </div>
        )}

        {/* Multi-Image Dots Switcher (If product has 2 or more photos) */}
        {imagesList.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 left-2 z-15 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20"
          >
            {imagesList.slice(0, 4).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeImageIndex === idx
                    ? 'w-3.5 bg-amber-400 shadow-xs'
                    : 'bg-white/60 hover:bg-white'
                }`}
                aria-label={`Show photo ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Fabric & Stitching Pill on Bottom-Right of Image */}
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 pointer-events-none">
          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold rounded-md border border-white/20 shadow-sm">
            {isUnstitched ? 'Unstitched' : 'Stitched'}
          </span>
        </div>

        {/* Desktop Hover Floating Quick Actions Bar */}
        <div className="hidden sm:flex absolute inset-0 bg-stone-950/35 opacity-0 group-hover:opacity-100 transition-all duration-300 items-center justify-center gap-2.5 z-15 backdrop-blur-[1.5px]">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-stone-950 text-xs font-bold rounded-full shadow-2xl hover:bg-amber-400 transition-colors"
            title="Quick View Details"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleWhatsAppInquiry}
            className="flex items-center justify-center p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-colors"
            title="Inquire on WhatsApp"
            aria-label="Inquire on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Details Container - Elevated Luxury Typography & High-Converting UI */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Brand/Category Micro-Header & Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 mb-1 gap-1">
            <span className="uppercase tracking-widest font-semibold text-stone-600 truncate font-mono text-[10px]">
              {product.category} {product.subcategory ? `• ${product.subcategory}` : ''}
            </span>
            <div className="flex items-center gap-1 shrink-0 text-amber-500 font-bold bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/60">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] text-stone-800">4.9</span>
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

          {/* Fabric & Color Pill Row */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1.5 gap-1">
            <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md truncate max-w-[130px]">
              {product.fabric || 'Pure Luxury Fabric'}
            </span>
            {savingsAmount > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 shrink-0">
                Save Rs. {savingsAmount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Interactive Action Row */}
        <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-stone-950 font-serif">
                Rs. {product.retailPrice.toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.retailPrice && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                  Rs. {product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-900/80 font-medium">
              <Truck className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">Express COD</span>
            </div>
          </div>

          {/* Add to Bag Button with Interactive "Added" feedback state */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`min-w-[42px] min-h-[42px] px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-md ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                : 'bg-stone-900 hover:bg-amber-600 text-white hover:shadow-amber-500/20 active:bg-amber-700'
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
                  <span className="hidden md:inline text-[11px]">Add</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
