import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Truck,
  RefreshCw,
  Check,
  AlertCircle,
  Star,
  ShieldCheck,
  Camera,
  MessageSquare,
  Sparkles,
  Share2,
  Copy,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { IProduct, IReview } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductModalProps {
  product: IProduct | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addItem, setIsCheckoutOpen } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews state
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewPhone, setReviewPhone] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

  // Stitched vs Unstitched detection
  const subcategoryLower = (product?.subcategory || '').trim().toLowerCase();
  const categoryLower = (product?.category || '').trim().toLowerCase();
  const isUnstitched =
    subcategoryLower === 'unstitched' ||
    categoryLower === 'unstitched' ||
    categoryLower.includes('unstitched') ||
    Boolean(product?.name?.toLowerCase().includes('unstitched'));

  const isStitched = !isUnstitched;

  // Stitched sizes (exclude any 'Unstitched' or 'Standard' label)
  const availableStitchedSizes = (product?.sizes || []).filter(
    (s) => s && s.toLowerCase() !== 'unstitched' && s.toLowerCase() !== 'standard'
  );
  const displaySizes =
    availableStitchedSizes.length > 0
      ? availableStitchedSizes
      : ['Small', 'Medium', 'Large'];

  // Body Scroll Lock: Locks background scrolling on mount, restores cleanly on close/unmount
  useEffect(() => {
    if (!product) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [product]);

  // Dynamic OpenGraph, Twitter Cards, and Schema.org Product Metadata for Social Media Previews
  useEffect(() => {
    if (!product) return;

    const originalTitle = document.title;
    const formattedPrice = `Rs. ${product.retailPrice.toLocaleString()}`;
    const productTitle = `${product.name} — ${formattedPrice} | MaNHSaaN clothing`;
    document.title = productTitle;

    const cleanSlug = product.slug || product._id;
    const shareUrl = `${window.location.origin}/?product=${encodeURIComponent(cleanSlug)}`;

    // Push shareable URL into browser history without reload
    try {
      window.history.pushState({ productId: product._id }, '', shareUrl);
    } catch {}

    // Primary image resolution
    const rawImg = product.images && product.images[0] ? product.images[0] : '';
    const ogImg = rawImg.startsWith('http')
      ? rawImg
      : rawImg.startsWith('data:')
      ? rawImg
      : `${window.location.origin}${rawImg}`;

    const descriptionText =
      product.shortDescription ||
      (product.description ? product.description.slice(0, 160) : '') ||
      `Buy ${product.name} (${product.category} - ${product.fabric || 'Luxury Fabric'}). Price: ${formattedPrice} with Express Cash on Delivery nationwide.`;

    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let tag = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      let prevContent = '';
      let wasCreated = false;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
        wasCreated = true;
      } else {
        prevContent = tag.getAttribute('content') || '';
      }
      tag.setAttribute('content', content);
      return { tag, prevContent, wasCreated };
    };

    const cleanupMeta = [
      setMetaTag('name', 'description', descriptionText),
      setMetaTag('property', 'og:type', 'product'),
      setMetaTag('property', 'og:title', productTitle),
      setMetaTag('property', 'og:description', descriptionText),
      setMetaTag('property', 'og:image', ogImg),
      setMetaTag('property', 'og:image:alt', `${product.name} — Designer Luxury Ensemble`),
      setMetaTag('property', 'og:url', shareUrl),
      setMetaTag('property', 'og:price:amount', String(product.retailPrice)),
      setMetaTag('property', 'og:price:currency', 'PKR'),
      setMetaTag('property', 'product:price:amount', String(product.retailPrice)),
      setMetaTag('property', 'product:price:currency', 'PKR'),
      setMetaTag('name', 'twitter:card', 'summary_large_image'),
      setMetaTag('name', 'twitter:title', productTitle),
      setMetaTag('name', 'twitter:description', descriptionText),
      setMetaTag('name', 'twitter:image', ogImg),
    ];

    // Schema.org Product JSON-LD structured data
    let scriptTag = document.getElementById('product-schema-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'product-schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: [ogImg],
      description: descriptionText,
      sku: product.sku || product._id,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'MaNHSaaN clothing',
      },
      offers: {
        '@type': 'Offer',
        url: shareUrl,
        priceCurrency: 'PKR',
        price: product.retailPrice,
        priceValidUntil: '2026-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability:
          product.stock > 0 && product.stockState !== 'out_of_stock'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'MaNHSaaN clothing',
        },
      },
    };
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      document.title = originalTitle;
      try {
        window.history.pushState(null, '', window.location.pathname);
      } catch {}
      cleanupMeta.forEach(({ tag, prevContent, wasCreated }) => {
        if (wasCreated) {
          tag.remove();
        } else {
          tag.setAttribute('content', prevContent);
        }
      });
      const existingScript = document.getElementById('product-schema-jsonld');
      if (existingScript) existingScript.remove();
    };
  }, [product]);

  // Fetch reviews when product changes
  useEffect(() => {
    if (!product) return;
    setSelectedImage('');

    const subLower = (product.subcategory || '').trim().toLowerCase();
    const isUnst =
      subLower === 'unstitched' ||
      (product.category || '').trim().toLowerCase().includes('unstitched') ||
      product.name.toLowerCase().includes('unstitched');

    if (isUnst) {
      setSelectedSize('Unstitched');
    } else {
      const validStitched = (product.sizes || []).filter(
        (s) => s && s.toLowerCase() !== 'unstitched' && s.toLowerCase() !== 'standard'
      );
      setSelectedSize(
        validStitched[0] ||
          (product.sizes[0] && product.sizes[0].toLowerCase() !== 'unstitched'
            ? product.sizes[0]
            : 'Medium')
      );
    }

    setQuantity(1);
    setActiveTab('details');

    setLoadingReviews(true);
    fetch(`/api/products/${product._id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [product]);

  if (!product) return null;

  const currentImage = selectedImage || product.images[0] || '';
  const currentSize = isUnstitched
    ? 'Unstitched'
    : selectedSize || displaySizes[0] || 'Standard';
  const isOutOfStock = product.stock <= 0 || product.stockState === 'out_of_stock';
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, currentSize, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, currentSize, quantity);
    onClose();
    setIsCheckoutOpen(true);
  };

  // Secure Photo Selection & Validation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      alert('Please upload a valid image (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size cannot exceed 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReviewPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Review with backend verified buyer verification
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      alert('Please enter your name and comments.');
      return;
    }

    setReviewSubmitting(true);
    setReviewStatus(null);

    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: reviewName,
          customerPhone: reviewPhone,
          rating: reviewRating,
          comment: reviewComment,
          photoUrl: reviewPhoto,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviews((prev) => [data.review, ...prev]);
      setShowReviewForm(false);
      setReviewComment('');
      setReviewPhoto(null);
      setReviewStatus(
        data.isVerifiedBuyer
          ? 'Thank you! Your Verified Buyer review is published.'
          : 'Thank you! Your customer review has been published.'
      );
      setTimeout(() => setReviewStatus(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Could not submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-stone-200/80"
        >
          {/* Close Button — minimum 44x44px tap target on mobile & desktop */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 min-w-[44px] min-h-[44px] p-2 text-stone-500 hover:text-stone-900 bg-white/90 hover:bg-white rounded-full shadow-md transition-all flex items-center justify-center border border-stone-200"
            aria-label="Close product quick view"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Body Container with vertical stack on mobile (<768px), side-by-side on desktop */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            <div className="flex flex-col md:flex-row min-h-0">
              {/* Gallery Column: strict responsive bounds (max-width: 100%, max-height: 50vh on mobile, object-contain, no overflow) */}
              <div className="w-full md:w-1/2 p-4 sm:p-6 bg-stone-50 flex flex-col items-center justify-center gap-3 shrink-0 border-b md:border-b-0 md:border-r border-stone-200">
                <div className="w-full max-w-full max-h-[44vh] md:max-h-[460px] flex items-center justify-center bg-white rounded-xl overflow-hidden border border-stone-200/80 shadow-inner">
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="max-w-full max-h-[44vh] md:max-h-[460px] w-auto h-auto object-contain transition-all duration-300"
                    loading="eager"
                  />
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto w-full py-1 px-0.5 justify-start sm:justify-center">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`min-w-[44px] min-h-[56px] w-12 h-16 rounded-lg border overflow-hidden shrink-0 transition-all ${
                          currentImage === img
                            ? 'border-amber-600 ring-2 ring-amber-500/30 scale-105'
                            : 'border-stone-200 opacity-60 hover:opacity-100'
                        }`}
                        aria-label={`View photo ${idx + 1}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details & Reviews Column */}
              <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Category & SKU */}
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-stone-500 uppercase tracking-widest font-semibold flex-wrap">
                    <span className="text-amber-700 font-bold">{product.brand || 'MaNHSaaN clothing'}</span>
                    <span>•</span>
                    <span>
                      {product.category} {product.subcategory && `(${product.subcategory})`}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-stone-400">{product.sku}</span>
                  </div>

                  {/* Title & Review Rating Badge */}
                  <div>
                    <h2
                      id="quick-view-title"
                      className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight"
                    >
                      {product.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs text-stone-600 font-medium">
                        {reviews.length > 0 ? `${reviews.length} Verified Review(s)` : 'Haute Couture Quality'}
                      </span>
                    </div>
                  </div>

                  {/* Price & Stock status */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl sm:text-2xl font-bold text-stone-900">
                      Rs. {product.retailPrice.toLocaleString()}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.retailPrice && (
                      <span className="text-sm sm:text-base text-stone-400 line-through">
                        Rs. {product.compareAtPrice.toLocaleString()}
                      </span>
                    )}
                    {isOutOfStock ? (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Only {product.stock} Left
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        In Stock ({product.stock})
                      </span>
                    )}
                  </div>

                  {/* Tabs: Details vs Reviews */}
                  <div className="flex border-b border-stone-200 gap-4 pt-1">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`pb-2 text-xs uppercase font-bold tracking-wider transition-colors border-b-2 -mb-px ${
                        activeTab === 'details'
                          ? 'border-amber-600 text-stone-900'
                          : 'border-transparent text-stone-400 hover:text-stone-700'
                      }`}
                    >
                      Specifications
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`pb-2 text-xs uppercase font-bold tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                        activeTab === 'reviews'
                          ? 'border-amber-600 text-stone-900'
                          : 'border-transparent text-stone-400 hover:text-stone-700'
                      }`}
                    >
                      <span>Customer Reviews</span>
                      <span className="px-1.5 py-0.2 bg-stone-100 rounded-full text-[10px] font-bold">
                        {reviews.length}
                      </span>
                    </button>
                  </div>

                  {/* TAB 1: PRODUCT SPECIFICATIONS & OPTIONS */}
                  {activeTab === 'details' && (
                    <div className="space-y-3.5">
                      {/* Fabric, Color, Delivery, Suit Type */}
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500 font-medium">Type / Cut:</span>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                              isUnstitched
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-stone-200 text-stone-800'
                            }`}
                          >
                            {isUnstitched ? 'Unstitched Fabric (Open Suit)' : 'Stitched Ready-to-Wear (Pret)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-medium">Fabric:</span>
                          <span className="text-stone-900 font-semibold">{product.fabric}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-medium">Color:</span>
                          <span className="text-stone-900 font-semibold">{product.color}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-medium">Delivery:</span>
                          <span className="text-stone-900 font-semibold">Express Courier COD</span>
                        </div>
                      </div>

                      {/* Size Selector: ONLY shown when Stitched */}
                      {!isUnstitched && isStitched && displaySizes.length > 0 && (
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                            Select Size: <span className="text-stone-950 font-bold">{currentSize}</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {displaySizes.map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setSelectedSize(sz)}
                                className={`min-w-[44px] min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center ${
                                  currentSize === sz
                                    ? 'bg-stone-900 text-white border-stone-900 shadow'
                                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quantity */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                          Quantity
                        </label>
                        <div className="flex items-center border border-stone-300 rounded-lg w-32 bg-white">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-l-lg"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center text-sm font-semibold text-stone-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-r-lg"
                            disabled={quantity >= product.stock}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {product.description && (
                        <div className="pt-2 text-xs text-stone-600 leading-relaxed max-h-24 overflow-y-auto">
                          {product.description}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: REVIEWS & SOCIAL PROOF */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-3">
                      {reviewStatus && (
                        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                          {reviewStatus}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-700">
                          Customer Experiences
                        </span>
                        <button
                          onClick={() => setShowReviewForm(!showReviewForm)}
                          className="text-xs font-bold text-amber-700 hover:text-amber-800 underline"
                        >
                          {showReviewForm ? 'Cancel' : '+ Write a Review'}
                        </button>
                      </div>

                      {/* Write Review Form */}
                      {showReviewForm && (
                        <form
                          onSubmit={handleSubmitReview}
                          className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-2.5"
                        >
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Your Rating
                            </label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="p-1 focus:outline-none"
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      star <= reviewRating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-stone-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input
                                type="text"
                                placeholder="Your Name *"
                                value={reviewName || ''}
                                onChange={(e) => setReviewName(e.target.value)}
                                className="w-full p-2 border border-stone-300 rounded bg-white"
                                required
                              />
                            </div>
                            <div>
                              <input
                                type="tel"
                                placeholder="Phone (For Verified Buyer Badge)"
                                value={reviewPhone || ''}
                                onChange={(e) => setReviewPhone(e.target.value)}
                                className="w-full p-2 border border-stone-300 rounded bg-white"
                              />
                            </div>
                          </div>

                          <textarea
                            rows={2}
                            placeholder="Share details about the fabric, embroidery, and fit... *"
                            value={reviewComment || ''}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded bg-white"
                            required
                          />

                          {/* Customer Photo Upload */}
                          <div>
                            <label className="flex items-center gap-1.5 text-stone-600 cursor-pointer hover:text-stone-900">
                              <Camera className="w-4 h-4 text-amber-600" />
                              <span>Add customer photo (Max 5MB)</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </label>
                            {reviewPhoto && (
                              <div className="mt-1.5 relative w-12 h-12 rounded border overflow-hidden">
                                <img src={reviewPhoto} alt="Upload preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setReviewPhoto(null)}
                                  className="absolute top-0 right-0 bg-stone-900/80 text-white rounded-bl p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={reviewSubmitting}
                            className="w-full py-2 bg-stone-900 text-white rounded font-bold uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50"
                          >
                            {reviewSubmitting ? 'Verifying...' : 'Submit Review'}
                          </button>
                        </form>
                      )}

                      {/* Reviews List */}
                      <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
                        {reviews.length === 0 ? (
                          <div className="text-center py-4 text-stone-400 text-xs">
                            No reviews yet. Be the first to share your experience!
                          </div>
                        ) : (
                          reviews.map((rev) => (
                            <div
                              key={rev._id}
                              className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-stone-900">{rev.customerName}</span>
                                  {rev.isVerifiedBuyer && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                      Verified Buyer
                                    </span>
                                  )}
                                </div>
                                <div className="flex text-amber-400">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3 h-3 ${
                                        s <= rev.rating ? 'fill-amber-400' : 'text-stone-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-stone-700 leading-relaxed">{rev.comment}</p>
                              {rev.photoUrl && (
                                <div className="mt-1.5">
                                  <img
                                    src={rev.photoUrl}
                                    alt="Customer review photo"
                                    className="w-14 h-14 object-cover rounded-lg border border-stone-200"
                                  />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Action Buttons with Framer Motion hover/tap */}
                <div className="space-y-2 pt-3 border-t border-stone-200">
                  <div className="flex gap-2.5 sm:gap-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 min-h-[44px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        isOutOfStock
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : addedNotice
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-stone-900 text-white hover:bg-stone-800 shadow-md'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span>{addedNotice ? 'Added to Bag!' : 'Add to Bag'}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      className={`flex-1 min-h-[44px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                        isOutOfStock
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                      }`}
                    >
                      Buy Now (COD)
                    </motion.button>
                  </div>

                    {/* Reassurances & Social Share */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                        <span>Express Courier COD</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                        <span>7-Day Returns</span>
                      </div>
                    </div>

                    {/* Social Media Share & OpenGraph Link Preview */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-stone-400" />
                        <span>Share Dress:</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const cleanSlug = product.slug || product._id;
                            const shareUrl = `${window.location.origin}/?product=${encodeURIComponent(cleanSlug)}`;
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(shareUrl);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }
                          }}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Copy direct product link"
                        >
                          {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-500" />}
                          <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const cleanSlug = product.slug || product._id;
                            const shareUrl = `${window.location.origin}/?product=${encodeURIComponent(cleanSlug)}`;
                            const text = encodeURIComponent(
                              `As-salamu alaykum! Check out this designer dress on MaNHSaaN clothing: "${product.name}" for Rs. ${product.retailPrice.toLocaleString()} with Cash on Delivery nationwide.\n\nView here: ${shareUrl}`
                            );
                            window.open(`https://wa.me/?text=${text}`, '_blank');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Share on WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
