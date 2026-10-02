import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  RefreshCw,
  UserCheck,
  Shield,
  LogOut,
  X,
  Tag,
  MessageCircle,
  Heart,
  BookOpen,
  User,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Layers,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { BrandLogo } from './BrandLogo';
import type { ICategory } from '../../types';

interface NavbarProps {
  onOpenTrack: () => void;
  onOpenExchange: () => void;
  onOpenLogin: () => void;
  onOpenApply: () => void;
  onOpenResellerGuide?: () => void;
  activeCategory: string;
  onSelectCategory: (category: string, subcategory?: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentView: 'store' | 'reseller' | 'admin';
  setCurrentView: (view: 'store' | 'reseller' | 'admin') => void;
  categories?: ICategory[];
  selectedFabric?: string;
  onSelectFabric?: (fabric: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTrack,
  onOpenExchange,
  onOpenLogin,
  onOpenApply,
  onOpenResellerGuide,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  currentView,
  setCurrentView,
  categories = [],
  selectedFabric = 'all',
  onSelectFabric,
}) => {
  const { user, brandName, logout } = useAuth();
  const { totalSuitsCount, setIsCartOpen, resellerCode, setResellerCode } = useCart();
  const { totalSavedCount, setIsWishlistOpen } = useWishlist();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const handleBrandClick = () => {
    setCurrentView('store');
    onSelectCategory('all');
    if (onSelectFabric) onSelectFabric('all');
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
        {/* Minimal Micro Utility Header (Pakistan Express COD & Direct WhatsApp) */}
        <div className="bg-stone-950 text-stone-300 text-[11px] py-1.5 px-3 sm:px-6 border-b border-stone-900">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">
                Express Cash on Delivery Across Pakistan • Hotline:{' '}
                <a
                  href="https://wa.me/923235277238"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 font-bold hover:underline"
                >
                  +92 323 5277238
                </a>
              </span>
            </div>

            {/* Referred Reseller Badge if active */}
            {resellerCode && (
              <div className="hidden sm:flex items-center gap-1.5 bg-stone-900 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 text-[10px] shrink-0 font-mono">
                <Tag className="w-3 h-3 text-amber-400" />
                <span>Ref: <strong>{resellerCode}</strong></span>
                <button
                  onClick={() => setResellerCode(null)}
                  className="ml-1 text-stone-400 hover:text-white"
                  title="Remove referral code"
                >
                  ×
                </button>
              </div>
            )}

            <div className="hidden md:flex items-center gap-4 text-stone-400">
              <button
                onClick={onOpenTrack}
                className="hover:text-stone-200 transition-colors flex items-center gap-1"
              >
                <Truck className="w-3 h-3" />
                <span>Track Order</span>
              </button>
              <button
                onClick={onOpenExchange}
                className="hover:text-stone-200 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Exchange</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar Bar: Clean Logo on Left, Search + Bag + Creative Hamburger on Right */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          {/* LEFT: Clean Brand Logo */}
          <div className="flex items-center shrink-0">
            <button
              onClick={handleBrandClick}
              className="text-left group flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-90 cursor-pointer"
              title="MaNHSaaN clothing — Return to Home"
            >
              <BrandLogo variant="dark" size="sm" showSubtitle={true} showEmblem={true} />
            </button>
          </div>

          {/* RIGHT: Actions Cluster (Desktop Search Bar -> Mobile Search Trigger -> Bag -> Creative Hamburger) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search Bar (Placed directly to the left of the hamburger & bag) */}
            <div className="hidden lg:flex items-center relative w-64 xl:w-72">
              <input
                type="text"
                placeholder="Search dresses, lawn, pret..."
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 hover:bg-stone-100/80 focus:bg-white border border-stone-200 rounded-full focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2 text-[11px] font-semibold text-stone-400 hover:text-stone-700 p-0.5"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile / Tablet Search Trigger Button (Left of Hamburger) */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-stone-950 rounded-full hover:bg-stone-100 transition-colors relative"
              aria-label="Search dresses"
              title="Search dresses"
            >
              <Search className="w-5 h-5 text-stone-700" />
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              id="cart-trigger-btn"
              className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-900 rounded-full transition-colors shrink-0"
              title="View Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 text-stone-800" />
              <span className="text-xs font-semibold hidden md:inline">Bag</span>
              <span className="bg-amber-400 text-stone-950 text-[11px] font-extrabold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs">
                {totalSuitsCount}
              </span>
            </button>

            {/* CREATIVE ATTRACTIVE HAMBURGER BUTTON */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="group relative flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-full bg-stone-950 text-white hover:bg-stone-900 transition-all duration-300 shadow-md hover:shadow-amber-500/15 hover:border-amber-400/60 border border-stone-800 active:scale-95 cursor-pointer"
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <span className="hidden sm:inline-block font-sans text-[11px] font-bold tracking-widest uppercase text-stone-200 group-hover:text-amber-300 transition-colors">
                Menu
              </span>

              {/* Creative 3-line animated hamburger jewel */}
              <div className="w-4.5 h-3.5 relative flex flex-col justify-between items-end">
                <span className="h-[2px] w-4.5 rounded-full bg-amber-400 transition-all duration-300 group-hover:bg-amber-300" />
                <span className="h-[2px] w-3 rounded-full bg-stone-200 transition-all duration-300 group-hover:w-4.5" />
                <span className="h-[2px] w-4 rounded-full bg-amber-400 transition-all duration-300 group-hover:w-4.5 group-hover:bg-amber-300" />
              </div>
            </button>
          </div>
        </div>

        {/* Expandable Mobile Search Field (Slides down when search icon is clicked) */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden px-3 pb-3 pt-1 border-t border-stone-100 bg-stone-50 overflow-hidden"
            >
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search fabrics, lawn, unstitched, stitched..."
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-full shadow-xs focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-amber-500/20"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 p-1"
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    onClick={() => setMobileSearchOpen(false)}
                    className="absolute right-3 top-2 text-xs text-stone-400 hover:text-stone-700 p-1"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile & Desktop Horizontal Categories Strip (Quick Touch Filter) */}
        <nav className="border-t border-stone-200/70 bg-stone-50/80 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1.5 sm:gap-2 text-xs font-semibold whitespace-nowrap py-1.5 sm:py-2">
            <button
              onClick={() => {
                setCurrentView('store');
                onSelectCategory('all');
                if (onSelectFabric) onSelectFabric('all');
              }}
              className={`px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${
                activeCategory === 'all' && selectedFabric === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/70'
              }`}
            >
              All Collections
            </button>

            {categories.map((cat) => {
              const isActive = selectedFabric === cat.name;
              return (
                <button
                  key={cat._id}
                  onClick={() => {
                    setCurrentView('store');
                    if (onSelectFabric) {
                      onSelectFabric(cat.name);
                    } else {
                      onSelectCategory(cat.name);
                    }
                  }}
                  className={`px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}

            <button
              onClick={() => {
                setCurrentView('store');
                onSelectCategory('sale');
              }}
              className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 text-rose-700 cursor-pointer ${
                activeCategory === 'sale'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'hover:bg-rose-50'
              }`}
            >
              % Sale Offers
            </button>
          </div>
        </nav>
      </header>

      {/* LUXURY HAMBURGER SLIDE-OVER DRAWER (Right Side) */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-stone-950/65 backdrop-blur-sm transition-opacity"
            />

            {/* Slide-in Drawer Container */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-hidden"
              >
                {/* DRAWER TOP BAR */}
                <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
                  <div className="flex items-center gap-2">
                    <BrandLogo variant="dark" size="sm" showSubtitle={true} showEmblem={true} />
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-full text-stone-500 hover:text-stone-950 hover:bg-stone-200/70 transition-all cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* DRAWER SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
                  {/* 1. LOGIN / ACCOUNT BUTTON / PROFILE CARD */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block px-1">
                      Account & Access
                    </span>
                    {!user ? (
                      <button
                        onClick={() => {
                          onOpenLogin();
                          setDrawerOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl shadow-md transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                            <User className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-stone-100 flex items-center gap-1.5">
                              <span>Login / Sign In (لاگ ان)</span>
                              <span className="px-1.5 py-0.2 bg-amber-400 text-stone-950 text-[9px] font-extrabold rounded">
                                SECURE
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-400">
                              Reseller Portal & Admin access
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ) : (
                      <div className="p-3.5 bg-stone-100 rounded-2xl border border-stone-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-stone-900 text-sm">{user.fullName}</div>
                            <div className="text-[11px] text-stone-500">{user.phone} • {user.role}</div>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            Active
                          </span>
                        </div>

                        {user.role === 'SUPER_ADMIN' && (
                          <button
                            onClick={() => {
                              setCurrentView(currentView === 'admin' ? 'store' : 'admin');
                              setDrawerOpen(false);
                            }}
                            className="w-full py-2.5 px-3 bg-stone-900 text-amber-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-xs hover:bg-stone-800 cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span>{currentView === 'admin' ? 'Back to Store' : 'Super Admin Portal'}</span>
                          </button>
                        )}

                        {user.role === 'RESELLER' && (
                          <button
                            onClick={() => {
                              setCurrentView(currentView === 'reseller' ? 'store' : 'reseller');
                              setDrawerOpen(false);
                            }}
                            className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>{currentView === 'reseller' ? 'Back to Store' : 'Reseller Dashboard'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            logout();
                            setCurrentView('store');
                            setDrawerOpen(false);
                          }}
                          className="w-full py-2 px-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. SAVED DRESSES (WISHLIST) & 3. WORK GUIDE CARDS */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block px-1">
                      Quick Access & Earnings
                    </span>

                    {/* SAVED DRESSES (WISHLIST) */}
                    <button
                      onClick={() => {
                        setIsWishlistOpen(true);
                        setDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3.5 bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/90 rounded-2xl transition-all group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                          <Heart className="w-5 h-5 fill-white text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-2">
                            <span>Saved Dresses (پسندیدہ سوٹس)</span>
                            {totalSavedCount > 0 && (
                              <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full">
                                {totalSavedCount} Saved
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600">
                            {totalSavedCount > 0
                              ? `You have ${totalSavedCount} dress${totalSavedCount > 1 ? 'es' : ''} saved`
                              : 'Tap heart icon on any dress to save for later'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* RESELLER WORK GUIDE */}
                    <button
                      onClick={() => {
                        onOpenResellerGuide?.();
                        setDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3.5 bg-amber-50 hover:bg-amber-100/90 border border-amber-300 rounded-2xl transition-all group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-xs">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-amber-950 flex items-center gap-1.5">
                            <span>Reseller Work Guide</span>
                            <span className="px-1.5 py-0.2 bg-amber-400 text-stone-950 text-[9px] font-black rounded uppercase">
                              کیسے کمائیں؟
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Earn Rs. 300/suit + Rs. 500 bonus per 10 delivered
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* BECOME A RESELLER APPLICATION BUTTON */}
                    {!user && (
                      <button
                        onClick={() => {
                          onOpenApply();
                          setDrawerOpen(false);
                        }}
                        className="w-full py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Apply as a Reseller (Zero Investment)</span>
                      </button>
                    )}
                  </div>

                  {/* 4. COLLECTIONS & FABRICS GRID */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block px-1">
                      Browse Collections & Fabrics
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <button
                        onClick={() => {
                          onSelectCategory('all');
                          if (onSelectFabric) onSelectFabric('all');
                          setDrawerOpen(false);
                        }}
                        className="p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-left text-stone-900 border border-stone-200/60 cursor-pointer"
                      >
                        All Collections
                      </button>

                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => {
                            if (onSelectFabric) {
                              onSelectFabric(cat.name);
                            } else {
                              onSelectCategory(cat.name);
                            }
                            setDrawerOpen(false);
                          }}
                          className="p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-left text-stone-800 border border-stone-200/60 cursor-pointer"
                        >
                          {cat.name}
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          onSelectCategory('sale');
                          setDrawerOpen(false);
                        }}
                        className="p-2.5 bg-rose-50 hover:bg-rose-100 rounded-xl text-left text-rose-700 font-bold border border-rose-200 cursor-pointer"
                      >
                        % Sale Offers
                      </button>
                    </div>
                  </div>

                  {/* 5. CUSTOMER SERVICES & HOTLINE */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block px-1">
                      Customer Support & Orders
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <button
                        onClick={() => {
                          onOpenTrack();
                          setDrawerOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-stone-800 cursor-pointer"
                      >
                        <Truck className="w-4 h-4 text-stone-500" />
                        <span>Track My COD Order Status</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenExchange();
                          setDrawerOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-stone-800 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4 text-stone-500" />
                        <span>7-Day Return / Exchange Portal</span>
                      </button>

                      <a
                        href="https://wa.me/923235277238"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold rounded-xl border border-emerald-200"
                      >
                        <div className="flex items-center gap-2.5">
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>WhatsApp Order Support</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                          +92 323 5277238
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* DRAWER FOOTER */}
                <div className="p-4 border-t border-stone-200 bg-stone-50/90 text-center space-y-1.5">
                  <p className="text-[11px] text-stone-600 font-medium">
                    Cash on Delivery (COD) Nationwide • 100% Genuine Fabrics
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Custom Engineered with <span className="font-mono text-stone-700 font-bold">MERN Stack</span> by <strong>AHSAN KHAN</strong>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
