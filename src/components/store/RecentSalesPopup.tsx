import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Star, Sparkles, ShoppingBag } from 'lucide-react';
import type { IProduct } from '../../types';
import { api } from '../../services/api';

interface FakePurchase {
  customerName: string;
  city: string;
  timeAgo: string;
  rating: number;
  satisfactionNote: string;
  productName: string;
  productImage: string;
  price: number;
  productRef?: IProduct;
}

const CUSTOMER_POOL = [
  { name: 'Fatima Khan', city: 'DHA Phase 5, Lahore', note: 'Fabric & embroidery exceeded expectations. 100% pure Swiss quality!' },
  { name: 'Ayesha Siddiqui', city: 'F-8/3, Islamabad', note: 'Zari and resham work is stunning. Delivered in 48 hours via COD!' },
  { name: 'Muhammad Hamza', city: 'Clifton Block 4, Karachi', note: 'Pure 10-pound Boski with royal drape. Extremely satisfied.' },
  { name: 'Zainab Raza', city: 'Gulshan-e-Iqbal, Karachi', note: 'Stitching finish is flawless. Exactly like original catalog shoot!' },
  { name: 'Maham Tariq', city: 'Canal Road, Faisalabad', note: 'Organza dupatta and jacquard weave is heavenly. Highly recommended!' },
  { name: 'Hira Usman', city: 'Saddar Cantt, Rawalpindi', note: 'Ordered for upcoming family wedding. Packing and luxury box was top tier!' },
  { name: 'Khadija Shah', city: 'University Town, Peshawar', note: 'Super satisfied! Unstitched suit had generous 3.5 meter shirt fabric.' },
  { name: 'Sana Bilal', city: 'Model Town, Multan', note: 'Color vibrancy and lawn breathability is superb in summer heat.' },
  { name: 'Maryam Noor', city: 'DHA Phase 6, Karachi', note: 'Chiffon embroidery with tilla border is breathtaking in real life.' },
  { name: 'Bilal Farooq', city: 'Cantt, Sialkot', note: 'Original gold seal gent’s fabric. Master tailor stitched it effortlessly.' },
  { name: 'Samina Arshad', city: 'Cantt, Quetta', note: 'Delivered fast through Express courier. Very satisfied with customer service!' },
  { name: 'Nimra Javed', city: 'Wapda Town, Gujranwala', note: 'Luxury pret cut and lace embellishment is gorgeous. 5/5 stars!' },
];

const TIME_AGOS = [
  'Just now',
  '1 minute ago',
  '2 minutes ago',
  '4 minutes ago',
  '6 minutes ago',
  '8 minutes ago',
  '11 minutes ago',
];

interface RecentSalesPopupProps {
  products?: IProduct[];
  onSelectProduct?: (product: IProduct) => void;
}

