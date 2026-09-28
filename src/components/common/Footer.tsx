import React from 'react';
import { Truck, ShieldCheck, RefreshCw, MessageSquare, Phone, MapPin, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onOpenTrack: () => void;
  onOpenExchange: () => void;
  onOpenApply: () => void;
  onOpenLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTrack,
  onOpenExchange,
  onOpenApply,
  onOpenLogin,
}) => {
  const { brandName } = useAuth();

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Value Proposition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-stone-800 text-stone-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-stone-100">Express Courier Delivery</h4>
              <p className="text-xs text-stone-400 mt-1">
                Fast nationwide Cash on Delivery with real-time web tracking across Pakistan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-amber-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-stone-100">7-Day Exchange Window</h4>
              <p className="text-xs text-stone-400 mt-1">
                Size issue or product mismatch? Request an exchange within 7 days of package delivery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-stone-100">Authentic Premium Fabrics</h4>
              <p className="text-xs text-stone-400 mt-1">
                100% genuine Swiss voile lawn, fine organza, luxury jacquard, and Chinese Boski blends.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-900 rounded-lg text-amber-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-stone-100">WhatsApp Support Desk</h4>
              <p className="text-xs text-stone-400 mt-1">
                Order confirmation and instant help available on official WhatsApp: <strong>+92 323 5277238</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              <BrandLogo variant="light" size="md" showSubtitle={true} showEmblem={true} />
            </div>
            <p className="text-xs text-stone-400 leading-relaxed pt-2">
              Curators of luxury Pakistani pret and unstitched formal fabrics. Dedicated to timeless craftsmanship, immaculate embroidery, and effortless reseller growth.
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Sohan Islamabad</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <a href="https://wa.me/923235277238" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300">
                  +92 323 5277238
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>nehsaan@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-100 mb-4">
              Customer Services
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button onClick={onOpenTrack} className="hover:text-amber-300 transition-colors">
                  Track Your Order Online
                </button>
              </li>
              <li>
                <button onClick={onOpenExchange} className="hover:text-amber-300 transition-colors">
                  Submit Return / Exchange Request
                </button>
              </li>
              <li>
                <span className="text-stone-300">Delivery Fee Guide:</span>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  1 suit = Rs.300 | 2 suits = Rs.400 | 3 suits = Rs.450 (+Rs.50/suit beyond 3)
                </p>
              </li>
              <li>
                <span className="text-stone-300">Payment:</span> Cash on Delivery (COD)
              </li>
            </ul>
          </div>

          {/* Reseller Program */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-100 mb-4">
              Reseller Partnership
            </h4>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Earn <strong>Rs. 300 per delivered order</strong> plus a <strong>Rs. 500 cash bonus</strong> for every 10 delivered orders. Zero inventory risk.
            </p>
            <div className="space-y-2">
              <button
                onClick={onOpenApply}
                className="w-full text-center px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded transition-colors"
              >
                Apply as a Reseller
              </button>
              <button
                onClick={onOpenLogin}
                className="w-full text-center px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs rounded transition-colors"
              >
                Reseller Portal Login
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} {brandName || 'NEHSAAN'}. All Rights Reserved.</p>
          <p className="flex items-center gap-2">
            <span>Logistics:</span>
            <span className="font-semibold text-stone-200 bg-stone-900 px-2 py-0.5 rounded">Express Courier COD</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
