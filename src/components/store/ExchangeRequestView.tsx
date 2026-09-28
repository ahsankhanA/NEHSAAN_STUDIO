import React, { useState } from 'react';
import { RefreshCw, ArrowLeft, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { api } from '../../services/api';

interface ExchangeRequestViewProps {
  onBack: () => void;
}

export const ExchangeRequestView: React.FC<ExchangeRequestViewProps> = ({ onBack }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [desiredProductOrSize, setDesiredProductOrSize] = useState('');
  const [reason, setReason] = useState('size_exchange');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!orderNumber.trim() || !phone.trim() || !desiredProductOrSize.trim()) {
      setErrorMessage('Please provide your Order Number, Phone Number, and Desired Size / Replacement.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitExchangeRequest({
        orderNumber: orderNumber.trim(),
        customerPhone: phone.trim(),
        desiredProductOrSize: desiredProductOrSize.trim(),
        reason: `${reason}: ${notes.trim()}`,
        photos: photoUrl.trim() ? [photoUrl.trim()] : [],
      });
      setSubmitted(res.exchange);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not submit exchange request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Exchange & Return Request</h2>
          <p className="text-xs text-stone-500">7-Day Hassle-Free Exchange Policy</p>
        </div>
      </div>

      {/* Policy Notice Box */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold">
          <Info className="w-4 h-4 text-amber-700" />
          <span>NEHSAAN Exchange Guidelines</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px] leading-relaxed">
          <li>Exchange requests must be submitted within <strong>7 days</strong> of delivery.</li>
          <li>Items must be unworn, undamaged, with original tags intact.</li>
          <li>A standard return courier fee of <strong>Rs. 300</strong> applies for customer size exchanges.</li>
          <li>Damaged or defective pieces are replaced free of charge upon verification.</li>
        </ul>
      </div>

      {submitted ? (
        <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Exchange Request Registered!
          </h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Your reference number is <strong className="font-mono text-stone-900">{submitted.exchangeNumber}</strong> for Order #{submitted.orderNumber}.
            Our quality desk will inspect your request and dispatch a replacement via Express Courier within 2 business days.
          </p>
          <div className="pt-4">
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg shadow"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Original Order Number <span className="text-red-500">*</span>
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
                Customer Mobile Phone <span className="text-red-500">*</span>
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Reason for Exchange <span className="text-red-500">*</span>
            </label>
            <select
              value={reason || 'size_exchange'}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded focus:outline-none focus:border-stone-800"
            >
              <option value="size_exchange">Size Exchange (Need different size)</option>
              <option value="damaged_item">Defect or Damaged Fabric upon opening</option>
              <option value="wrong_product">Received Different Product/Design</option>
              <option value="color_mismatch">Color differed from online photos</option>
              <option value="change_of_mind">Exchange for another suit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Desired Replacement Product & Size <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Size Large in same design OR Noor-e-Zainab in Medium"
              value={desiredProductOrSize || ''}
              onChange={(e) => setDesiredProductOrSize(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded focus:outline-none focus:border-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Photo URL / Evidence (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or Google Drive link"
              value={photoUrl || ''}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded focus:outline-none focus:border-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Additional Details / Comments
            </label>
            <textarea
              rows={2}
              placeholder="Explain any details regarding the fit or condition..."
              value={notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded focus:outline-none focus:border-stone-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting Request...' : 'Submit Exchange Request (Rs. 300 fee applied on delivery)'}
          </button>
        </form>
      )}
    </div>
  );
};
