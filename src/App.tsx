import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { CustomCursor } from './components/common/CustomCursor';
import { HeroCarousel } from './components/store/HeroCarousel';
import { CategoryGrid } from './components/store/CategoryGrid';
import { TestimonialsSlider } from './components/store/TestimonialsSlider';
import { LoadingScreen } from './components/store/LoadingScreen';
import { RecentSalesPopup } from './components/store/RecentSalesPopup';
import { ProductCard, ProductCardSkeleton } from './components/store/ProductCard';
import { ProductModal } from './components/store/ProductModal';
import { CartDrawer } from './components/store/CartDrawer';
import { WishlistDrawer } from './components/store/WishlistDrawer';
import { CheckoutModal } from './components/store/CheckoutModal';
import { OrderSuccessModal } from './components/store/OrderSuccessModal';
const TrackOrderView = React.lazy(() => import('./components/store/TrackOrderView').then((m) => ({ default: m.TrackOrderView })));
const ExchangeRequestView = React.lazy(() => import('./components/store/ExchangeRequestView').then((m) => ({ default: m.ExchangeRequestView })));
const ResellerPortal = React.lazy(() => import('./components/reseller/ResellerPortal').then((m) => ({ default: m.ResellerPortal })));
const AdminPortal = React.lazy(() => import('./components/admin/AdminPortal').then((m) => ({ default: m.AdminPortal })));
const LoginModal = React.lazy(() => import('./components/auth/AuthModals').then((m) => ({ default: m.LoginModal })));
const ResellerApplyModal = React.lazy(() => import('./components/auth/AuthModals').then((m) => ({ default: m.ResellerApplyModal })));
const ResellerWorkGuideModal = React.lazy(() => import('./components/reseller/ResellerWorkGuideModal').then((m) => ({ default: m.ResellerWorkGuideModal })));
import { api } from './services/api';
import type { IProduct, IOrder, ICategory } from './types';
import { Filter, Truck, ShieldCheck, Clock, ChevronLeft, ChevronRight, ArrowDown, Sparkles } from 'lucide-react';

