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
import { ProductCard } from './components/store/ProductCard';
import { ProductModal } from './components/store/ProductModal';
import { CartDrawer } from './components/store/CartDrawer';
import { WishlistDrawer } from './components/store/WishlistDrawer';
import { CheckoutModal } from './components/store/CheckoutModal';
import { OrderSuccessModal } from './components/store/OrderSuccessModal';
import { TrackOrderView } from './components/store/TrackOrderView';
import { ExchangeRequestView } from './components/store/ExchangeRequestView';
import { ResellerPortal } from './components/reseller/ResellerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { LoginModal, ResellerApplyModal } from './components/auth/AuthModals';
import { api } from './services/api';
import type { IProduct, IOrder, ICategory } from './types';
import { Filter, Truck, ShieldCheck, Clock } from 'lucide-react';

const StorefrontContent: React.FC = () => {
  const { user, brandName } = useAuth();
  const { recoveredNotice, setRecoveredNotice } = useCart();
  const { toastMessage } = useWishlist();
  const [currentView, setCurrentView] = useState<'store' | 'reseller' | 'admin'>('store');

  // Products & Categories state
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialAppLoading, setInitialAppLoading] = useState(true);

  // Filters
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest');

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

  // Load categories dynamically
  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Load public products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
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
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    const timer = setTimeout(() => {
      setInitialAppLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, searchQuery, selectedFabric, sortBy]);

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
        {currentView === 'admin' ? (
          <AdminPortal />
        ) : currentView === 'reseller' ? (
          <ResellerPortal />
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

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
              {loading ? (
                <div className="text-center py-20 space-y-3">
                  <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-stone-500 font-medium">Loading collection...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-stone-200 p-8 space-y-3">
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
                    className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onSelect={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 3. Customer Testimonials Slider */}
            <TestimonialsSlider />
          </div>
        )}
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

      <ResellerApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />

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
