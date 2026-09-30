import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: string) => void;
  onSwitchToApply: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess, onSwitchToApply }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ email: email.trim(), password });
      const userRole = res?.user?.role || 'SUPER_ADMIN';
      onSuccess(userRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex justify-center items-start sm:items-center p-2.5 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 sm:p-8 space-y-5 my-auto"
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-['Cinzel',serif] font-bold text-amber-900 tracking-widest text-lg">NEHSAAN</span>
            </div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-stone-500">Sign in with your email and password</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 rounded transition-colors" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-base sm:text-xs focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-colors"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5 sm:top-3" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-base sm:text-xs focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-colors"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5 sm:top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100">
          <p className="text-xs text-stone-600">
            Want to start earning commissions?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToApply();
              }}
              className="text-amber-800 font-bold hover:underline"
            >
              Become a Reseller
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide?: () => void;
}

export const ResellerApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, onOpenGuide }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Easypaisa');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanCity = city.trim() || 'Pakistan';
    const cleanAddress = address.trim() || cleanCity;
    const cleanWhatsapp = whatsapp.trim() || cleanPhone;
    const cleanAccountNumber = accountNumber.trim() || cleanPhone;
    const cleanAccountTitle = accountTitle.trim() || cleanFullName;

    if (!cleanFullName || !cleanEmail || !cleanPhone || !password) {
      setError('Please provide your Full Name, Email Address, Phone Number, and a Password.');
      setLoading(false);
      return;
    }

    try {
      await api.applyReseller({
        fullName: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        city: cleanCity,
        address: cleanAddress,
        password,
        paymentDetails: {
          paymentMethod: paymentMethod || 'Easypaisa',
          accountNumber: cleanAccountNumber,
          accountTitle: cleanAccountTitle,
        },
        experience: experience.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Application submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex justify-center items-start sm:items-center p-2.5 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-4 sm:p-7 space-y-4 my-auto max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">Reseller Partnership Application</h2>
            <p className="text-xs text-stone-500">Earn Rs. 300 per delivered order + Rs. 500 milestone bonuses</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 rounded transition-colors" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Application Submitted!</h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              Your application has been routed to the Super Admin review queue. Upon approval, you will receive your unique referral code and full dashboard access.
            </p>
            <button
              onClick={onClose}
              className="mt-2 min-h-[44px] px-6 py-2.5 bg-stone-900 text-white font-semibold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Quick Guide Callout Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-medium">
                <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Pehli dafa apply kar rahay hain? Kaam aur kamai ka tareeqa samjhein:</span>
              </div>
              {onOpenGuide && (
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-[11px] shrink-0 shadow-sm"
                >
                  Read Guide
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Ayesha Khan"
                  value={fullName || ''}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ayesha@example.com"
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="0300 1234567"
                  value={phone || ''}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (!accountNumber) setAccountNumber(e.target.value);
                    if (!whatsapp) setWhatsapp(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-base sm:text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="0300 1234567"
                  value={whatsapp || ''}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="Lahore / Karachi / Islamabad"
                  value={city || ''}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Delivery Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House #, Street, Area"
                  value={address || ''}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            {/* Payout Details */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <span className="font-bold text-stone-800 block text-xs">Commission Payout Account:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Method</label>
                  <select
                    value={paymentMethod || 'Easypaisa'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-base sm:text-xs bg-white"
                  >
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Account / Mobile #</label>
                  <input
                    type="text"
                    required
                    value={accountNumber || ''}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-base sm:text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Account Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Account Name"
                    value={accountTitle || ''}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-base sm:text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Selling Experience / Channels (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. WhatsApp groups, Instagram boutique, Facebook marketplace"
                value={experience || ''}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 text-base sm:text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Create Password *</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-base sm:text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[46px] py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Apply for Reseller Partnership'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