const StorefrontContent: React.FC = () => {
  const { user, brandName } = useAuth();
  const { recoveredNotice, setRecoveredNotice } = useCart();
  const { toastMessage } = useWishlist();
  const [currentView, setCurrentView] = useState<'store' | 'reseller' | 'admin'>('store');

  // Products & Categories state with instant local Stale-While-Revalidate caching
  const [products, setProducts] = useState<IProduct[]>(() => {
    try {
      const cached = localStorage.getItem('manhsaan_products_cache_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [categories, setCategories] = useState<ICategory[]>(() => {
    try {
      const cached = localStorage.getItem('manhsaan_categories_cache_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [initialAppLoading, setInitialAppLoading] = useState(false);

  // Filters
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest');

  // Progressive Pagination & Infinite Scroll State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Optimal chunk for mobile and desktop DOM memory performance
  const [visibleCount, setVisibleCount] = useState(12);
  const [displayMode, setDisplayMode] = useState<'all' | 'infinite' | 'paged'>('all');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // Reset pagination counters whenever filters or search change
  useEffect(() => {
    setVisibleCount(12);
    setCurrentPage(1);
  }, [activeCategory, searchQuery, selectedFabric, sortBy]);

  // Modals & Active Views
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<IOrder | null>(null);
  const [showTrackView, setShowTrackView] = useState(false);
  const [trackInitialData, setTrackInitialData] = useState<{ orderNumber: string; phone: string }>({
    orderNumber: '',
    phone: '',
  });
  const [showExchangeView, setShowExchangeView] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showResellerGuide, setShowResellerGuide] = useState(false);

  // Load categories dynamically
  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
        try {
          localStorage.setItem('manhsaan_categories_cache_v1', JSON.stringify(res.categories));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Load public products
  const fetchProducts = async () => {
    try {
      if (products.length === 0) setLoading(true);
      const params: Record<string, any> = { limit: 'all' };
      if (activeCategory !== 'all' && activeCategory !== 'sale') {
        const parts = activeCategory.split('-');
        params.category = parts[0];
        if (parts[1]) params.subcategory = parts[1];
      }
      if (activeCategory === 'sale') {
        params.sale = true;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.getPublicProducts(params);
      let list = res.products || [];

      // Client-side fabric filter
      if (selectedFabric !== 'all') {
        list = list.filter(
          (p: IProduct) =>
            p.fabric.toLowerCase().includes(selectedFabric.toLowerCase()) ||
            p.category.toLowerCase().includes(selectedFabric.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase() === selectedFabric.toLowerCase())
        );
      }

      // Sort
      if (sortBy === 'price-asc') {
        list.sort((a: IProduct, b: IProduct) => a.retailPrice - b.retailPrice);
      } else if (sortBy === 'price-desc') {
        list.sort((a: IProduct, b: IProduct) => b.retailPrice - a.retailPrice);
      } else if (sortBy === 'popular') {
        list.sort((a: IProduct, b: IProduct) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
      }

      setProducts(list);
      // Cache the default catalog view for instant future loads
      if (activeCategory === 'all' && !searchQuery.trim() && selectedFabric === 'all') {
        try {
          localStorage.setItem('manhsaan_products_cache_v2', JSON.stringify(list));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, searchQuery, selectedFabric, sortBy]);

  // Deep Link / Social Share Handler: Automatically opens ProductModal when ?product=<slug_or_id> is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get('product');
    if (!productParam) return;

    // Check if the product is already in the loaded products list
    const existing = products.find(
      (p) => p.slug === productParam || p._id === productParam
    );
    if (existing) {
      setSelectedProduct(existing);
      return;
    }

    // If not found in current list (or loaded during direct link share), fetch via API
    api
      .getPublicProductBySlug(productParam)
      .then((res) => {
        if (res && res.product) {
          setSelectedProduct(res.product);
        }
      })
      .catch(() => {});
  }, [products]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (displayMode !== 'infinite') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          visibleCount < products.length &&
          !isLoadingMore &&
          !loading
        ) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 8, products.length));
            setIsLoadingMore(false);
          }, 350);
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
      observer.disconnect();
    };
  }, [displayMode, visibleCount, products.length, isLoadingMore, loading]);

  // Computed products for display
  const displayedProducts =
    displayMode === 'all'
      ? products
      : displayMode === 'infinite'
      ? products.slice(0, visibleCount)
      : products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handleSelectCategory = (category: string, subcategory?: string) => {
    setShowTrackView(false);
    setShowExchangeView(false);
    if (category === 'all') {
      setActiveCategory('all');
    } else if (category === 'sale') {
      setActiveCategory('sale');
    } else if (subcategory) {
      setActiveCategory(`${category}-${subcategory}`);
    } else {
      setActiveCategory(category);
    }
  };

  const handleOpenTrackFromConfirmation = (orderNumber: string, phone: string) => {
    setTrackInitialData({ orderNumber, phone });
    setShowTrackView(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-200">
      {/* Subtle Desktop Fashion Custom Cursor */}
      <CustomCursor />

      {/* Dismissible Top Announcement Bar */}
      <AnnouncementBar
        text="EID EDIT 2026 — UP TO 30% OFF | SHOP NOW"
        onActionClick={() => handleSelectCategory('Festive Wear')}
      />

      {/* Recovered Cart Notice Banner */}
      {recoveredNotice && (
        <div className="bg-amber-400 text-stone-950 px-4 py-2.5 text-xs font-bold flex items-center justify-between z-40 border-b border-amber-500 shadow-sm">
          <span>{recoveredNotice}</span>
          <button
            onClick={() => setRecoveredNotice(null)}
            className="p-1 hover:bg-amber-500/30 rounded text-stone-900 font-bold"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navbar with Dynamic Categories & Mobile Optimization */}
      <Navbar
        onOpenTrack={() => {
          setShowTrackView(true);
          setShowExchangeView(false);
          setCurrentView('store');
        }}
        onOpenExchange={() => {
          setShowExchangeView(true);
          setShowTrackView(false);
          setCurrentView('store');
        }}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenApply={() => setShowApplyModal(true)}
        onOpenResellerGuide={() => setShowResellerGuide(true)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentView={currentView}
        setCurrentView={setCurrentView}
        categories={categories}
        selectedFabric={selectedFabric}
        onSelectFabric={setSelectedFabric}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <React.Suspense
          fallback={
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
              <div className="w-9 h-9 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
              <span className="text-xs text-stone-500 font-mono">Loading dynamic view...</span>
            </div>
          }
        >
          {currentView === 'admin' ? (
            <AdminPortal />
          ) : currentView === 'reseller' ? (
            <ResellerPortal onOpenGuide={() => setShowResellerGuide(true)} />
          ) : showTrackView ? (
            <TrackOrderView
              initialOrderNumber={trackInitialData.orderNumber}
              initialPhone={trackInitialData.phone}
              onBack={() => setShowTrackView(false)}
            />
          ) : showExchangeView ? (
            <ExchangeRequestView onBack={() => setShowExchangeView(false)} />
          ) : (
            <div className="space-y-6 sm:space-y-10 pb-16">
            {/* 1. High-Impact Seasonal Hero Carousel with Framer Motion */}
            <HeroCarousel
              onSelectCategory={(cat, fab) => {
                if (cat !== 'all') handleSelectCategory(cat);
                if (fab) setSelectedFabric(fab);
              }}
            />

            {/* Value Guarantees Strip */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-stone-200 shadow-xs flex flex-col items-center justify-center">
                  <Truck className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="text-[11px] sm:text-xs font-bold text-stone-900 block">Nationwide COD</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-500 hidden sm:block">Cash upon Delivery</span>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-stone-200 shadow-xs flex flex-col items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[11px] sm:text-xs font-bold text-stone-900 block">100% Original Fabric</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-500 hidden sm:block">Pure Swiss Voile & Boski</span>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-stone-200 shadow-xs flex flex-col items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="text-[11px] sm:text-xs font-bold text-stone-900 block">7-Day Exchange</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-500 hidden sm:block">Hassle-free guarantee</span>
                </div>
              </div>
            </div>

            {/* 2. Visual Category Grid & Seasonal Collections */}
            <CategoryGrid
              onSelectCategory={(cat, fab) => {
                if (cat !== 'all') handleSelectCategory(cat);
                if (fab) setSelectedFabric(fab);
              }}
            />

            {/* Filter and Sorting Toolbar - Dynamic Categories from Super Admin */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
              <div className="bg-white p-3 sm:p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
                {/* Horizontal Touch Scroll for Fabric Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap pb-1 md:pb-0">
                  <span className="font-semibold text-stone-700 flex items-center gap-1 text-xs shrink-0 mr-1">
                    <Filter className="w-3.5 h-3.5 text-stone-500" />
                    Fabric:
                  </span>

                  {['all', ...categories.map((c) => c.name)].map((fab) => (
                    <button
                      key={fab}
                      onClick={() => setSelectedFabric(fab)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                        selectedFabric === fab
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {fab === 'all' ? 'All Fabrics' : fab}
                    </button>
                  ))}
                </div>

                {/* Sort selector */}
                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <span className="text-stone-500 font-medium shrink-0">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:outline-none"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="popular">Best Sellers</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid & Progressive Loading */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
              {loading ? (
                /* Professional Skeleton Screen Grid during Initial Data Fetching */
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                    <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      Loading artisanal luxury collection...
                    </span>
                    <span className="text-[11px] text-stone-400">Core Web Vitals Optimized</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <ProductCardSkeleton key={`loading-skeleton-${idx}`} />
                    ))}
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-stone-200 p-8 space-y-3 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-stone-800">No matching designs found</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Try adjusting your search keywords, clearing fabric filters, or viewing all collections.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFabric('all');
                      setActiveCategory('all');
                    }}
                    className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {/* Active Products Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                    {displayedProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onSelect={(p) => setSelectedProduct(p)}
                      />
                    ))}

                    {/* Shimmer skeleton screens when loading more batch in infinite scroll */}
                    {isLoadingMore &&
                      Array.from({ length: Math.min(4, products.length - visibleCount) }).map((_, idx) => (
                        <ProductCardSkeleton key={`more-skeleton-${idx}`} />
                      ))}
                  </div>

                  {/* Infinite Scroll Sentinel */}
                  {displayMode === 'infinite' && visibleCount < products.length && (
                    <div ref={observerTarget} className="h-4 w-full pointer-events-none" />
                  )}

                  {/* Pagination & View Mode Controls */}
                  <div className="pt-5 border-t border-stone-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Progress Indicator */}
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 text-xs text-stone-600 text-center sm:text-left w-full md:w-auto">
                      <span className="font-semibold text-stone-900">
                        {displayMode === 'all'
                          ? `Showing All ${products.length} Designs`
                          : displayMode === 'infinite'
                          ? `Showing ${Math.min(visibleCount, products.length)} of ${products.length} Designs`
                          : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, products.length)} of ${products.length} Designs`}
                      </span>
                      {/* Visual Progress Bar */}
                      <div className="w-48 sm:w-36 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              displayMode === 'all'
                                ? 100
                                : displayMode === 'infinite'
                                ? (Math.min(visibleCount, products.length) / (products.length || 1)) * 100
                                : (Math.min(currentPage * itemsPerPage, products.length) / (products.length || 1)) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* View Mode Switcher + Actions */}
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto">
                      {/* View Mode Pills */}
                      <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setDisplayMode('all')}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            displayMode === 'all'
                              ? 'bg-stone-900 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          View All ({products.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDisplayMode('infinite');
                            setVisibleCount(8);
                          }}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            displayMode === 'infinite'
                              ? 'bg-stone-900 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Infinite Scroll
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDisplayMode('paged');
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            displayMode === 'paged'
                              ? 'bg-stone-900 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Pages ({totalPages})
                        </button>
                      </div>

                      {/* Infinite Scroll Load More Button */}
                      {displayMode === 'infinite' && visibleCount < products.length && (
                        <button
                          onClick={() => {
                            setIsLoadingMore(true);
                            setTimeout(() => {
                              setVisibleCount((prev) => Math.min(prev + 8, products.length));
                              setIsLoadingMore(false);
                            }, 300);
                          }}
                          disabled={isLoadingMore}
                          className="px-5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isLoadingMore ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                              <span>Load More (+{Math.min(8, products.length - visibleCount)})</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Numbered Pagination Buttons */}
                      {displayMode === 'paged' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setCurrentPage((p) => Math.max(1, p - 1));
                              window.scrollTo({ top: 500, behavior: 'smooth' });
                            }}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Previous Page"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {Array.from({ length: totalPages }).map((_, idx) => {
                            const pageNumber = idx + 1;
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => {
                                  setCurrentPage(pageNumber);
                                  window.scrollTo({ top: 500, behavior: 'smooth' });
                                }}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentPage === pageNumber
                                    ? 'bg-stone-900 text-white shadow-xs'
                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => {
                              setCurrentPage((p) => Math.min(totalPages, p + 1));
                              window.scrollTo({ top: 500, behavior: 'smooth' });
                            }}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Next Page"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Customer Testimonials Slider */}
            <TestimonialsSlider />
          </div>
        )}
        </React.Suspense>
      </main>

      {/* Footer */}
      <Footer
        onOpenTrack={() => {
          setShowTrackView(true);
          setShowExchangeView(false);
          setCurrentView('store');
        }}
        onOpenExchange={() => {
          setShowExchangeView(true);
          setShowTrackView(false);
          setCurrentView('store');
        }}
        onOpenApply={() => setShowApplyModal(true)}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenResellerGuide={() => setShowResellerGuide(true)}
      />

      {/* Global Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer />

      <WishlistDrawer onSelectProduct={(p) => setSelectedProduct(p)} />

      {/* Floating Wishlist Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-stone-950/95 text-stone-100 text-xs font-semibold rounded-full shadow-2xl border border-stone-800 flex items-center gap-2 backdrop-blur-md animate-fadeIn">
          <span>{toastMessage}</span>
        </div>
      )}

      <CheckoutModal
        onSuccess={(order) => {
          setConfirmedOrder(order);
        }}
      />

      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={handleOpenTrackFromConfirmation}
      />

      <React.Suspense fallback={null}>
        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onSuccess={(role) => {
              setShowTrackView(false);
              setShowExchangeView(false);
              if (role === 'SUPER_ADMIN') {
                setCurrentView('admin');
              } else {
                setCurrentView('reseller');
              }
            }}
            onSwitchToApply={() => setShowApplyModal(true)}
          />
        )}

        {showApplyModal && (
          <ResellerApplyModal
            isOpen={showApplyModal}
            onClose={() => setShowApplyModal(false)}
            onOpenGuide={() => setShowResellerGuide(true)}
          />
        )}

        {showResellerGuide && (
          <ResellerWorkGuideModal
            isOpen={showResellerGuide}
            onClose={() => setShowResellerGuide(false)}
            onOpenApply={() => {
              setShowResellerGuide(false);
              setShowApplyModal(true);
            }}
            onOpenLogin={() => {
              setShowResellerGuide(false);
              setShowLoginModal(true);
            }}
          />
        )}
      </React.Suspense>

      {/* Realtime Social Proof Satisfied Customer Popup (Bottom-Right) */}
      <RecentSalesPopup products={products} />

      {/* Branded First-Load Splash Screen */}
      <LoadingScreen isLoading={initialAppLoading} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <StorefrontContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