export const RecentSalesPopup: React.FC<RecentSalesPopupProps> = ({
  products: initialProducts = [],
  onSelectProduct,
}) => {
  const [dbProducts, setDbProducts] = useState<IProduct[]>(initialProducts);
  const [currentPurchase, setCurrentPurchase] = useState<FakePurchase | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // References to guarantee unique cycling across all database products
  const productIndexRef = useRef(0);
  const customerIndexRef = useRef(0);
  const lastProductIdRef = useRef<string | null>(null);
  const isDismissedRef = useRef(false);

  // Fetch full active catalog if initial products is limited
  useEffect(() => {
    let isMounted = true;
    const loadAllCatalog = async () => {
      try {
        const res = await api.getPublicProducts({});
        if (isMounted && res.products && res.products.length > 0) {
          // Shuffle products pool so each user gets a fresh diverse sequence
          const shuffled = [...res.products].sort(() => Math.random() - 0.5);
          setDbProducts(shuffled);
        }
      } catch {
        // fallback to initialProducts if API call fails
      }
    };

    loadAllCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update pool if initialProducts provided and state is empty
  useEffect(() => {
    if (initialProducts.length > 0 && dbProducts.length === 0) {
      setDbProducts(initialProducts);
    }
  }, [initialProducts, dbProducts.length]);

  useEffect(() => {
    isDismissedRef.current = isDismissed;
  }, [isDismissed]);

  // Main Pop-up Cycle
  useEffect(() => {
    if (isDismissed) return;

    let hideTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    const triggerNext = () => {
      if (isDismissedRef.current) return;

      const pool = dbProducts.length > 0 ? dbProducts : initialProducts;
      if (pool.length === 0) return;

      // Select next product ensuring it NEVER repeats the immediate previous product
      let candidate = pool[productIndexRef.current % pool.length];
      if (pool.length > 1 && candidate._id === lastProductIdRef.current) {
        productIndexRef.current += 1;
        candidate = pool[productIndexRef.current % pool.length];
      }
      lastProductIdRef.current = candidate._id;
      productIndexRef.current = (productIndexRef.current + 1) % pool.length;

      // Select next customer
      const cust = CUSTOMER_POOL[customerIndexRef.current % CUSTOMER_POOL.length];
      customerIndexRef.current = (customerIndexRef.current + 1) % CUSTOMER_POOL.length;
      const timeAgo = TIME_AGOS[Math.floor(Math.random() * TIME_AGOS.length)];

      const purchaseItem: FakePurchase = {
        customerName: cust.name,
        city: cust.city,
        timeAgo,
        rating: 5,
        satisfactionNote: cust.note,
        productName: candidate.name,
        productImage: candidate.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
        price: candidate.retailPrice || 5500,
        productRef: candidate,
      };

      setCurrentPurchase(purchaseItem);
      setIsVisible(true);

      // Show for 6.5 seconds
      hideTimer = setTimeout(() => {
        setIsVisible(false);

        // Schedule next alert in 14 to 20 seconds for organic natural pacing
        const intervalDelay = 14000 + Math.floor(Math.random() * 6000);
        nextTimer = setTimeout(triggerNext, intervalDelay);
      }, 6500);
    };

    // First popup triggers after 4.5 seconds
    const startTimer = setTimeout(triggerNext, 4500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [dbProducts, initialProducts, isDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleCardClick = () => {
    if (currentPurchase?.productRef && onSelectProduct) {
      onSelectProduct(currentPurchase.productRef);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40 pointer-events-none">
      <AnimatePresence>
        {isVisible && currentPurchase && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={handleCardClick}
            className="pointer-events-auto cursor-pointer bg-stone-950/95 backdrop-blur-md text-white border border-amber-500/40 hover:border-amber-400 rounded-xl p-3 sm:p-3.5 shadow-2xl max-w-[340px] sm:max-w-[370px] flex gap-3 relative overflow-hidden group transition-all"
            role="alert"
            aria-live="polite"
          >
            {/* Ambient Gold Glow Line */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-600 via-amber-300 to-amber-500 animate-pulse" />

            {/* Product Thumbnail with Price Badge */}
            <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-lg overflow-hidden flex-shrink-0 bg-stone-900 border border-amber-500/20 relative shadow-inner">
              <img
                src={currentPurchase.productImage}
                alt={currentPurchase.productName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80';
                }}
              />
              <span className="absolute bottom-0 inset-x-0 bg-stone-950/90 text-[10px] text-amber-300 text-center font-bold py-0.5 border-t border-amber-500/30">
                Rs. {currentPurchase.price.toLocaleString()}
              </span>
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0 pr-4 flex flex-col justify-between">
              <div>
                {/* Header: Verified & Time */}
                <div className="flex items-center justify-between gap-1 text-[10px] text-stone-400 mb-0.5">
                  <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Verified Purchase</span>
                  </div>
                  <span className="text-stone-400 text-[9px]">{currentPurchase.timeAgo}</span>
                </div>

                {/* Customer & City */}
                <div className="text-xs font-bold text-amber-200 truncate flex items-center gap-1">
                  <span>{currentPurchase.customerName}</span>
                  <span className="text-stone-400 font-normal text-[10px]">({currentPurchase.city})</span>
                </div>

                {/* Product Title */}
                <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors mt-0.5">
                  {currentPurchase.productName}
                </p>
              </div>

              {/* Customer Review Quote & 5-Stars */}
              <div className="mt-1 pt-1 border-t border-stone-800">
                <div className="flex items-center gap-1 mb-0.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-amber-300">100% Satisfied</span>
                </div>
                <p className="text-[10px] text-stone-300 italic line-clamp-1 leading-snug">
                  "{currentPurchase.satisfactionNote}"
                </p>
              </div>

              {/* Quick View Prompt */}
              <div className="mt-1 flex items-center gap-1 text-[9px] text-amber-400/80 font-medium">
                <ShoppingBag className="w-2.5 h-2.5" />
                <span>Tap to view product</span>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-1.5 right-1.5 p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
