import React from 'react';
import { CheckCircle2, Truck, MessageSquare, Printer, ArrowRight, ExternalLink } from 'lucide-react';
import type { IOrder } from '../../types';

interface OrderSuccessModalProps {
  order: (IOrder & { whatsappPrefilledLink?: string }) | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string, phone: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose, onTrackOrder }) => {
  if (!order) return null;

  const trackingNumber = order.shipment?.trackingNumber || 'Pending Assignment';
  const whatsappUrl =
    order.whatsappPrefilledLink ||
    `https://wa.me/923235277238?text=${encodeURIComponent(
      `*NEW ORDER - NEHSAAN*\nOrder #: ${order.orderNumber}\nCustomer: ${order.customer.fullName}\nPhone: ${order.customer.phone}\nCity: ${order.customer.city}\nAddress: ${order.customer.address}\nSuits: ${order.items.map((i: any) => `${i.name} (${i.size || 'Standard'}) x${i.quantity}`).join(', ')}\nTotal Payable (COD): Rs. ${order.total.toLocaleString()}\nPlease confirm dispatch!`
    )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden my-8 p-6 sm:p-8 space-y-6">
        {/* Top Celebration */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="font-brand font-bold text-amber-900 tracking-widest text-sm block">NEHSAAN</span>
          <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Order Confirmed!
          </h2>
          <p className="text-xs text-stone-500">
            Thank you for shopping with NEHSAAN. Your order is booked for Cash on Delivery.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <span className="text-stone-500">Order Number:</span>
            <span className="font-mono font-bold text-stone-900 text-sm">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <span className="text-stone-500">Recipient Name:</span>
            <span className="font-semibold text-stone-900">{order.customer.fullName}</span>
          </div>

          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <span className="text-stone-500">Mobile Phone:</span>
            <span className="font-mono text-stone-800">{order.customer.phone}</span>
          </div>

          <div className="flex justify-between items-start border-b border-stone-200 pb-2">
            <span className="text-stone-500">Delivery Address:</span>
            <span className="font-medium text-stone-800 text-right max-w-xs">
              {order.customer.address}, {order.customer.city}, {order.customer.province}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 text-sm font-bold text-stone-900">
            <span>Payable Amount at Doorstep (COD):</span>
            <span className="text-base text-amber-900">Rs. {order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* WhatsApp Direct Notification to Owner */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Order Details to WhatsApp (+92 323 5277238)</span>
          </a>

          <div className="flex gap-2.5">
            <button
              onClick={() => {
                onClose();
                onTrackOrder(order.orderNumber, order.customer.phone);
              }}
              className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Status</span>
            </button>

            <button
              onClick={() => window.print()}
              className="py-2.5 px-3 border border-stone-300 hover:border-stone-500 text-stone-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-center text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
