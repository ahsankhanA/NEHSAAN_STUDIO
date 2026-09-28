import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    deliveryFee,
    perThousandCharge,
    total,
    totalSuitsCount,
    resellerCode,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="font-semibold text-base text-stone-900">
                Shopping Bag ({totalSuitsCount} {totalSuitsCount === 1 ? 'item' : 'items'})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Referral Notice */}
          {resellerCode && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Referred Order: Reseller <strong>{resellerCode}</strong></span>
              </div>
              <span className="text-[10px] bg-amber-200/60 px-1.5 py-0.5 rounded font-mono font-bold">
                Attributed
              </span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="p-4 bg-stone-100 rounded-full text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-medium text-stone-800">Your bag is currently empty</h3>
                <p className="text-xs text-stone-500 max-w-xs">
                  Discover our luxury unstitched lawn, stitched pret, and gents formal collections.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="py-3 flex gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded bg-stone-100 border border-stone-200 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">{item.name}</h4>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-stone-400 hover:text-red-500 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {item.size && item.size.toLowerCase() !== 'unstitched' ? (
                          <>
                            Size: <span className="font-semibold text-stone-800">{item.size}</span>
                          </>
                        ) : (
                          <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Unstitched Fabric
                          </span>
                        )}
                        {item.color && (
                          <span> • Color: <span className="font-medium text-stone-800">{item.color}</span></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-stone-300 rounded text-xs">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-semibold text-stone-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-stone-900">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Checkout Button */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 bg-stone-50 p-4 space-y-3">
              {/* Financial Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Merchandise Subtotal:</span>
                  <span className="font-semibold text-stone-900">Rs. {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span>Delivery Fee:</span>
                    <span
                      title="1 suit = Rs.300, 2 suits = Rs.400, 3 suits = Rs.450, 4+ = +Rs.50/suit"
                      className="cursor-help text-stone-400 hover:text-stone-600"
                    >
                      <Info className="w-3 h-3" />
                    </span>
                  </div>
                  <span className="font-semibold text-stone-900">Rs. {deliveryFee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span>Service Handling:</span>
                    <span
                      title="Rs.50 per started Rs.1,000 subtotal"
                      className="cursor-help text-stone-400 hover:text-stone-600"
                    >
                      <Info className="w-3 h-3" />
                    </span>
                  </div>
                  <span className="font-semibold text-stone-900">Rs. {perThousandCharge.toLocaleString()}</span>
                </div>

                <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold text-stone-900">
                  <span>Total (Cash on Delivery):</span>
                  <span className="text-base text-amber-900">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-center text-stone-500">
                  Nationwide Cash on Delivery with Express Courier
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
