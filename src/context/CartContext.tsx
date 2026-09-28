import React, { createContext, useContext, useState, useEffect } from 'react';
import type { IProduct } from '../types';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  cartToken: string | null;
  addItem: (product: IProduct, size?: string, quantity?: number) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  totalSuitsCount: number;
  subtotal: number;
  deliveryFee: number;
  perThousandCharge: number;
  total: number;
  resellerCode: string | null;
  setResellerCode: (code: string | null) => void;
  recoveredNotice: string | null;
  setRecoveredNotice: (msg: string | null) => void;
  syncCustomerInfo: (info: { customerName?: string; customerPhone?: string; customerEmail?: string }) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nivora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartToken, setCartToken] = useState<string | null>(() => {
    return localStorage.getItem('nehsaan_cart_token') || null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [recoveredNotice, setRecoveredNotice] = useState<string | null>(null);
  const [resellerCode, setResellerCodeState] = useState<string | null>(() => {
    return localStorage.getItem('nivora_reseller_ref') || null;
  });

  // 1. Capture URL referral param (?ref=CODE or ?reseller=CODE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('reseller');
    if (ref) {
      const cleanRef = ref.trim().toUpperCase();
      setResellerCodeState(cleanRef);
      localStorage.setItem('nivora_reseller_ref', cleanRef);
      console.log(`[Attribution] Reseller code detected: ${cleanRef}`);
    }

    // 2. 60-Minute Abandoned Cart Recovery Link Handler (?recoverCart=TOKEN)
    const recoveryToken = params.get('recoverCart');
    if (recoveryToken) {
      console.log(`[CartRecovery] Recovering cart with token: ${recoveryToken}`);
      fetch(`/api/cart/recover/${encodeURIComponent(recoveryToken)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.valid && Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items);
            setCartToken(data.token);
            localStorage.setItem('nehsaan_cart_token', data.token);
            setRecoveredNotice('Aap ke bag mein product recover kar diya gaya hai! Khareedari mukammal karein.');
            setIsCartOpen(true);
          } else {
            console.warn('[CartRecovery] Invalid or expired recovery token:', data.error);
          }
        })
        .catch((err) => console.error('[CartRecovery] Error fetching cart:', err));
    }
  }, []);

  const setResellerCode = (code: string | null) => {
    setResellerCodeState(code);
    if (code) {
      localStorage.setItem('nivora_reseller_ref', code);
    } else {
      localStorage.removeItem('nivora_reseller_ref');
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nivora_cart', JSON.stringify(items));
  }, [items]);

  // Server-side Cart Sync for 60-Minute Abandonment Recovery Tracking
  const syncWithServer = async (cartItems: CartItem[], customerInfo?: { customerName?: string; customerPhone?: string; customerEmail?: string }) => {
    try {
      const res = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: cartToken || undefined,
          items: cartItems,
          customerName: customerInfo?.customerName,
          customerPhone: customerInfo?.customerPhone,
          customerEmail: customerInfo?.customerEmail,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setCartToken(data.token);
          localStorage.setItem('nehsaan_cart_token', data.token);
        }
      }
    } catch (e) {
      // Background sync, silently fail if offline
    }
  };

  useEffect(() => {
    if (items.length > 0) {
      syncWithServer(items);
    }
  }, [items]);

  const syncCustomerInfo = (info: { customerName?: string; customerPhone?: string; customerEmail?: string }) => {
    syncWithServer(items, info);
  };

  const addItem = (product: IProduct, size?: string, quantity = 1) => {
    const selectedSize = size || product.sizes[0] || 'Standard';
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id && i.size === selectedSize);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id && i.size === selectedSize
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          image: product.images[0] || '',
          size: selectedSize,
          color: product.color,
          quantity,
          price: product.retailPrice,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, size?: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && (!size || i.size === size))));
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId && i.size === size ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('nivora_cart');
    localStorage.removeItem('nehsaan_cart_token');
    setCartToken(null);
  };

  const totalSuitsCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Business shipping rules:
  // 1 suit = 300, 2 suits = 400, 3 suits = 450, 4+ = 450 + (qty - 3) * 50
  const deliveryFee = totalSuitsCount === 0
    ? 0
    : totalSuitsCount === 1
    ? 300
    : totalSuitsCount === 2
    ? 400
    : 450 + (totalSuitsCount - 3) * 50;

  // Extra service charge: Rs. 50 per started Rs. 1,000 subtotal
  const perThousandCharge = subtotal > 0 ? Math.ceil(subtotal / 1000) * 50 : 0;

  const total = subtotal + deliveryFee + perThousandCharge;

  return (
    <CartContext.Provider
      value={{
        items,
        cartToken,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        totalSuitsCount,
        subtotal,
        deliveryFee,
        perThousandCharge,
        total,
        resellerCode,
        setResellerCode,
        recoveredNotice,
        setRecoveredNotice,
        syncCustomerInfo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
