import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Award,
  DollarSign,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  LogOut,
  Users,
  CreditCard,
  FileText,
  AlertCircle,
  Edit,
  ChevronDown,
  Sparkles,
  RefreshCw,
  X,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { IOrder, OrderStatus } from '../../types';

interface ResellerPortalProps {
  onOpenGuide?: () => void;
}

export const ResellerPortal: React.FC<ResellerPortalProps> = ({ onOpenGuide }) => {
  const { user, reseller, logout } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'commissions' | 'bonuses' | 'customers' | 'payouts'>('orders');

  const [copiedLink, setCopiedLink] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState<{ order: IOrder; newStatus: OrderStatus } | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Resignation modal
  const [resignModalOpen, setResignModalOpen] = useState(false);
  const [resignationReason, setResignationReason] = useState('');
  const [resigning, setResigning] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, commRes, bonusRes, custRes, payRes] = await Promise.all([
        api.getResellerStats(),
        api.getResellerOrders(),
        api.getCommissions(),
        api.getBonuses(),
        api.getResellerCustomers(),
        api.getPayouts(),
      ]);

      setStats(statsRes);
      setOrders(ordersRes.orders || []);
      setCommissions(commRes.commissions || []);
      setBonuses(bonusRes.bonuses || []);
      setCustomers(custRes.customers || []);
      setPayouts(payRes.payouts || []);
    } catch (err: any) {
      console.error('Failed to load reseller data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const referralUrl = `${window.location.origin}/?ref=${reseller?.code || stats?.reseller?.code || ''}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStatusUpdateSubmit = async () => {
    if (!statusUpdateModal) return;
    setUpdatingStatus(true);
    try {
      await api.updateOrderStatusByReseller(statusUpdateModal.order._id, statusUpdateModal.newStatus, statusReason);
      setStatusUpdateModal(null);
      setStatusReason('');
      setFeedbackMessage(`Order ${statusUpdateModal.order.orderNumber} updated to ${statusUpdateModal.newStatus}.`);
      fetchData();
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Status update failed.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResignSubmit = async () => {
    if (!resignationReason.trim() || resignationReason.length < 5) {
      setFeedbackMessage('Please provide a valid resignation reason (min 5 characters).');
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }
    setResigning(true);
    try {
      await api.resignReseller(resignationReason);
      setFeedbackMessage('Your resignation has been confirmed. Logging out...');
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Could not process resignation.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setResigning(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-500 font-medium">Loading Reseller Command Center...</p>
        </div>
      </div>
    );
  }

  const counts = stats?.counts || { total: 0, delivered: 0, pending: 0, cancelled: 0, returned: 0 };
  const fin = stats?.financials || { totalCommissionEarned: 0, totalBonusEarned: 0, pendingPayout: 0, totalPaid: 0 };
  const bonusProgress = stats?.bonusProgress || { currentDelivered: 0, threshold: 10, percentage: 0 };

  return (
    <div className="min-h-screen bg-stone-100/60 pb-16">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white px-4 py-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-amber-500 text-stone-950 font-mono font-bold text-xs rounded uppercase">
                Code: {reseller?.code || stats?.reseller?.code}
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded">
                Active Partner
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.fullName || reseller?.fullName}
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Manage your customer orders, verify deliveries, and track real-time commission earnings.
            </p>
          </div>

          {/* Quick Referral Link Widget */}
          <div className="bg-stone-800 p-3.5 rounded-lg border border-stone-700 space-y-2 max-w-md w-full">
            <span className="text-xs font-semibold text-stone-300 block">Your Exclusive Referral Link:</span>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl || ''}
                className="flex-1 px-3 py-1.5 text-xs bg-stone-900 border border-stone-600 rounded text-stone-300 font-mono select-all focus:outline-none"
              />
              <button
                onClick={copyReferralLink}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-400">
              Share with customers on WhatsApp or Instagram. Any order placed generates <strong>Rs. 300 commission</strong>!
            </p>

            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="w-full mt-1.5 py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>How to Earn & Share Guide (کیسے زیادہ کمائیں؟ مکمل گائیڈ)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        {feedbackMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Milestone Bonus Progress Card */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 p-5 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-stone-950/10 rounded-full flex items-center justify-center text-stone-950 shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Cash Bonus Milestone Progress
              </h3>
              <p className="text-xs text-stone-900/80 mt-0.5">
                Earn <strong>Rs. 500 Cash Bonus</strong> for every 10 delivered orders!
              </p>
            </div>
          </div>

          <div className="w-full md:w-72 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span>{bonusProgress.progressInCurrentTier} of {bonusProgress.threshold} Delivered</span>
              <span>{bonusProgress.threshold - bonusProgress.progressInCurrentTier} more needed</span>
            </div>
            <div className="w-full bg-stone-950/20 h-3 rounded-full overflow-hidden">
              <div
                className="bg-stone-950 h-full transition-all duration-500"
                style={{ width: `${bonusProgress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-bold text-stone-900 mt-1 block">{counts.total}</span>
            <span className="text-[10px] text-stone-400">All referred orders</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Delivered</span>
            <span className="text-2xl font-bold text-emerald-800 mt-1 block">{counts.delivered}</span>
            <span className="text-[10px] text-emerald-600">Commissions unlocked</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">In Progress</span>
            <span className="text-2xl font-bold text-amber-800 mt-1 block">
              {(counts.pending || 0) + (counts.confirmed || 0) + (counts.packed || 0) + (counts.shipped || 0) + (counts.outForDelivery || 0)}
            </span>
            <span className="text-[10px] text-amber-600">Pending & In-Transit</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Commissions</span>
            <span className="text-xl font-bold text-stone-900 mt-1 block">
              Rs. {fin.totalCommissionEarned.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-400">Rs. 300 / delivered</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Bonuses</span>
            <span className="text-xl font-bold text-stone-900 mt-1 block">
              Rs. {fin.totalBonusEarned.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-400">Milestone rewards</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-300 bg-amber-50/50 shadow-sm">
            <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block">Pending Payout</span>
            <span className="text-xl font-bold text-amber-950 mt-1 block">
              Rs. {fin.pendingPayout.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-800">Ready for disbursement</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-white px-4 rounded-t-xl overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-stone-900 text-stone-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & Status Updates ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('commissions')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'commissions'
                ? 'border-stone-900 text-stone-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Commissions Ledger ({commissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bonuses')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'bonuses'
                ? 'border-stone-900 text-stone-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Milestone Bonuses ({bonuses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'customers'
                ? 'border-stone-900 text-stone-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>My Customers ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'payouts'
                ? 'border-stone-900 text-stone-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payout Records ({payouts.length})</span>
          </button>
        </div>

        {/* Tab 1: Orders Table with Reseller Status Updater */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm overflow-hidden p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Your Attributed Customer Orders</h3>
                <p className="text-xs text-stone-500">
                  Update customer order progress as they are confirmed, shipped, and delivered.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-xs">
                No orders attributed yet. Share your referral link with potential buyers!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                      <th className="p-3">Order Number</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Suits</th>
                      <th className="p-3">Total (COD)</th>
                      <th className="p-3">Current Status</th>
                      <th className="p-3">Courier Tracking</th>
                      <th className="p-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-3 font-mono font-bold text-stone-900">{o.orderNumber}</td>
                        <td className="p-3">
                          <span className="font-semibold text-stone-900 block">{o.customer.fullName}</span>
                          <span className="text-[11px] text-stone-500">{o.customer.phone}</span>
                        </td>
                        <td className="p-3 text-stone-700">{o.customer.city}</td>
                        <td className="p-3 text-stone-700">
                          {o.items.reduce((s, i) => s + i.quantity, 0)} pcs
                        </td>
                        <td className="p-3 font-semibold text-stone-900">Rs. {o.total.toLocaleString()}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                              o.orderStatus === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.orderStatus === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : o.orderStatus === 'SHIPPED' || o.orderStatus === 'OUT_FOR_DELIVERY'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-stone-600 text-[11px]">
                          {o.shipment?.trackingNumber || 'Pending'}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                          {/* Direct Quick Action */}
                          {o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() =>
                                setStatusUpdateModal({
                                  order: o,
                                  newStatus: o.orderStatus === 'OUT_FOR_DELIVERY' || o.orderStatus === 'SHIPPED' ? 'DELIVERED' : 'CONFIRMED',
                                })
                              }
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded shadow-sm inline-flex items-center gap-1 transition-all"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{o.orderStatus === 'OUT_FOR_DELIVERY' || o.orderStatus === 'SHIPPED' ? 'Mark Delivered' : 'Confirm'}</span>
                            </button>
                          )}

                          {/* Universal Change Status Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setStatusUpdateModal({
                                order: o,
                                newStatus: o.orderStatus,
                              })
                            }
                            className="px-2.5 py-1 border border-stone-300 hover:border-stone-800 text-stone-700 hover:text-stone-900 font-semibold text-xs rounded transition-colors inline-flex items-center gap-1"
                            title="Update order status"
                          >
                            <Edit className="w-3 h-3 text-stone-500" />
                            <span>Change Status</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Commissions Ledger */}
        {activeTab === 'commissions' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Immutable Commission Ledger</h3>
              <p className="text-xs text-stone-500">Every delivered order credits Rs. 300 into your account.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                    <th className="p-3">Order Number</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Earned At</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {commissions.map((c) => (
                    <tr key={c._id}>
                      <td className="p-3 font-mono font-bold text-stone-900">{c.orderNumber}</td>
                      <td className="p-3 font-bold text-emerald-800">Rs. {c.amount.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            c.status === 'paid'
                              ? 'bg-blue-100 text-blue-800'
                              : c.status === 'earned'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'reversed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-stone-500">
                        {c.earnedAt ? new Date(c.earnedAt).toLocaleDateString() : 'Pending Delivery'}
                      </td>
                      <td className="p-3 text-stone-500">{c.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Bonuses */}
        {activeTab === 'bonuses' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Milestone Cash Bonuses</h3>
              <p className="text-xs text-stone-500">Rs. 500 bonus for every 10 delivered orders.</p>
            </div>

            {bonuses.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs">
                No bonuses earned yet. You are {bonusProgress.threshold - bonusProgress.progressInCurrentTier} delivered orders away from your next Rs. 500 bonus!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                      <th className="p-3">Milestone</th>
                      <th className="p-3">Bonus Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Earned At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {bonuses.map((b) => (
                      <tr key={b._id}>
                        <td className="p-3 font-bold text-stone-900">{b.milestoneOrders} Delivered Orders</td>
                        <td className="p-3 font-bold text-amber-700">Rs. {b.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 text-stone-500">{new Date(b.earnedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Customers */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Your Attributed Customers</h3>
              <p className="text-xs text-stone-500">Clients who placed orders via your referral link or code.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Orders</th>
                    <th className="p-3">Delivered</th>
                    <th className="p-3">Total Spend</th>
                    <th className="p-3">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customers.map((c, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-stone-900">{c.fullName}</td>
                      <td className="p-3 text-stone-600">{c.phone}</td>
                      <td className="p-3 text-stone-600">{c.city}</td>
                      <td className="p-3 text-stone-900">{c.totalOrders}</td>
                      <td className="p-3 text-emerald-700 font-semibold">{c.deliveredOrders}</td>
                      <td className="p-3 font-bold text-stone-900">Rs. {c.totalSpend.toLocaleString()}</td>
                      <td className="p-3 text-stone-500">{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Payouts */}
        {activeTab === 'payouts' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Payout Disbursements</h3>
                <p className="text-xs text-stone-500">
                  Disbursements sent to your <strong>{reseller?.paymentDetails?.paymentMethod || 'Easypaisa'}</strong> account ({reseller?.paymentDetails?.accountNumber}).
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400">Total Paid Out</span>
                <p className="text-base font-bold text-stone-900">Rs. {fin.totalPaid.toLocaleString()}</p>
              </div>
            </div>

            {payouts.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs">
                No past payout disbursements yet. Payouts are released once verified orders are completed.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                      <th className="p-3">Payout ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Transaction Ref</th>
                      <th className="p-3">Date Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {payouts.map((p) => (
                      <tr key={p._id}>
                        <td className="p-3 font-mono font-bold text-stone-900">{p.payoutNumber}</td>
                        <td className="p-3 font-bold text-emerald-800">Rs. {p.amount.toLocaleString()}</td>
                        <td className="p-3">{p.paymentMethod}</td>
                        <td className="p-3 font-mono text-stone-600">{p.transactionReference}</td>
                        <td className="p-3 text-stone-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Resignation Action Footer */}
        <div className="pt-6 border-t border-stone-200 flex justify-end">
          <button
            onClick={() => setResignModalOpen(true)}
            className="text-stone-400 hover:text-red-600 text-xs font-medium transition-colors"
          >
            Leave Reseller Program (Resign Account)
          </button>
        </div>
      </div>

      {/* Status Update Confirmation Modal */}
      {statusUpdateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Update Order Status
                  </h3>
                  <p className="text-xs text-stone-500">
                    Order: <strong className="text-stone-800">{statusUpdateModal.order.orderNumber}</strong> ({statusUpdateModal.order.customer.fullName})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusUpdateModal(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Select New Order Status <span className="text-amber-600">*</span>
                </label>
                <select
                  value={statusUpdateModal?.newStatus || 'PENDING'}
                  onChange={(e) =>
                    statusUpdateModal &&
                    setStatusUpdateModal({
                      ...statusUpdateModal,
                      newStatus: e.target.value as OrderStatus,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-bold text-stone-900 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  <option value="PENDING">PENDING (New Customer Booking)</option>
                  <option value="CONFIRMED">CONFIRMED (Call Verified)</option>
                  <option value="PACKED">PACKED (Parcel Packed)</option>
                  <option value="SHIPPED">SHIPPED (Booked with Courier)</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Rider on the Way)</option>
                  <option value="DELIVERED">DELIVERED (Cash Collected - Credits Rs. 300!)</option>
                  <option value="CANCELLED">CANCELLED (Customer Cancelled)</option>
                  <option value="RETURNED">RETURNED (Parcel Returned by Courier)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Verification Note / Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified with customer over call / Courier delivered"
                  value={statusReason || ''}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-800"
                />
              </div>

              {statusUpdateModal.newStatus === 'DELIVERED' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Commission Credit Unlocked:</strong>
                    <span>Marking this order as DELIVERED confirms successful COD collection and immediately unlocks <strong>Rs. 300 commission</strong> to your pending balance!</span>
                  </div>
                </div>
              )}

              {(statusUpdateModal.newStatus === 'CANCELLED' || statusUpdateModal.newStatus === 'RETURNED') && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Order Cancellation / Return:</strong>
                    <span>Marking as {statusUpdateModal.newStatus} halts delivery progress and reverses any pending commissions on this booking.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusUpdateModal(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={handleStatusUpdateSubmit}
                className="flex-1 py-2.5 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : `Set Status to ${statusUpdateModal.newStatus}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Resign Modal */}
      {resignModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-red-700">
              Confirm Resignation
            </h3>
            <p className="text-xs text-stone-600">
              Resigning your reseller account will permanently disable your referral code and portal access. Any earned commissions will be disbursed according to standard accounting.
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Reason for Resignation <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Please state why you are leaving..."
                value={resignationReason || ''}
                onChange={(e) => setResignationReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none focus:border-stone-800"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResignModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-stone-700 border border-stone-300 rounded hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resigning}
                onClick={handleResignSubmit}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded transition-colors disabled:opacity-50"
              >
                {resigning ? 'Processing...' : 'Submit Resignation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
