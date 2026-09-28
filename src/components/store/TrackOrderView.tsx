import React, { useState } from 'react';
import { Search, Truck, CheckCircle2, Clock, Package, ExternalLink, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface TrackOrderViewProps {
  initialOrderNumber?: string;
  initialPhone?: string;
  onBack: () => void;
}

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Verified & Confirmed' },
  { key: 'PACKED', label: 'Packed & Dispatched' },
  { key: 'SHIPPED', label: 'In Transit (Express Courier)' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered (COD Received)' },
];

export const TrackOrderView: React.FC<TrackOrderViewProps> = ({ initialOrderNumber = '', initialPhone = '', onBack }) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setOrder(null);

    if (!orderNumber.trim() || !phone.trim()) {
      setErrorMessage('Please provide both your Order Number and Customer Phone Number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.trackOrder(orderNumber.trim(), phone.trim());
      setOrder(res.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Order not found. Please verify your order number and phone number.');
    } finally {
      setLoading(false);
    }
  };

  // Find index in timeline
  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const orderIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatus);
    const stepIndex = ORDER_STEPS.findIndex((s) => s.key === stepKey);

    if (currentStatus === 'CANCELLED' || currentStatus === 'RETURNED') {
      return 'neutral';
    }

    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Track Your Shipment</h2>
          <p className="text-xs text-stone-500">Live courier updates and delivery timeline</p>
        </div>
      </div>

      {/* Lookup Form */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Order Number
            </label>
            <input
              type="text"
              required
              placeholder="ORD-20260921-0001"
              value={orderNumber || ''}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded font-mono uppercase focus:outline-none focus:border-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mobile Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="0300 1234567"
              value={phone || ''}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded focus:outline-none focus:border-stone-800"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 shadow transition-colors disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Track Order'}</span>
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Results Box */}
      {order && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden space-y-6 p-6">
          {/* Top Status & Carrier Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <span className="text-xs text-stone-400 font-mono">Order Number</span>
              <h3 className="font-mono text-xl font-bold text-stone-900">{order.orderNumber}</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Recipient: <strong className="text-stone-800">{order.customer.fullName}</strong> ({order.customer.city})
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-stone-400">Courier Tracking</span>
                <p className="font-mono font-bold text-amber-900 text-sm">
                  {order.shipment?.trackingNumber || 'Awaiting Pickup'}
                </p>
              </div>

              {order.shipment?.trackingUrl && (
                <a
                  href={order.shipment.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
                >
                  <span>Tracking Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Visual Order Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-4">
              Shipment Progress
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ORDER_STEPS.map((step, idx) => {
                const statusState = getStepStatus(step.key, order.orderStatus);
                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      statusState === 'completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : statusState === 'current'
                        ? 'bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-400/20'
                        : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold">
                      {statusState === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : statusState === 'current' ? (
                        <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                      ) : (
                        <span className="text-stone-400">{idx + 1}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold block leading-tight">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items & Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-200">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                Ordered Items
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-stone-50 rounded border border-stone-100">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80'}
                      alt=""
                      className="w-10 h-12 object-cover rounded bg-white"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-stone-900 line-clamp-1">{item.name}</p>
                      <p className="text-stone-500 text-[11px]">
                        Qty: {item.quantity} • Size: {item.size} • Color: {item.color}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                Financial Breakdown
              </h4>
              <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-stone-900">Rs. {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier Delivery Fee:</span>
                  <span className="font-semibold text-stone-900">Rs. {order.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Handling:</span>
                  <span className="font-semibold text-stone-900">Rs. {order.perThousandCharge.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-Rs. {order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-stone-300 pt-1.5 flex justify-between text-sm font-bold text-stone-900">
                  <span>Cash on Delivery Amount:</span>
                  <span className="text-amber-900">Rs. {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
