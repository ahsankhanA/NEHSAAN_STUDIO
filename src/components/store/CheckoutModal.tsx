import React, { useState, useEffect, useRef } from 'react';
import { X, Truck, ShieldCheck, Tag, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

interface CheckoutModalProps {
  onSuccess: (order: any) => void;
}

const PAKISTAN_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Gujranwala', 'Sialkot', 'Quetta', 'Hyderabad', 'Bahawalpur',
  'Sargodha', 'Abbottabad', 'Gujrat', 'Sukkur', 'Larkana', 'Mardan'
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onSuccess }) => {
  const {
    items,
    isCheckoutOpen,
    setIsCheckoutOpen,
    subtotal,
    deliveryFee,
    perThousandCharge,
    total,
    totalSuitsCount,
    resellerCode,
    setResellerCode,
    clearCart,
    cartToken,
  } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [notes, setNotes] = useState('');

  const [inputResellerCode, setInputResellerCode] = useState(resellerCode || '');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and guarantee scroll resets to top when opened
  useEffect(() => {
    if (isCheckoutOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Always reset scroll container to top so Name and Header are 100% visible on mobile
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
      };
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponMessage(null);
    try {
      const res = await api.validateCoupon(couponCode.trim(), subtotal);
      if (res.valid) {
        setDiscount(res.discount);
        setCouponMessage(res.message);
      } else {
        setDiscount(0);
        setCouponMessage('Invalid coupon code.');
      }
    } catch (err: any) {
      setDiscount(0);
      setCouponMessage(err.message || 'Invalid or expired coupon code.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const finalTotal = Math.max(0, total - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setErrorMessage('Please fill in your full name, mobile phone number, delivery address, and city.');
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g. 0300 1234567).');
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          province: province.trim(),
        },
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          price: i.price,
        })),
        resellerCode: (inputResellerCode || resellerCode || undefined)?.trim().toUpperCase(),
        referralSource: resellerCode ? 'Referral Link' : inputResellerCode ? 'Manual Reseller Code' : 'Direct Checkout',
        couponCode: discount > 0 ? couponCode : undefined,
        cartToken: cartToken || undefined,
        notes: notes.trim() || undefined,
      };

      const res = await api.createOrder(payload);
      clearCart();
      setIsCheckoutOpen(false);
      onSuccess(res.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start sm:justify-center bg-stone-950/85 backdrop-blur-sm p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-white flex flex-col h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:rounded-2xl shadow-2xl overflow-hidden box-border">
        {/* Fixed Header - Always visible at top */}
        <div className="flex-none px-4 py-3 sm:px-6 sm:py-4 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800 shadow-md z-20">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 id="checkout-modal-title" className="font-serif text-sm sm:text-lg font-bold tracking-tight text-white leading-tight truncate">
                Express Checkout (COD)
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-200/90 truncate">
                Cash on Delivery Nationwide • Fast Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="min-w-[40px] min-h-[40px] p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close checkout modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain w-full max-w-full"
        >
          {errorMessage && (
            <div className="m-3 sm:m-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 w-full max-w-full box-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-full">
              {/* Column 1: Customer & Delivery Details */}
              <div className="space-y-4 w-full min-w-0">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Shipping & Contact Info</span>
                  </h3>
                  <span className="text-[10px] text-red-600 font-semibold">* Required</span>
                </div>

                {/* Recipient Name - prominent & clean, guaranteed visible */}
                <div className="w-full">
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Full Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima Zahra / Muhammad Ali"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full max-w-full box-border px-3.5 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                {/* Phone & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <div className="w-full">
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Mobile Phone (for Courier) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (!whatsapp) setWhatsapp(e.target.value);
                      }}
                      className="w-full max-w-full box-border px-3.5 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div className="w-full">
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      WhatsApp (Order Updates)
                    </label>
                    <input
                      type="tel"
                      placeholder="0300 1234567"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full max-w-full box-border px-3.5 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="w-full">
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full max-w-full box-border px-3.5 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                {/* Street Address & Landmark */}
                <div className="w-full">
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Complete Delivery Address & Landmark <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House/Apartment #, Street/Lane, Block/Sector, Nearest Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full max-w-full box-border px-3.5 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                {/* City & Province - Responsive 1 col on mobile, 2 col on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <div className="w-full">
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full max-w-full box-border px-3 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 transition-all"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full">
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Province
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full max-w-full box-border px-3 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 transition-all"
                    >
                      <option value="Punjab">Punjab</option>
                      <option value="Sindh">Sindh</option>
                      <option value="Khyber Pakhtunkhwa">KPK</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Federal Capital">Islamabad</option>
                      <option value="Azad Kashmir">AJK</option>
                    </select>
                  </div>
                </div>

                {/* Special Delivery Instructions */}
                <div className="w-full">
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery, deliver after 2 PM"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full max-w-full box-border px-3.5 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 transition-all"
                  />
                </div>
              </div>

              {/* Column 2: Items Summary, Coupons & Pricing */}
              <div className="space-y-4 w-full min-w-0">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Order Review & Payment</span>
                  </h3>
                  <span className="text-[10px] text-stone-500 font-semibold">{totalSuitsCount} items</span>
                </div>

                {/* Items Summary list */}
                <div className="max-h-40 overflow-y-auto space-y-2 border border-stone-200 rounded-xl p-2.5 bg-stone-50">
                  {items.map((i) => (
                    <div key={`${i.productId}-${i.size}`} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 line-clamp-1 pr-2">
                        <span className="font-bold text-stone-900 px-1.5 py-0.5 bg-stone-200 rounded text-[11px] shrink-0">{i.quantity}x</span>
                        <span className="text-stone-800 truncate font-medium">{i.name}</span>
                        <span className="text-stone-500 text-[11px] shrink-0">({i.size})</span>
                      </div>
                      <span className="font-bold text-stone-900 shrink-0">
                        Rs. {(i.price * i.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reseller Attribution box */}
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reseller Referral Code</span>
                    </span>
                    {resellerCode && (
                      <span className="bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded text-[10px]">
                        Active ({resellerCode})
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Reseller Code (e.g. ALI482)"
                    value={inputResellerCode || ''}
                    onChange={(e) => {
                      setInputResellerCode(e.target.value);
                      setResellerCode(e.target.value.trim().toUpperCase() || null);
                    }}
                    className="w-full px-3 py-2 text-xs uppercase font-mono bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 box-border"
                  />
                </div>

                {/* Coupon Box */}
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code (e.g. WELCOME10)"
                      value={couponCode || ''}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 text-xs uppercase bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-stone-800 box-border"
                    />
                    <button
                      type="button"
                      disabled={validatingCoupon}
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-stone-900 text-amber-300 text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors shrink-0"
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-xs ${discount > 0 ? 'text-emerald-700 font-semibold' : 'text-stone-600'}`}>
                      {couponMessage}
                    </p>
                  )}
                </div>

                {/* Final Calculation Table */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2 text-stone-700">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalSuitsCount} suits):</span>
                    <span className="font-semibold text-stone-900">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Courier Delivery (Nationwide):</span>
                    <span className="font-semibold text-stone-900">Rs. {deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling / Insurance Fee:</span>
                    <span className="font-semibold text-stone-900">Rs. {perThousandCharge.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Promo Discount:</span>
                      <span>-Rs. {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-stone-200 pt-2 flex justify-between items-center text-sm font-bold text-stone-900">
                    <span>Payable at Delivery (COD):</span>
                    <span className="text-lg text-amber-900 font-serif">Rs. {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Cash on delivery guarantee */}
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>100% Cash on Delivery:</strong> Pay only when courier delivers your parcel.</span>
                </div>

                {/* Desktop Submit Button */}
                <div className="hidden sm:block pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full min-h-[48px] py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{submitting ? 'Placing Order...' : `Confirm Order • Rs. ${finalTotal.toLocaleString()} COD`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Clean Docked Mobile Bottom Checkout Bar (Inside flex column, NEVER overlaps or detaches) */}
        <div className="sm:hidden flex-none bg-white border-t border-stone-200 p-3 shadow-2xl flex items-center justify-between gap-3 z-30">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Total (COD)</span>
            <span className="text-base font-bold text-amber-950 font-serif truncate">Rs. {finalTotal.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 min-h-[46px] py-3 px-4 bg-amber-500 active:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            <span>{submitting ? 'Placing...' : 'Confirm Order (COD)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
