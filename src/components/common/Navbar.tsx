import React, { useState } from 'react';
import { ShoppingBag, Search, Truck, RefreshCw, UserCheck, Shield, LogOut, Menu, X, Tag, MessageCircle, Layers, Heart, BookOpen } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Utility Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 sm:py-2 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="truncate">
              Nationwide Express COD | WhatsApp Order:{' '}
              <a
                href="https://wa.me/923235277238"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 font-bold hover:underline"
              >
                +92 323 5277238
              </a>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-stone-300">
            {resellerCode && (
              <div className="flex items-center gap-1.5 bg-stone-800 px-2 py-0.5 rounded text-[11px] text-amber-300">
                <Tag className="w-3 h-3" />
                <span>
                  Referred: <strong>{resellerCode}</strong>
                </span>
                <button
                  onClick={() => setResellerCode(null)}
                  className="ml-1 text-stone-400 hover:text-stone-100"
                  title="Remove referral code"
                >
                  ×
                </button>
              </div>
            )}

            <button
              onClick={onOpenTrack}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </button>

            <button
              onClick={onOpenExchange}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Returns</span>
            </button>

            <button
              onClick={onOpenResellerGuide}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 text-[11px] transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Reseller Guide (کیسے کمائیں؟)</span>
            </button>

            {!user ? (
              <div className="flex items-center gap-3 border-l border-stone-700 pl-3">
                <button
                  onClick={onOpenApply}
                  className="text-amber-300 hover:text-amber-200 font-medium"
                >
                  Become a Reseller
                </button>
                <button
                  onClick={onOpenLogin}
                  className="hover:text-white transition-colors"
                >
                  Login
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-stone-700 pl-3">
                {user.role === 'SUPER_ADMIN' ? (
                  <button
                    onClick={() => setCurrentView(currentView === 'admin' ? 'store' : 'admin')}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{currentView === 'admin' ? 'Store' : 'Admin'}</span>
                  </button>
                ) : user.role === 'RESELLER' ? (
                  <button
                    onClick={() => setCurrentView(currentView === 'reseller' ? 'store' : 'reseller')}
                    className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{currentView === 'reseller' ? 'Store' : 'Dashboard'}</span>
                  </button>
                ) : null}

                <span className="text-stone-400">|</span>
                <span className="text-stone-300 truncate max-w-[100px]">{user.fullName.split(' ')[0]}</span>
                <button
                  onClick={() => {
                    logout();
                    setCurrentView('store');
                  }}
                  className="text-stone-400 hover:text-red-400"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              setCurrentView('store');
              onSelectCategory('all');
              if (onSelectFabric) onSelectFabric('all');
            }}
            className="text-left group flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-90"
            title="MaNHSaaN clothing"
          >
            <BrandLogo variant="dark" size="md" showSubtitle={true} showEmblem={true} />
            <span className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 rounded border border-amber-300">
              Exclusive
            </span>
          </button>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            placeholder="Search by fabric, lawn, embroidered, stitched..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-stone-500 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2 text-xs text-stone-400 hover:text-stone-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Actions & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile search toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-100"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            id="wishlist-trigger-btn"
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-600 rounded-full transition-colors shrink-0"
            title="Saved Items / Wishlist"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${totalSavedCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span className="text-xs font-semibold hidden md:inline ml-1.5">Saved</span>
            {totalSavedCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:static sm:ml-1.5 bg-rose-500 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs">
                {totalSavedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            id="cart-trigger-btn"
            className="relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 bg-stone-900 text-stone-50 rounded-full hover:bg-stone-800 transition-colors shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Bag</span>
            <span className="bg-amber-400 text-stone-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalSuitsCount}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-stone-950 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Field */}
      {showMobileSearch && (
        <div className="md:hidden px-3 pb-3 pt-1 border-t border-stone-100 bg-stone-50 animate-fadeIn">
          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="Search fabrics, unstitched, pret..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:border-stone-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2 text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Horizontally-Scrolling Categories Strip (Mobile & Desktop) */}
      <nav className="border-t border-stone-200/80 bg-stone-50/90 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center gap-1 sm:gap-2 text-xs font-semibold whitespace-nowrap py-1.5 sm:py-2">
          <button
            onClick={() => {
              setCurrentView('store');
              onSelectCategory('all');
              if (onSelectFabric) onSelectFabric('all');
            }}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeCategory === 'all' && selectedFabric === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/60'
            }`}
          >
            All Collections
          </button>

          {/* Dynamic Categories From Backend */}
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
                className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
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
            className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 text-rose-700 ${
              activeCategory === 'sale'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'hover:bg-rose-50'
            }`}
          >
            % Sale Offers
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-4 shadow-xl animate-fadeIn">
          {/* Brand Header inside Mobile Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <BrandLogo variant="dark" size="sm" showSubtitle={true} showEmblem={true} />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
              MaNHSaaN clothing
            </span>
          </div>

          {/* Categories List in Mobile Drawer */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Browse Categories & Fabrics
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => {
                  onSelectCategory('all');
                  if (onSelectFabric) onSelectFabric('all');
                  setMobileMenuOpen(false);
                }}
                className="text-left p-2.5 bg-stone-50 rounded-lg hover:bg-stone-100 text-stone-800"
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
                    setMobileMenuOpen(false);
                  }}
                  className="text-left p-2.5 bg-stone-50 rounded-lg hover:bg-stone-100 text-stone-800"
                >
                  {cat.name}
                </button>
              ))}

              <button
                onClick={() => {
                  onSelectCategory('sale');
                  setMobileMenuOpen(false);
                }}
                className="text-left p-2.5 bg-rose-50 rounded-lg text-rose-700 font-bold hover:bg-rose-100"
              >
                % Special Sale
              </button>
            </div>
          </div>

          {/* Quick Services */}
          <div className="pt-3 border-t border-stone-100 space-y-2 text-xs font-medium">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Customer Services
            </span>
            <button
              onClick={() => {
                setIsWishlistOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 text-stone-700"
            >
              <div className="flex items-center gap-2.5">
                <Heart className={`w-4 h-4 ${totalSavedCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-500'}`} />
                <span>My Saved Wishlist</span>
              </div>
              {totalSavedCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
                  {totalSavedCount} Saved
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenTrack();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-stone-50 text-stone-700"
            >
              <Truck className="w-4 h-4 text-stone-500" />
              <span>Track My COD Order</span>
            </button>

            <button
              onClick={() => {
                onOpenExchange();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-stone-50 text-stone-700"
            >
              <RefreshCw className="w-4 h-4 text-stone-500" />
              <span>7-Day Return / Exchange Portal</span>
            </button>

            <a
              href="https://wa.me/923235277238"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Direct WhatsApp Support: +92 323 5277238</span>
            </a>
          </div>

          {/* Account & Reseller Portal */}
          <div className="pt-3 border-t border-stone-100 space-y-2 text-xs font-semibold">
            <button
              onClick={() => {
                onOpenResellerGuide?.();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-amber-500/15 text-amber-900 border border-amber-400/60 font-bold"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>How to Work as Reseller (کیسے کمائیں؟)</span>
              </div>
              <span className="text-[10px] bg-amber-500 text-stone-950 px-2 py-0.5 rounded font-extrabold">GUIDE</span>
            </button>

            {!user ? (
              <>
                <button
                  onClick={() => {
                    onOpenApply();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-center"
                >
                  Become a Reseller (Earn Commissions)
                </button>
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3 bg-stone-900 text-white rounded-lg text-center"
                >
                  Admin / Reseller Login
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 bg-stone-100 rounded-lg text-stone-800">
                  <div className="font-bold">{user.fullName}</div>
                  <div className="text-[11px] text-stone-500">{user.role} • {user.phone}</div>
                </div>

                {user.role === 'SUPER_ADMIN' && (
                  <button
                    onClick={() => {
                      setCurrentView(currentView === 'admin' ? 'store' : 'admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-stone-900 text-amber-300 rounded-lg flex items-center justify-center gap-2 font-bold"
                  >
                    <Shield className="w-4 h-4" />
                    <span>{currentView === 'admin' ? 'Back to Store' : 'Super Admin Portal'}</span>
                  </button>
                )}

                {user.role === 'RESELLER' && (
                  <button
                    onClick={() => {
                      setCurrentView(currentView === 'reseller' ? 'store' : 'reseller');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-amber-600 text-white rounded-lg flex items-center justify-center gap-2 font-bold"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{currentView === 'reseller' ? 'Back to Store' : 'Reseller Dashboard'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setCurrentView('store');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-red-600 bg-red-50 rounded-lg font-medium hover:bg-red-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
