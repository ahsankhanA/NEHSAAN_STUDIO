import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NEmblem } from '../common/BrandLogo';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Truck,
  Settings,
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Search,
  AlertTriangle,
  Building2,
  UserCheck,
  Check,
  X,
  CreditCard,
  FileText,
  Lock,
  Tag,
  Percent,
  Copy,
  UserX,
  Sparkles,
  AlertCircle,
  Power,
  RotateCcw,
  Layers,
  ShieldCheck,
  Database,
  Download,
  Upload,
  Megaphone,
  Camera,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { processImageFiles } from '../../utils/imageUpload';
import type { IProduct, IOrder, IReseller, OrderStatus, ICategory, IBoutique, IHeroSlide } from '../../types';

export const AdminPortal: React.FC = () => {
  const { brandName, setBrandName } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'categories' | 'boutiques' | 'hero' | 'orders' | 'coupons' | 'resellers' | 'payouts' | 'suppliers' | 'customers' | 'exchanges' | 'audit' | 'settings'
  >('analytics');

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [resellers, setResellers] = useState<IReseller[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<any | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [boutiques, setBoutiques] = useState<IBoutique[]>([]);
  const [heroSlides, setHeroSlides] = useState<IHeroSlide[]>([]);
  const [dbSystemStatus, setDbSystemStatus] = useState<any | null>(null);

  // MongoDB Atlas Connection Diagnostics & Live Test
  const [testMongoUriInput, setTestMongoUriInput] = useState('mongodb+srv://ahsankhanfdj123_db_user:S3ILdsqGwWGt6xCD@cluster0.vzec4h0.mongodb.net/nehsaan?retryWrites=true&w=majority&appName=Cluster0');
  const [testingMongo, setTestingMongo] = useState(false);
  const [testMongoResult, setTestMongoResult] = useState<any | null>(null);
  const [applyingMongo, setApplyingMongo] = useState(false);

  // Hero Carousel & Event Slides Modal & State
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = useState<IHeroSlide | null>(null);
  const [heroSlideForm, setHeroSlideForm] = useState({
    tag: '',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    ctaText: 'Shop Collection',
    secondaryCta: 'View All Designs',
    category: 'Festive Wear',
    fabric: '',
    order: 1,
    active: true,
  });

  // Curated Boutique Modal & State
  const [boutiqueModalOpen, setBoutiqueModalOpen] = useState(false);
  const [editingBoutique, setEditingBoutique] = useState<IBoutique | null>(null);
  const [boutiqueForm, setBoutiqueForm] = useState({
    name: '',
    subtitle: '',
    image: '',
    categoryQuery: '',
    fabricQuery: '',
    tag: '',
    order: 1,
    active: true,
  });

  // Category Modal & State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<IProduct> | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);

  // Coupon Modal & State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    amount: 100,
    minimumSubtotal: 0,
    maxDiscount: '',
    usageLimit: '',
    notes: '',
  });
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  // Reseller Suspend / Delete Modals
  const [suspendModalReseller, setSuspendModalReseller] = useState<IReseller | null>(null);
  const [suspendReason, setSuspendReason] = useState('Temporary administrative suspension');
  const [deleteModalReseller, setDeleteModalReseller] = useState<IReseller | null>(null);

  const [emergencyOverrideModal, setEmergencyOverrideModal] = useState<{ order: IOrder; newStatus: OrderStatus } | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  const [payoutModalOpen, setPayoutModalOpen] = useState<IReseller | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState('Easypaisa');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  const [approveCodeModal, setApproveCodeModal] = useState<IReseller | null>(null);
  const [customApproveCode, setCustomApproveCode] = useState('');

  // Confirmation Dialog Modal State
  interface ConfirmDialogState {
    title: string;
    message: string;
    confirmLabel: string;
    confirmButtonClass?: string;
    icon?: 'trash' | 'alert' | 'check';
    onConfirm: () => Promise<void> | void;
  }

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Floating Toast Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCouponCode(text);
    showNotification(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedCouponCode(null), 2500);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [analyticsData, prodData, orderData, resData, supData, custData, exchData, auditData, settData, couponData, catData, boutiqueData, heroData, sysStatus] =
        await Promise.all([
          api.getFinancialAnalytics(),
          api.getAdminProducts(),
          api.getAdminOrders(),
          api.getAdminResellers(),
          api.getSuppliers(),
          api.getAdminCustomers(),
          api.getAdminExchanges(),
          api.getAuditLogs(),
          api.getAdminSettings(),
          api.getAdminCoupons().catch(() => ({ coupons: [] })),
          api.getCategories().catch(() => ({ categories: [] })),
          api.getBoutiques().catch(() => []),
          api.getHeroSlides().catch(() => []),
          api.getSystemStatus().catch(() => null),
        ]);

      setAnalytics(analyticsData);
      setProducts(prodData.products || []);
      setOrders(orderData.orders || []);
      setResellers(resData.resellers || []);
      setSuppliers(supData.suppliers || []);
      setCustomers(custData.customers || []);
      setExchanges(exchData.exchanges || []);
      setAuditLogs(auditData.logs || []);
      setCategories(catData.categories || []);
      if (Array.isArray(boutiqueData)) setBoutiques(boutiqueData);
      if (Array.isArray(heroData)) setHeroSlides(heroData);
      if (sysStatus) setDbSystemStatus(sysStatus);

      // Automated Anti-Reset Self-Healing Shield:
      // If server was restarted with empty/default items, auto-restore silently from local mirror!
      try {
        const mirrorStr = localStorage.getItem('nehsaan_browser_backup_mirror');
        if (mirrorStr) {
          const mirror = JSON.parse(mirrorStr);
          const mirrorResellers = Array.isArray(mirror.resellers) ? mirror.resellers.length : 0;
          const mirrorProducts = Array.isArray(mirror.products) ? mirror.products.length : 0;
          const currentResellers = (resData.resellers || []).length;
          const currentProducts = (prodData.products || []).length;

          if ((mirrorResellers > 0 && currentResellers === 0) || (mirrorProducts > currentProducts)) {
            console.log('[Auto-Recovery] Fresh server restart detected. Auto-restoring from browser cloud snapshot...');
            const autoRes = await api.autoRestoreDatabase(mirror);
            if (autoRes.restored) {
              showNotification(
                `🛡️ Automatic Anti-Reset Shield: Server restart detected! Restored ${autoRes.counts?.products || mirrorProducts} products and ${autoRes.counts?.resellers || mirrorResellers} resellers automatically.`,
                'success'
              );
              const [reProd, reRes, reHero, reBout] = await Promise.all([
                api.getAdminProducts(),
                api.getAdminResellers(),
                api.getHeroSlides().catch(() => []),
                api.getBoutiques().catch(() => []),
              ]);
              if (reProd.products) setProducts(reProd.products);
              if (reRes.resellers) setResellers(reRes.resellers);
              if (Array.isArray(reHero)) setHeroSlides(reHero);
              if (Array.isArray(reBout)) setBoutiques(reBout);
            }
          }
        }
      } catch (recoveryErr) {
        console.warn('Auto recovery check error:', recoveryErr);
      }

      // Live mirror snapshot for automatic disaster recovery
      try {
        if ((prodData.products || []).length > 0) {
          localStorage.setItem('nehsaan_browser_backup_mirror', JSON.stringify({
            timestamp: new Date().toISOString(),
            products: prodData.products,
            resellers: resData.resellers,
            orders: orderData.orders,
            boutiques: boutiqueData,
            heroSlides: heroData,
            categories: catData.categories,
          }));
        }
      } catch {
        // storage quota silent ignore
      }

      if (settData?.settings) {
        const s = settData.settings;
        setPlatformSettings({
          brandName: s.store?.brandName || 'NEHSAAN',
          tagline: s.store?.tagline || 'Exclusive Haute Couture & Luxury Clothing',
          address: s.store?.address || 'Sohan Islamabad',
          supportPhone: s.store?.whatsappNumber || s.store?.primaryPhone || '+92 323 5277238',
          shippingRules: {
            oneSuitFee: s.shipping?.singleSuitFee ?? 300,
            twoSuitsFee: s.shipping?.twoSuitsFee ?? 400,
            threeSuitsBaseFee: s.shipping?.threeSuitsBaseFee ?? 450,
            additionalSuitFee: s.shipping?.additionalSuitFee ?? 50,
          },
          extraPerThousandCharge: s.extraCharge?.ratePerThousand ?? 50,
          exchangeFee: s.exchange?.customerExchangeFee ?? 300,
          resellerSettings: {
            commissionPerDeliveredOrder: s.reseller?.commissionPerDeliveredOrder ?? 300,
            bonusMilestoneThreshold: s.reseller?.bonusThreshold ?? 10,
            bonusMilestoneAmount: s.reseller?.bonusAmount ?? 500,
          },
          postEx: {
            apiUrl: s.postex?.apiUrl || 'https://api.postex.pk/services/integration/api',
            token: s.postex?.apiKey || '',
          },
          whatsapp: {
            adminRecipient: s.whatsapp?.adminPhone || '+923235277238',
            recipient: s.whatsapp?.adminPhone || '+923235277238',
          },
        });
      }

      setCoupons(couponData?.coupons || []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const cleanImages = (editingProduct.images || [])
        .map((img) => (typeof img === 'string' ? img.trim() : ''))
        .filter(Boolean);

      if (cleanImages.length === 0) {
        showNotification('Please provide at least one valid Image URL for the product.', 'error');
        return;
      }

      const isUnstitched = String(editingProduct.subcategory || '').trim().toLowerCase() === 'unstitched';
      const cleanSizes = isUnstitched
        ? ['Unstitched']
        : ((editingProduct.sizes || []).filter((s) => s && s.toLowerCase() !== 'unstitched').length > 0
            ? (editingProduct.sizes || []).filter((s) => s && s.toLowerCase() !== 'unstitched')
            : ['Small', 'Medium', 'Large']);

      const productToSave = {
        ...editingProduct,
        images: cleanImages,
        sizes: cleanSizes,
      };

      if (productToSave._id) {
        await api.updateProduct(productToSave._id, productToSave);
        showNotification(`Product "${productToSave.name}" updated successfully.`);
      } else {
        await api.createProduct(productToSave);
        showNotification(`Product "${productToSave.name}" created successfully.`);
      }
      setProductModalOpen(false);
      setEditingProduct(null);
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save product', 'error');
    }
  };

  // Toggle Product Stock availability (In Stock / Out of Stock)
  const handleToggleProductStock = async (product: IProduct) => {
    try {
      await api.toggleProductStock(product._id);
      showNotification(`Stock availability toggled for "${product.name}".`);
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to toggle stock', 'error');
    }
  };

  // Product Delete with In-App Confirmation Modal
  const handleDeleteProduct = (id: string, name: string) => {
    setConfirmDialog({
      title: 'Delete Product',
      message: `Are you sure you want to permanently delete "${name}"? This item will be completely removed from your active catalog.`,
      confirmLabel: 'Delete Product',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'trash',
      onConfirm: async () => {
        try {
          await api.deleteProduct(id);
          showNotification(`Product "${name}" deleted successfully.`);
          setConfirmDialog(null);
          loadAllData();
        } catch (err: any) {
          showNotification(err.message || 'Failed to delete product', 'error');
        }
      },
    });
  };

  // Supplier Handlers
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    if (!editingSupplier.name?.trim() || !editingSupplier.phone?.trim()) {
      showNotification('Please provide supplier name and phone number.', 'error');
      return;
    }
    try {
      if (editingSupplier._id) {
        await api.updateSupplier(editingSupplier._id, {
          ...editingSupplier,
          name: editingSupplier.name.trim(),
          phone: editingSupplier.phone.trim(),
          address: editingSupplier.address || editingSupplier.city || 'Pakistan',
          category: editingSupplier.category || editingSupplier.categorySpecialty || 'Apparel',
        });
        showNotification(`Supplier "${editingSupplier.name}" updated successfully.`);
      } else {
        await api.createSupplier({
          name: editingSupplier.name.trim(),
          phone: editingSupplier.phone.trim(),
          whatsapp: editingSupplier.whatsapp?.trim() || editingSupplier.phone.trim(),
          address: editingSupplier.address || editingSupplier.city || 'Pakistan',
          category: editingSupplier.category || editingSupplier.categorySpecialty || 'Ladies & Gents Apparel',
          contactPerson: editingSupplier.contactPerson?.trim(),
          city: editingSupplier.city?.trim(),
          notes: editingSupplier.notes?.trim(),
        });
        showNotification(`Supplier "${editingSupplier.name}" added successfully.`);
      }
      setSupplierModalOpen(false);
      setEditingSupplier(null);
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save supplier', 'error');
    }
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    setConfirmDialog({
      title: 'Remove Supplier',
      message: `Are you sure you want to remove supplier "${name}"?`,
      confirmLabel: 'Remove Supplier',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'trash',
      onConfirm: async () => {
        try {
          await api.deleteSupplier(id);
          showNotification(`Supplier "${name}" removed successfully.`);
          setConfirmDialog(null);
          loadAllData();
        } catch (err: any) {
          showNotification(err.message || 'Failed to delete supplier', 'error');
        }
      },
    });
  };

  // Coupon Handlers
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      showNotification('Coupon code is required.', 'error');
      return;
    }
    try {
      await api.createCoupon({
        code: couponForm.code.trim().toUpperCase(),
        type: couponForm.type,
        amount: Number(couponForm.amount),
        minimumSubtotal: Number(couponForm.minimumSubtotal) || 0,
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined,
        notes: couponForm.notes.trim() || undefined,
      });
      showNotification(`Coupon "${couponForm.code.toUpperCase()}" created successfully!`);
      setCouponModalOpen(false);
      setCouponForm({
        code: '',
        type: 'percentage',
        amount: 100,
        minimumSubtotal: 0,
        maxDiscount: '',
        usageLimit: '',
        notes: '',
      });
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleGenerateSpecialVipCoupon = async () => {
    const code = `VIP100-${Math.floor(100 + Math.random() * 900)}`;
    try {
      await api.createCoupon({
        code,
        type: 'percentage',
        amount: 100,
        minimumSubtotal: 0,
        usageLimit: 50,
        notes: 'Special 100% discount pass for VIP inner circle',
      });
      showNotification(`Special VIP 100% Coupon ${code} generated!`);
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to generate VIP coupon', 'error');
    }
  };

  const handleToggleCouponActive = async (coupon: any) => {
    try {
      await api.updateCoupon(coupon._id, { active: !coupon.active });
      showNotification(`Coupon ${coupon.code} ${coupon.active ? 'disabled' : 'activated'}.`);
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update coupon', 'error');
    }
  };

  // Coupon Delete with in-app confirmation modal
  const handleDeleteCoupon = (id: string, code: string) => {
    setConfirmDialog({
      title: 'Delete Coupon',
      message: `Are you sure you want to permanently delete coupon "${code}"? Customers will no longer be able to use this discount.`,
      confirmLabel: 'Delete Coupon',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'trash',
      onConfirm: async () => {
        try {
          await api.deleteCoupon(id);
          showNotification(`Coupon "${code}" deleted successfully.`);
          setConfirmDialog(null);
          loadAllData();
        } catch (err: any) {
          showNotification(err.message || 'Failed to delete coupon', 'error');
        }
      },
    });
  };

  // Emergency Order Status Override
  const handleEmergencyOverrideSubmit = async () => {
    if (!emergencyOverrideModal) return;
    const finalReason = overrideReason.trim() || 'Super Admin manual status adjustment';
    try {
      await api.adminEmergencyStatusOverride(
        emergencyOverrideModal.order._id,
        emergencyOverrideModal.newStatus,
        finalReason
      );
      showNotification(`Status updated to ${emergencyOverrideModal.newStatus} for order ${emergencyOverrideModal.order.orderNumber}.`);
      setEmergencyOverrideModal(null);
      setOverrideReason('');
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Override failed', 'error');
    }
  };

  // Reseller Approve
  const handleApproveReseller = async () => {
    if (!approveCodeModal) return;
    try {
      await api.approveReseller(approveCodeModal._id, customApproveCode.trim() || undefined);
      showNotification(`Reseller ${approveCodeModal.fullName} approved.`);
      setApproveCodeModal(null);
      setCustomApproveCode('');
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to approve', 'error');
    }
  };

  // Reseller Reject with in-app confirmation modal
  const handleRejectReseller = (reseller: IReseller) => {
    setConfirmDialog({
      title: 'Reject Application',
      message: `Are you sure you want to reject the reseller application for "${reseller.fullName}" (${reseller.email})?`,
      confirmLabel: 'Reject Application',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'alert',
      onConfirm: async () => {
        try {
          await api.rejectReseller(reseller._id, 'Incomplete application requirements');
          showNotification(`Reseller application for ${reseller.fullName} rejected.`);
          setConfirmDialog(null);
          loadAllData();
        } catch (err: any) {
          showNotification(err.message || 'Failed to reject application', 'error');
        }
      },
    });
  };

  // Reseller Suspend / Delete Handlers (Modal Driven)
  const handleOpenSuspendModal = (reseller: IReseller) => {
    setSuspendModalReseller(reseller);
    setSuspendReason('Temporary administrative suspension');
  };

  const handleConfirmSuspendReseller = async () => {
    if (!suspendModalReseller) return;
    try {
      await api.suspendReseller(suspendModalReseller._id, suspendReason.trim() || 'Temporary administrative suspension');
      showNotification(`Reseller ${suspendModalReseller.fullName} suspended.`);
      setSuspendModalReseller(null);
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to suspend reseller', 'error');
    }
  };

  const handleReactivateReseller = async (reseller: IReseller) => {
    try {
      await api.reactivateReseller(reseller._id);
      showNotification(`Reseller ${reseller.fullName} reactivated.`);
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to reactivate reseller', 'error');
    }
  };

  const handleOpenDeleteResellerModal = (reseller: IReseller) => {
    setDeleteModalReseller(reseller);
  };

  const handleConfirmDeleteReseller = async () => {
    if (!deleteModalReseller) return;
    try {
      await api.deleteReseller(deleteModalReseller._id);
      showNotification(`Reseller ${deleteModalReseller.fullName} deleted.`);
      setDeleteModalReseller(null);
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete reseller', 'error');
    }
  };

  // Disburse Payout
  const handleDisbursePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutModalOpen) return;
    if (payoutAmount <= 0) {
      showNotification('Payout amount must be greater than zero.', 'error');
      return;
    }
    if (!payoutRef.trim()) {
      showNotification('Transaction reference ID is required.', 'error');
      return;
    }
    try {
      await api.createPayout({
        resellerId: payoutModalOpen._id,
        amount: payoutAmount,
        paymentMethod: payoutMethod,
        transactionReference: payoutRef.trim(),
        notes: payoutNotes.trim(),
      });
      showNotification(`Payout of Rs. ${payoutAmount.toLocaleString()} disbursed to ${payoutModalOpen.fullName}.`);
      setPayoutModalOpen(null);
      setPayoutRef('');
      setPayoutNotes('');
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Payout failed', 'error');
    }
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: ICategory) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || '' });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showNotification('Category name is required.', 'error');
      return;
    }
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory._id, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        });
        showNotification(`Category "${categoryForm.name}" updated successfully.`);
      } else {
        await api.createCategory({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        });
        showNotification(`Category "${categoryForm.name}" added successfully!`);
      }
      setCategoryModalOpen(false);
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = (cat: ICategory) => {
    setConfirmDialog({
      title: 'Delete Category',
      message: `Are you sure you want to permanently delete category "${cat.name}"? This category will be removed from your storefront filter pills and product menus.`,
      confirmLabel: 'Delete Category',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'trash',
      onConfirm: async () => {
        try {
          await api.deleteCategory(cat._id);
          showNotification(`Category "${cat.name}" removed successfully.`);
          setConfirmDialog(null);
          loadAllData();
        } catch (err: any) {
          showNotification(err.message || 'Failed to delete category', 'error');
        }
      },
    });
  };

  // Curated Boutique Handlers
  const handleOpenAddBoutique = () => {
    setEditingBoutique(null);
    setBoutiqueForm({
      name: '',
      subtitle: '',
      image: '',
      categoryQuery: '',
      fabricQuery: '',
      tag: '',
      order: boutiques.length + 1,
      active: true,
    });
    setBoutiqueModalOpen(true);
  };

  const handleOpenEditBoutique = (b: IBoutique) => {
    setEditingBoutique(b);
    setBoutiqueForm({
      name: b.name,
      subtitle: b.subtitle || '',
      image: b.image,
      categoryQuery: b.categoryQuery || b.name,
      fabricQuery: b.fabricQuery || '',
      tag: b.tag || '',
      order: b.order || 1,
      active: b.active !== false,
    });
    setBoutiqueModalOpen(true);
  };

  const handleSaveBoutique = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boutiqueForm.name.trim() || !boutiqueForm.image.trim()) {
      showNotification('Boutique Name and Image URL are required', 'error');
      return;
    }
    try {
      if (editingBoutique?._id) {
        await api.updateBoutique(editingBoutique._id, boutiqueForm);
        showNotification(`Curated Boutique "${boutiqueForm.name}" updated successfully!`);
      } else {
        await api.createBoutique(boutiqueForm);
        showNotification(`New Curated Boutique "${boutiqueForm.name}" added to storefront!`);
      }
      setBoutiqueModalOpen(false);
      const res = await api.getBoutiques();
      if (Array.isArray(res)) setBoutiques(res);
    } catch (err: any) {
      showNotification(err.message || 'Failed to save boutique', 'error');
    }
  };

  const handleDeleteBoutique = (b: IBoutique) => {
    setConfirmDialog({
      title: 'Delete Curated Boutique',
      message: `Are you sure you want to delete "${b.name}"? This curated collection card will be removed from your homepage grid.`,
      confirmLabel: 'Yes, Delete Boutique',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'trash',
      onConfirm: async () => {
        try {
          await api.deleteBoutique(b._id);
          showNotification(`Curated Boutique "${b.name}" deleted successfully.`);
          setConfirmDialog(null);
          const res = await api.getBoutiques();
          if (Array.isArray(res)) setBoutiques(res);
        } catch (err: any) {
          showNotification(err.message || 'Failed to delete boutique', 'error');
        }
      },
    });
  };

  // Hero Carousel & Seasonal Event Slide Handlers
  const handleOpenAddHeroSlide = () => {
    setEditingHeroSlide(null);
    setHeroSlideForm({
      tag: 'Limited Festive Drop',
      title: '',
      subtitle: '',
      description: '',
      image: '',
      ctaText: 'Shop Collection',
      secondaryCta: 'View All Designs',
      category: 'Festive Wear',
      fabric: '',
      order: heroSlides.length + 1,
      active: true,
    });
    setHeroModalOpen(true);
  };

  const handleOpenEditHeroSlide = (s: IHeroSlide) => {
    setEditingHeroSlide(s);
    setHeroSlideForm({
      tag: s.tag || '',
      title: s.title,
      subtitle: s.subtitle || '',
      description: s.description || '',
      image: s.image,
      ctaText: s.ctaText || 'Shop Collection',
      secondaryCta: s.secondaryCta || 'View All Designs',
      category: s.category || 'all',
      fabric: s.fabric || '',
      order: s.order || 1,
      active: s.active !== false,
    });
    setHeroModalOpen(true);
  };

  const handleSaveHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSlideForm.title.trim() || !heroSlideForm.image.trim()) {
      showNotification('Banner Title and Background Image URL are required', 'error');
      return;
    }
    try {
      if (editingHeroSlide?._id) {
        await api.updateHeroSlide(editingHeroSlide._id, heroSlideForm);
        showNotification(`Hero Event Banner "${heroSlideForm.title}" updated successfully!`);
      } else {
        await api.createHeroSlide(heroSlideForm);
        showNotification(`New Hero Event Banner "${heroSlideForm.title}" added to homepage!`);
      }
      setHeroModalOpen(false);
      const res = await api.getHeroSlides();
      if (Array.isArray(res)) setHeroSlides(res);
    } catch (err: any) {
      showNotification(err.message || 'Failed to save hero slide', 'error');
    }
  };

  const handleDeleteHeroSlide = (s: IHeroSlide) => {
    setConfirmDialog({
      title: 'Delete Hero Event Banner',
      message: `Are you sure you want to delete "${s.title}"? This event slide will be removed from your homepage hero carousel.`,
      confirmLabel: 'Yes, Delete Banner',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'trash',
      onConfirm: async () => {
        try {
          await api.deleteHeroSlide(s._id);
          showNotification(`Hero slide "${s.title}" deleted successfully.`);
          setConfirmDialog(null);
          const res = await api.getHeroSlides();
          if (Array.isArray(res)) setHeroSlides(res);
        } catch (err: any) {
          showNotification(err.message || 'Failed to delete hero slide', 'error');
        }
      },
    });
  };

  const handleToggleHeroSlideActive = async (s: IHeroSlide) => {
    try {
      const newActive = s.active === false;
      await api.updateHeroSlide(s._id, { active: newActive });
      showNotification(`Hero slide "${s.title}" is now ${newActive ? 'Active (Live)' : 'Inactive (Hidden)'}.`);
      const res = await api.getHeroSlides();
      if (Array.isArray(res)) setHeroSlides(res);
    } catch (err: any) {
      showNotification(err.message || 'Failed to toggle slide status', 'error');
    }
  };

  // System Backup & Disaster Recovery Handlers (Render Safe)
  const handleExportBackup = async () => {
    try {
      const backup = await api.exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nehsaan_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Complete database JSON backup downloaded successfully!');
    } catch (err: any) {
      showNotification('Failed to download backup: ' + err.message, 'error');
    }
  };

  const handleRestoreBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await api.restoreBackup(json);
        showNotification(`Database successfully restored! (${res.counts?.products || 0} products, ${res.counts?.resellers || 0} resellers)`);
        loadAllData();
      } catch (err: any) {
        showNotification('Invalid backup JSON: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestoreFromBrowserMirror = async () => {
    try {
      const saved = localStorage.getItem('nehsaan_browser_backup_mirror');
      if (!saved) {
        showNotification('No local browser snapshot found.', 'error');
        return;
      }
      const data = JSON.parse(saved);
      const res = await api.restoreBackup(data);
      showNotification(`Restored from local snapshot! (${res.counts?.products || 0} products, ${res.counts?.resellers || 0} resellers)`);
      loadAllData();
    } catch (err: any) {
      showNotification('Restoration error: ' + err.message, 'error');
    }
  };

  const handleTestMongoUri = async () => {
    if (!testMongoUriInput.trim()) {
      showNotification('Please enter a MongoDB connection string (URI)', 'error');
      return;
    }
    setTestingMongo(true);
    setTestMongoResult(null);
    try {
      const res = await api.testDatabaseUri(testMongoUriInput.trim());
      setTestMongoResult(res);
      if (res.success) {
        showNotification('✓ Connection Successful! MongoDB Atlas cluster is live and accessible.', 'success');
      } else {
        showNotification('Connection Failed: ' + (res.diagnosis || res.error || 'Check details below'), 'error');
      }
    } catch (err: any) {
      setTestMongoResult({
        success: false,
        error: err.message,
        diagnosis: 'Failed to run test request.',
        message: err.message,
      });
      showNotification('Error running connection test: ' + err.message, 'error');
    } finally {
      setTestingMongo(false);
    }
  };

  const handleApplyMongoUri = async () => {
    if (!testMongoUriInput.trim()) return;
    setApplyingMongo(true);
    try {
      const res = await api.switchDatabaseUri(testMongoUriInput.trim());
      if (res.success) {
        showNotification('✓ ' + res.message, 'success');
        const updatedStatus = await api.getSystemStatus();
        setDbSystemStatus(updatedStatus);
        loadAllData();
      } else {
        showNotification('Failed to apply MongoDB connection: ' + res.error, 'error');
      }
    } catch (err: any) {
      showNotification('Failed to apply: ' + err.message, 'error');
    } finally {
      setApplyingMongo(false);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(platformSettings);
      if (platformSettings.brandName) {
        setBrandName(platformSettings.brandName);
      }
      showNotification('Platform & business settings saved successfully.');
      loadAllData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save settings', 'error');
    }
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-500 font-medium">Loading Super Admin Command Center...</p>
        </div>
      </div>
    );
  }

  const pnl = analytics?.pnl || {
    grossRevenue: 0,
    wholesaleProductCost: 0,
    grossProfit: 0,
    grossMarginPercent: 0,
    resellerDisbursements: 0,
    totalOperationalExpenses: 0,
    netBusinessProfit: 0,
    netProfitMarginPercent: 0,
  };

  return (
    <div className="min-h-screen bg-stone-100/60 pb-16">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white px-4 py-6 shadow-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <NEmblem size={44} className="border border-amber-500/40 shadow-lg shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-amber-500 text-stone-950 font-bold text-[11px] rounded uppercase tracking-wider">
                  Super Admin Access
                </span>
                <span className="text-stone-400 text-xs">
                  Brand: <strong className="text-stone-200">{brandName}</strong>
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold tracking-tight">Executive Management Console</h1>
              <p className="text-xs text-stone-400">
                Live P&L analytics, wholesale inventory, reseller payouts, and operational controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  sku: `NIV-${Math.floor(1000 + Math.random() * 9000)}`,
                  category: 'Ladies',
                  subcategory: 'Stitched',
                  fabric: 'Lawn',
                  color: 'Multicolor',
                  sizes: ['Small', 'Medium', 'Large'],
                  retailPrice: 4500,
                  wholesaleCost: 2200,
                  stock: 20,
                  lowStockThreshold: 5,
                  images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
                  description: 'Premium quality handcrafted formal attire.',
                  status: 'active',
                });
                setProductModalOpen(true);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

            <button
              onClick={loadAllData}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        {/* In-App Toast Notification */}
        {notification && (
          <div
            className={`p-3.5 border text-xs rounded-xl flex items-center justify-between gap-3 shadow-md transition-all ${
              notification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2.5 font-medium">
              {notification.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Master Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-white px-4 rounded-t-xl overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'analytics' ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>P&L Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'products' ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products & Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'categories' ? 'border-stone-900 text-stone-950 font-bold' : 'border-transparent text-stone-500'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('boutiques')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'boutiques' ? 'border-stone-900 text-stone-950 font-bold' : 'border-transparent text-stone-500'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Curated Boutiques ({boutiques.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'hero' ? 'border-stone-900 text-stone-950 font-bold' : 'border-transparent text-stone-500'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Hero Banners / Events ({heroSlides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'orders' ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Monitor ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'coupons' ? 'border-stone-900 text-stone-950 font-bold' : 'border-transparent text-stone-500'
            }`}
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span>Coupons & VIP Discounts ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resellers')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'resellers' ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Reseller Oversight ({resellers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'payouts' ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payouts Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'suppliers' ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Suppliers ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'customers' ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Customers CRM ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('exchanges')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'exchanges' ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Exchanges ({exchanges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'audit' ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'settings' ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
          </button>
        </div>

        {/* 1. Analytics & Executive P&L Dashboard */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top P&L KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Delivered Revenue (COD)
                </span>
                <span className="text-2xl font-bold text-stone-900 mt-1 block">
                  Rs. {pnl.grossRevenue.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600">From delivered parcels</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Internal Wholesale Cost
                </span>
                <span className="text-2xl font-bold text-stone-900 mt-1 block">
                  Rs. {pnl.wholesaleProductCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-400">Supplier manufacturing cost</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Gross Profit Margin
                </span>
                <span className="text-2xl font-bold text-stone-900 mt-1 block">
                  {pnl.grossMarginPercent}%
                </span>
                <span className="text-[10px] text-stone-400">
                  Rs. {pnl.grossProfit.toLocaleString()} gross profit
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-300 bg-emerald-50/40 shadow-sm">
                <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider block">
                  Net Business Profit
                </span>
                <span className="text-2xl font-bold text-emerald-800 mt-1 block">
                  Rs. {pnl.netBusinessProfit.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  {pnl.netProfitMarginPercent}% net margin after payouts & logistics
                </span>
              </div>
            </div>

            {/* Comprehensive P&L Breakdown Table */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Full Financial Ledger & Cost Attribution
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody className="divide-y divide-stone-200">
                    <tr className="bg-stone-50 font-bold">
                      <td className="p-3">Gross Delivered Revenue (Cash on Delivery)</td>
                      <td className="p-3 text-right text-stone-900">Rs. {pnl.grossRevenue.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-6 text-stone-600">- Wholesale Cost of Goods Sold (COGS)</td>
                      <td className="p-3 text-right text-red-600">-Rs. {pnl.wholesaleProductCost.toLocaleString()}</td>
                    </tr>
                    <tr className="font-semibold bg-stone-50/50">
                      <td className="p-3">Gross Profit</td>
                      <td className="p-3 text-right text-stone-900">
                        Rs. {pnl.grossProfit.toLocaleString()} ({pnl.grossMarginPercent}%)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-6 text-stone-600">- Reseller Commissions (Rs.300 / delivered order)</td>
                      <td className="p-3 text-right text-red-600">
                        -Rs. {analytics?.pnl?.resellerCommissionExpense?.toLocaleString() || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-6 text-stone-600">- Reseller Milestone Bonuses (Rs.500 / 10 orders)</td>
                      <td className="p-3 text-right text-red-600">
                        -Rs. {analytics?.pnl?.resellerBonusExpense?.toLocaleString() || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-6 text-stone-600">- Courier COD Collection Fee</td>
                      <td className="p-3 text-right text-red-600">
                        -Rs. {analytics?.pnl?.codCollectionFeeExpense?.toLocaleString() || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-6 text-stone-600">- Luxury Packaging & Flyer Costs</td>
                      <td className="p-3 text-right text-red-600">
                        -Rs. {analytics?.pnl?.packagingExpense?.toLocaleString() || 0}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50 font-bold text-sm text-emerald-950">
                      <td className="p-3.5">Net Business Profit (Owner Bottom-Line)</td>
                      <td className="p-3.5 text-right text-emerald-800">
                        Rs. {pnl.netBusinessProfit.toLocaleString()} ({pnl.netProfitMarginPercent}%)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Products & Inventory Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Products Catalog & Wholesale Margins</h3>
                <p className="text-xs text-stone-500">
                  Wholesale costs and gross margins are strictly internal and visible only to Super Admins.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                    <th className="p-3">Product</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Retail Price</th>
                    <th className="p-3">Wholesale (COGS)</th>
                    <th className="p-3">Margin %</th>
                    <th className="p-3">Stock Units</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => {
                    const wholesale = p.wholesaleCost || 0;
                    const margin =
                      p.retailPrice > 0 ? Math.round(((p.retailPrice - wholesale) / p.retailPrice) * 100) : 0;
                    return (
                      <tr key={p._id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-3 flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <img
                              src={p.images[0] || ''}
                              alt=""
                              className="w-10 h-12 object-cover rounded bg-stone-100 border border-stone-200"
                            />
                            {p.images && p.images.length > 1 && (
                              <span
                                className="absolute -bottom-1 -right-1 bg-stone-950 text-amber-300 text-[9px] px-1 py-0.2 rounded-full font-bold shadow-xs border border-stone-800"
                                title={`${p.images.length} images/varieties available`}
                              >
                                +{p.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-stone-900 block">{p.name}</span>
                            <span className="text-[11px] text-stone-400">
                              {p.fabric} • {p.color}
                              {p.images && p.images.length > 1 ? ` • ${p.images.length} photos` : ''}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-stone-600">{p.sku}</td>
                        <td className="p-3 text-stone-600">{p.category} ({p.subcategory})</td>
                        <td className="p-3 font-bold text-stone-900">Rs. {p.retailPrice.toLocaleString()}</td>
                        <td className="p-3 font-semibold text-stone-600">Rs. {wholesale.toLocaleString()}</td>
                        <td className="p-3 font-bold text-emerald-700">{margin}%</td>
                        <td className="p-3">
                          <span
                            className={`font-semibold ${
                              p.stock <= p.lowStockThreshold ? 'text-amber-700 font-bold' : 'text-stone-800'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleProductStock(p)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1.5 shadow-xs ${
                              p.stockState === 'in_stock' && p.stock > 0
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
                            }`}
                            title="Click to toggle In Stock / Out of Stock"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.stockState === 'in_stock' && p.stock > 0 ? 'bg-emerald-600' : 'bg-red-600'}`} />
                            <span>{p.stockState === 'in_stock' && p.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const isUnst = String(p.subcategory || '').toLowerCase() === 'unstitched';
                                setEditingProduct({
                                  ...p,
                                  name: p.name || '',
                                  sku: p.sku || '',
                                  category: p.category || 'Ladies',
                                  subcategory: p.subcategory || (isUnst ? 'Unstitched' : 'Stitched'),
                                  fabric: p.fabric || '',
                                  color: p.color || '',
                                  retailPrice: p.retailPrice ?? 0,
                                  wholesaleCost: p.wholesaleCost ?? 0,
                                  stock: p.stock ?? 0,
                                  description: p.description || '',
                                  images: Array.isArray(p.images) ? p.images : [],
                                  sizes: isUnst
                                    ? ['Unstitched']
                                    : ((p.sizes || []).filter((s) => s !== 'Unstitched').length > 0
                                        ? p.sizes
                                        : ['Small', 'Medium', 'Large']),
                                });
                                setProductModalOpen(true);
                              }}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Dynamic Management Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700 border border-amber-200">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                    Categories & Fabrics Management
                  </h2>
                </div>
                <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                  Add, edit, or delete store categories. Custom categories (e.g. Lawn, Chiffon, Organza, Boski, Jacquard, Velvet) automatically populate your storefront filter toolbar and product catalog.
                </p>
              </div>

              <button
                onClick={handleOpenAddCategory}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 text-amber-300 hover:bg-stone-800 rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-stone-50 p-3.5 sm:p-4 rounded-xl border border-stone-200">
                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Active Categories
                </span>
                <span className="text-xl sm:text-2xl font-bold text-stone-900 mt-1 block">
                  {categories.length}
                </span>
                <span className="text-[10px] text-stone-500">Live in storefront filters</span>
              </div>

              <div className="bg-stone-50 p-3.5 sm:p-4 rounded-xl border border-stone-200">
                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Total Catalog Suits
                </span>
                <span className="text-xl sm:text-2xl font-bold text-stone-900 mt-1 block">
                  {products.length}
                </span>
                <span className="text-[10px] text-amber-700">Across all fabrics</span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-amber-50/60 p-3.5 sm:p-4 rounded-xl border border-amber-200/80">
                <span className="text-[10px] sm:text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                  Real-Time Sync
                </span>
                <span className="text-xs font-medium text-amber-900 mt-1 block">
                  Categories sync instantly across website navbar, mobile drawer & product forms.
                </span>
              </div>
            </div>

            {/* Categories Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-stone-100 text-[11px] font-semibold text-stone-600 uppercase tracking-wider border-b border-stone-200">
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">URL Slug / Key</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Active Products</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">
                        <Layers className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                        <p className="font-medium text-stone-600">No categories found.</p>
                        <p className="text-xs text-stone-400 mt-0.5">Click "Add New Category" above to create your first category.</p>
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-stone-900">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                          <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            {cat.slug}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                          {cat.description || <span className="text-stone-300 italic">No description</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 bg-stone-100 text-stone-800 rounded-full font-bold text-[11px]">
                            {cat.productCount ?? 0} {cat.productCount === 1 ? 'item' : 'items'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                              title="Edit Category"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Curated Boutiques Management Tab */}
        {activeTab === 'boutiques' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700 border border-amber-200">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                    Curated Boutiques & Seasonal Collections
                  </h2>
                </div>
                <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                  Manage the high-fashion curated boutique tiles shown on your storefront. Edit picture URLs, collection names, descriptions, or delete unwanted boutiques. Changes sync immediately to the live website.
                </p>
              </div>

              <button
                onClick={handleOpenAddBoutique}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 text-amber-300 hover:bg-stone-800 rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Boutique</span>
              </button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-stone-50 p-3.5 sm:p-4 rounded-xl border border-stone-200">
                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Active Boutiques
                </span>
                <span className="text-xl sm:text-2xl font-bold text-stone-900 mt-1 block">
                  {boutiques.filter((b) => b.active !== false).length}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Live on storefront grid</span>
              </div>

              <div className="bg-stone-50 p-3.5 sm:p-4 rounded-xl border border-stone-200">
                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Total Boutiques
                </span>
                <span className="text-xl sm:text-2xl font-bold text-stone-900 mt-1 block">
                  {boutiques.length}
                </span>
                <span className="text-[10px] text-amber-700">Configured in system</span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-amber-50/60 p-3.5 sm:p-4 rounded-xl border border-amber-200/80">
                <span className="text-[10px] sm:text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                  Direct Filter Linking
                </span>
                <span className="text-xs font-medium text-amber-900 mt-1 block">
                  Each boutique tile connects customers directly to matching seasonal fabric and category suits.
                </span>
              </div>
            </div>

            {/* Boutiques Visual Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {boutiques.length === 0 ? (
                <div className="col-span-full py-12 text-center text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p className="font-medium text-stone-600">No curated boutiques configured.</p>
                  <p className="text-xs text-stone-400 mt-0.5">Click "Add New Boutique" above to create your first boutique tile.</p>
                </div>
              ) : (
                boutiques.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    {/* Image Thumbnail and Badges */}
                    <div className="relative aspect-[16/9] w-full bg-stone-900 overflow-hidden">
                      <img
                        src={b.image}
                        alt={b.name}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {b.tag && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-sm">
                          {b.tag}
                        </span>
                      )}

                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.active !== false ? 'bg-emerald-500 text-white' : 'bg-stone-500 text-white'
                      }`}>
                        {b.active !== false ? 'Active' : 'Inactive'}
                      </span>

                      <div className="absolute bottom-2 left-3 right-3 text-white">
                        <h4 className="font-serif font-bold text-base text-white">{b.name}</h4>
                        <p className="text-[11px] text-stone-300 line-clamp-1">{b.subtitle || 'Luxury curated drop'}</p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="text-xs space-y-1.5 text-stone-600">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-stone-400">Target Category:</span>
                          <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                            {b.categoryQuery || b.name}
                          </span>
                        </div>
                        {b.fabricQuery && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-stone-400">Target Fabric:</span>
                            <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                              {b.fabricQuery}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-stone-400">Display Order:</span>
                          <span className="font-mono text-stone-700">#{b.order || 1}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBoutique(b)}
                          className="flex-1 py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBoutique(b)}
                          className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title="Delete Boutique"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Hero Page Carousel & Seasonal Event Banners Management Tab */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Hero Page Carousel & Seasonal Event Banners</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manage headline event banners on the top of your homepage (Eid, Summer Lawn, Winter Shawls, Flash Sales). Update images, text, and buttons anytime events change.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddHeroSlide}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Event Banner</span>
                </button>
              </div>
            </div>

            {/* Slides Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heroSlides.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300">
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-stone-700">No Hero Event Slides Configured</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Click "Add New Event Banner" above to create your first seasonal campaign banner.
                  </p>
                </div>
              ) : (
                heroSlides.map((slide) => (
                  <div
                    key={slide._id}
                    className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    {/* Visual Banner Preview */}
                    <div className="relative aspect-[16/8] w-full bg-stone-950 overflow-hidden">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center opacity-90"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/20" />

                      {slide.tag && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-md">
                          {slide.tag}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleHeroSlideActive(slide)}
                        className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md cursor-pointer transition-all ${
                          slide.active !== false
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-stone-600 hover:bg-stone-500 text-stone-200'
                        }`}
                        title="Click to toggle active state on homepage"
                      >
                        {slide.active !== false ? '● Live on Store' : '○ Hidden'}
                      </button>

                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                        <h4 className="font-serif font-bold text-lg text-white drop-shadow leading-tight">
                          {slide.title}
                        </h4>
                        <p className="text-xs text-amber-300 font-semibold line-clamp-1 mt-0.5">
                          {slide.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Description, Metadata & CTAs */}
                    <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {slide.description || 'No detailed description provided.'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">Primary Button:</span>
                          <span className="font-semibold text-stone-900">{slide.ctaText || 'Shop Collection'}</span>
                          <span className="text-[10px] text-amber-700 block truncate">({slide.category || 'All'} {slide.fabric ? `• ${slide.fabric}` : ''})</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">Secondary Button:</span>
                          <span className="font-semibold text-stone-900">{slide.secondaryCta || 'View All'}</span>
                          <span className="text-[10px] text-stone-500 block">Order #{slide.order || 1}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEditHeroSlide(slide)}
                          className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Banner</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleHeroSlideActive(slide)}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                            slide.active !== false
                              ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
                              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                          }`}
                          title="Toggle Active"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{slide.active !== false ? 'Hide' : 'Publish'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHeroSlide(slide)}
                          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. Orders Monitor Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900">All System Orders & Carrier Tracking</h3>
                <p className="text-xs text-stone-500">
                  Resellers primarily manage status of their attributed orders. Super Admins have emergency override.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                    <th className="p-3">Order Number</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Total (COD)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Attribution</th>
                    <th className="p-3">Courier Tracking</th>
                    <th className="p-3 text-right">Emergency Override</th>
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
                      <td className="p-3 font-bold text-stone-900">Rs. {o.total.toLocaleString()}</td>
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
                      <td className="p-3">
                        {o.resellerCode ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-mono text-[10px] rounded font-bold">
                            {o.resellerCode}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Direct Store</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-stone-600 text-[11px]">
                        {o.shipment?.trackingNumber || 'Pending Pickup'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() =>
                            setEmergencyOverrideModal({
                              order: o,
                              newStatus: o.orderStatus,
                            })
                          }
                          className="px-2.5 py-1 border border-stone-300 hover:border-amber-500 hover:text-amber-800 text-stone-700 rounded text-[11px] font-semibold transition-colors"
                        >
                          Change Status...
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coupons & VIP Discounts Tab */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-6">
            {/* Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>Coupons & VIP Discount Management</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Generate promotional vouchers, percentage/fixed discounts, and 100% free passes for your special VIP clients.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateSpecialVipCoupon}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click VIP 100% Coupon</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCouponForm({
                      code: '',
                      type: 'percentage',
                      amount: 100,
                      minimumSubtotal: 0,
                      maxDiscount: '',
                      usageLimit: '',
                      notes: '',
                    });
                    setCouponModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Custom Coupon</span>
                </button>
              </div>
            </div>

            {/* Special 100% VIP Discount Showcase Card */}
            <div className="p-4 bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50/50 border border-amber-200/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-500 text-stone-950 font-black text-[10px] rounded uppercase tracking-wider">
                    Exclusive VIP 100% Discount Pass
                  </span>
                  <span className="text-stone-400 text-xs">• Super Admin Special</span>
                </div>
                <h4 className="text-sm font-bold text-stone-900">
                  100% Free Order Coupons for Special Clients & VIP Partners
                </h4>
                <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                  Generate special coupons that provide 100% discount on entire orders. Customers applying this code at checkout receive a 100% free order without any payment, reserved exclusively for your personal inner-circle.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCouponForm({
                      code: `VIP100-${Math.floor(100 + Math.random() * 900)}`,
                      type: 'percentage',
                      amount: 100,
                      minimumSubtotal: 0,
                      maxDiscount: '',
                      usageLimit: '20',
                      notes: 'Special 100% VIP Free Order Coupon',
                    });
                    setCouponModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Configure VIP 100% Coupon</span>
                </button>
              </div>
            </div>

            {/* Coupons List Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  All Active & Inactive Coupons ({coupons.length})
                </h4>
                <div className="text-xs text-stone-500">
                  Click any coupon code to copy directly to clipboard.
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                      <th className="p-3">Coupon Code</th>
                      <th className="p-3">Discount Type & Value</th>
                      <th className="p-3">Min Order</th>
                      <th className="p-3">Usage / Limit</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-500">
                          <Tag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                          <p className="font-medium">No coupons generated yet.</p>
                          <p className="text-xs text-stone-400 mt-1">
                            Click "1-Click VIP 100% Coupon" or "Create Custom Coupon" above to get started.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      coupons.map((c) => {
                        const is100Percent = c.type === 'percentage' && c.amount === 100;
                        return (
                          <tr key={c._id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => copyToClipboard(c.code)}
                                className={`font-mono font-bold px-2 py-1 rounded inline-flex items-center gap-1.5 transition-all text-xs ${
                                  is100Percent
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                    : 'bg-stone-100 text-stone-900 border border-stone-300 hover:bg-stone-200'
                                }`}
                                title="Click to copy coupon code"
                              >
                                <span>{c.code}</span>
                                <Copy className="w-3 h-3 text-stone-500" />
                              </button>
                              {copiedCouponCode === c.code && (
                                <span className="ml-2 text-[10px] text-emerald-600 font-bold">Copied!</span>
                              )}
                            </td>

                            <td className="p-3 font-semibold">
                              {is100Percent ? (
                                <span className="px-2 py-0.5 bg-amber-500 text-stone-950 font-black rounded text-[11px] inline-flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  100% OFF (FREE ORDER)
                                </span>
                              ) : c.type === 'percentage' ? (
                                <span className="text-stone-900 font-bold">{c.amount}% Discount</span>
                              ) : (
                                <span className="text-stone-900 font-bold">Rs. {Number(c.amount).toLocaleString()} OFF</span>
                              )}
                              {c.maxDiscount ? (
                                <span className="text-stone-400 text-[10px] block font-normal">
                                  Max cap: Rs. {c.maxDiscount}
                                </span>
                              ) : null}
                            </td>

                            <td className="p-3 text-stone-600">
                              {c.minimumSubtotal > 0 ? `Rs. ${c.minimumSubtotal.toLocaleString()}` : 'No Minimum'}
                            </td>

                            <td className="p-3 text-stone-600">
                              <span className="font-semibold text-stone-800">{c.usedCount || 0}</span>
                              <span className="text-stone-400"> / {c.usageLimit ? c.usageLimit : '∞ Unlimited'}</span>
                            </td>

                            <td className="p-3 text-stone-500 max-w-xs truncate">
                              {c.notes || '—'}
                            </td>

                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => handleToggleCouponActive(c)}
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                                  c.active
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                }`}
                              >
                                {c.active ? 'Active' : 'Disabled'}
                              </button>
                            </td>

                            <td className="p-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => handleToggleCouponActive(c)}
                                className="p-1 text-stone-500 hover:text-stone-900"
                                title={c.active ? 'Pause Coupon' : 'Enable Coupon'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(c._id, c.code)}
                                className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. Resellers Oversight Tab */}
        {activeTab === 'resellers' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Reseller Management & Approvals</h3>
              <p className="text-xs text-stone-500">
                Review applicant registrations, approve with custom referral codes, monitor commissions, and suspend if needed.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                    <th className="p-3">Reseller</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Orders</th>
                    <th className="p-3">Pending Payout</th>
                    <th className="p-3">Total Paid</th>
                    <th className="p-3 text-right">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {resellers.map((r) => (
                    <tr key={r._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3 font-semibold text-stone-900">{r.fullName}</td>
                      <td className="p-3 font-mono font-bold text-amber-900">{r.code || 'PENDING'}</td>
                      <td className="p-3 text-stone-600">{r.phone}</td>
                      <td className="p-3 text-stone-600">{r.city}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.status === 'approved' || (r.status as string) === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'pending' || (r.status as string) === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : r.status === 'suspended' || (r.status as string) === 'SUSPENDED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-stone-800">{r.totalOrders} ({r.deliveredOrders} del)</td>
                      <td className="p-3 font-bold text-amber-900">
                        Rs. {(r.balance?.pendingPayout ?? r.pendingPayout ?? 0).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-stone-700">
                        Rs. {(r.balance?.totalPaidOut ?? r.totalPaid ?? 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {r.status === 'pending' || (r.status as string) === 'PENDING_APPROVAL' ? (
                          <>
                            <button
                              onClick={() => {
                                setApproveCodeModal(r);
                                setCustomApproveCode(
                                  r.fullName.split(' ')[0].toUpperCase() + Math.floor(100 + Math.random() * 900)
                                );
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectReseller(r)}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[11px] rounded"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            {(r.balance?.pendingPayout ?? r.pendingPayout ?? 0) > 0 && (
                              <button
                                onClick={() => {
                                  const pendingAmt = r.balance?.pendingPayout ?? r.pendingPayout ?? 0;
                                  setPayoutModalOpen(r);
                                  setPayoutAmount(pendingAmt);
                                  setPayoutMethod(r.paymentDetails?.paymentMethod || 'Easypaisa');
                                  setPayoutRef('');
                                  setPayoutNotes('');
                                }}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] rounded"
                              >
                                Disburse
                              </button>
                            )}

                            {r.status === 'suspended' || (r.status as string) === 'SUSPENDED' ? (
                              <button
                                onClick={() => handleReactivateReseller(r)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-[11px] rounded inline-flex items-center gap-1"
                                title="Reactivate reseller account"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reactivate</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenSuspendModal(r)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold text-[11px] rounded inline-flex items-center gap-1"
                                title="Temporarily suspend reseller account"
                              >
                                <UserX className="w-3 h-3" />
                                <span>Suspend</span>
                              </button>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => handleOpenDeleteResellerModal(r)}
                          className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded transition-colors inline-flex items-center align-middle"
                          title="Delete reseller account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Payouts Ledger Tab */}
        {activeTab === 'payouts' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Reseller Payout Disbursements</h3>
              <p className="text-xs text-stone-500">Record payments made via Easypaisa, JazzCash, or Bank Transfer.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                    <th className="p-3">Reseller</th>
                    <th className="p-3">Account</th>
                    <th className="p-3">Pending Commission</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {resellers
                    .filter((r) => (r.balance?.pendingPayout ?? r.pendingPayout ?? 0) > 0)
                    .map((r) => {
                      const pendingAmt = r.balance?.pendingPayout ?? r.pendingPayout ?? 0;
                      return (
                        <tr key={r._id}>
                          <td className="p-3">
                            <span className="font-semibold text-stone-900 block">{r.fullName}</span>
                            <span className="text-[11px] text-stone-400">Code: {r.code}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-stone-800">
                              {r.paymentDetails?.paymentMethod || 'Easypaisa'} - {r.paymentDetails?.accountNumber || r.phone}
                            </span>
                            <span className="text-[11px] text-stone-400 block">{r.paymentDetails?.accountTitle}</span>
                          </td>
                          <td className="p-3 font-bold text-base text-amber-900">
                            Rs. {pendingAmt.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                              Ready to Pay
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setPayoutModalOpen(r);
                                setPayoutAmount(pendingAmt);
                                setPayoutMethod(r.paymentDetails?.paymentMethod || 'Easypaisa');
                                setPayoutRef('');
                                setPayoutNotes('');
                              }}
                              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded transition-colors"
                            >
                              Disburse Funds
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {resellers.filter((r) => (r.balance?.pendingPayout ?? r.pendingPayout ?? 0) > 0).length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-stone-400">
                        No pending payouts right now. All verified commissions are disbursed!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Manufacturing Suppliers & Wholesale Mills</h3>
                <p className="text-xs text-stone-500">Track vendor sources for unstitched lawn, stitched pret, and gent fabrics.</p>
              </div>
              <button
                onClick={() => {
                  setEditingSupplier({
                    name: '',
                    contactPerson: '',
                    phone: '',
                    city: 'Lahore',
                    categorySpecialty: 'Unstitched',
                    notes: '',
                  });
                  setSupplierModalOpen(true);
                }}
                className="px-3 py-1.5 bg-stone-900 text-white font-semibold text-xs rounded flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Supplier</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">Contact Person</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Specialty</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {suppliers.map((s) => (
                    <tr key={s._id}>
                      <td className="p-3 font-semibold text-stone-900">{s.name}</td>
                      <td className="p-3 text-stone-700">{s.contactPerson}</td>
                      <td className="p-3 text-stone-600">{s.phone}</td>
                      <td className="p-3 text-stone-600">{s.city}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-medium">
                          {s.categorySpecialty}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingSupplier({
                              ...s,
                              name: s.name || '',
                              contactPerson: s.contactPerson || '',
                              phone: s.phone || '',
                              city: s.city || s.address || '',
                              categorySpecialty: s.categorySpecialty || s.category || 'Unstitched',
                              notes: s.notes || '',
                            });
                            setSupplierModalOpen(true);
                          }}
                          className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(s._id, s.name)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Customers Tab */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Customer Relationship Management (CRM)</h3>
              <p className="text-xs text-stone-500">Every customer who placed orders through the storefront or resellers.</p>
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
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td className="p-3 font-semibold text-stone-900">{c.fullName}</td>
                      <td className="p-3 text-stone-600">{c.phone}</td>
                      <td className="p-3 text-stone-600">{c.city}</td>
                      <td className="p-3 text-stone-800">{c.totalOrders}</td>
                      <td className="p-3 font-semibold text-emerald-700">{c.deliveredOrders}</td>
                      <td className="p-3 font-bold text-stone-900">Rs. {c.totalSpend.toLocaleString()}</td>
                      <td className="p-3 text-stone-500">{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. Exchanges & Returns Tab */}
        {activeTab === 'exchanges' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">7-Day Customer Exchange & Return Requests</h3>
              <p className="text-xs text-stone-500">Customer requests for replacement sizes, damaged suits, or returns.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                    <th className="p-3">Exchange ID</th>
                    <th className="p-3">Order Number</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Replacement Requested</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {exchanges.map((ex) => (
                    <tr key={ex._id}>
                      <td className="p-3 font-mono font-bold text-stone-900">{ex.exchangeNumber}</td>
                      <td className="p-3 font-mono text-stone-600">{ex.orderNumber}</td>
                      <td className="p-3 text-stone-600">{ex.customerPhone}</td>
                      <td className="p-3 font-semibold text-stone-800">{ex.desiredProductOrSize}</td>
                      <td className="p-3 text-stone-600 max-w-xs">{ex.reason}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ex.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ex.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ex.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {ex.status === 'PENDING' && (
                          <>
                            <button
                              onClick={async () => {
                                await api.updateExchangeStatus(ex._id, 'APPROVED', 'Replacement dispatched via Express Courier');
                                showNotification('Exchange request approved.');
                                loadAllData();
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                await api.updateExchangeStatus(ex._id, 'REJECTED', 'Beyond 7-day policy window');
                                showNotification('Exchange request rejected.');
                                loadAllData();
                              }}
                              className="px-2 py-1 bg-red-100 text-red-800 text-[11px] rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {exchanges.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-stone-400">
                        No pending exchange or return requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Security & Operational Audit Trail</h3>
              <p className="text-xs text-stone-500">Every sensitive action, emergency override, and payout is logged with IP and actor.</p>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 sticky top-0">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Details / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="p-3 text-stone-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-bold text-stone-800">{log.action}</td>
                      <td className="p-3 text-stone-600">{log.entityType} ({log.entityId?.slice(-6)})</td>
                      <td className="p-3 text-stone-800 font-medium">{log.actorRole}</td>
                      <td className="p-3 text-stone-600 max-w-sm truncate">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. Platform Settings Tab */}
        {activeTab === 'settings' && platformSettings && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-b-xl border border-stone-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Platform Identity & Business Formula Configuration
              </h3>
              <p className="text-xs text-stone-500">
                Update brand identity, delivery fee structure, reseller commissions, and WhatsApp alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Col */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-1">
                  Brand Identity
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={platformSettings.brandName || ''}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, brandName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={platformSettings.tagline || ''}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Support WhatsApp Phone</label>
                  <input
                    type="text"
                    value={platformSettings.supportPhone || ''}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Store / Warehouse Physical Address</label>
                  <input
                    type="text"
                    value={platformSettings.address || ''}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-stone-800"
                    placeholder="e.g. Sohan Islamabad"
                  />
                </div>
              </div>

              {/* Shipping & Delivery Formula */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-1">
                  Delivery Fees & Handling Charges
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">1 Suit Fee (Rs.)</label>
                    <input
                      type="number"
                      value={platformSettings.shippingRules?.oneSuitFee ?? 300}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          shippingRules: { ...platformSettings.shippingRules, oneSuitFee: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">2 Suits Fee (Rs.)</label>
                    <input
                      type="number"
                      value={platformSettings.shippingRules?.twoSuitsFee ?? 400}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          shippingRules: { ...platformSettings.shippingRules, twoSuitsFee: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">3 Suits Base (Rs.)</label>
                    <input
                      type="number"
                      value={platformSettings.shippingRules?.threeSuitsBaseFee ?? 450}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          shippingRules: { ...platformSettings.shippingRules, threeSuitsBaseFee: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">Per Started Rs.1,000 Handling</label>
                    <input
                      type="number"
                      value={platformSettings.extraPerThousandCharge ?? 50}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          extraPerThousandCharge: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">Exchange Fee (Rs.)</label>
                    <input
                      type="number"
                      value={platformSettings.exchangeFee ?? 300}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          exchangeFee: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Reseller Business Rules */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-1">
                  Reseller Commission Engine
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">Commission/Order (Rs.)</label>
                    <input
                      type="number"
                      value={platformSettings.resellerSettings?.commissionPerDeliveredOrder ?? 300}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          resellerSettings: {
                            ...platformSettings.resellerSettings,
                            commissionPerDeliveredOrder: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">Bonus Threshold (Orders)</label>
                    <input
                      type="number"
                      value={platformSettings.resellerSettings?.bonusMilestoneThreshold ?? 10}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          resellerSettings: {
                            ...platformSettings.resellerSettings,
                            bonusMilestoneThreshold: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">Bonus Reward (Rs.)</label>
                    <input
                      type="number"
                      value={platformSettings.resellerSettings?.bonusMilestoneAmount ?? 500}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          resellerSettings: {
                            ...platformSettings.resellerSettings,
                            bonusMilestoneAmount: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp API & Alerts */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-1">
                  Alerts & Notifications
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp Admin Phone (Order Alerts)</label>
                  <input
                    type="text"
                    value={platformSettings.whatsapp?.adminRecipient || platformSettings.whatsapp?.recipient || ''}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        whatsapp: { ...platformSettings.whatsapp, adminRecipient: e.target.value, recipient: e.target.value },
                      })
                    }
                    placeholder="+923235277238"
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded font-mono"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">New order details will be sent directly to this WhatsApp number.</p>
                </div>
              </div>

              {/* Render Deployment & Cloud Database Persistence */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Cloud Persistence & Anti-Reset Protection (Render Deployment)
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dbSystemStatus?.engine === 'mongodb_atlas' && dbSystemStatus?.isConnected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : dbSystemStatus?.lastError
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {dbSystemStatus?.engine === 'mongodb_atlas' && dbSystemStatus?.isConnected
                      ? `● MongoDB Atlas Cloud Active (${dbSystemStatus?.host || 'Cluster'})`
                      : dbSystemStatus?.lastError
                      ? '● MongoDB Connection Failed'
                      : '● Local File Persistence'}
                  </span>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3.5 text-xs">
                  {/* Status Banner */}
                  {dbSystemStatus?.engine === 'mongodb_atlas' && dbSystemStatus?.isConnected ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-emerald-950 text-xs">
                          Automatic MongoDB Cloud Sync Active (100% Zero-Loss Protection)
                        </h5>
                        <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                          Aapka app MongoDB Atlas se successfully connected hai ({dbSystemStatus?.host}). Har product, reseller, aur order direct cloud database me save hai. Render ka server chahe 1,000 bar restart ho, data 100% safe rahega.
                        </p>
                      </div>
                    </div>
                  ) : dbSystemStatus?.lastError ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1.5">
                      <div className="flex items-start gap-2.5 text-red-900">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-bold text-xs">
                            MongoDB Atlas Connection Error: {dbSystemStatus.lastError}
                          </h5>
                          <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">
                            {dbSystemStatus.errorDetail || 'Could not authenticate with MongoDB Atlas cluster.'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded border border-red-200 text-[11px] text-stone-700 leading-relaxed">
                        <strong className="text-red-950">Isay Theek Karne Ka Tareeqa:</strong> MongoDB Atlas (<a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="underline font-bold text-amber-800">cloud.mongodb.com</a>) me login karein &rarr; Left menu me <strong>Security &rarr; Database Access</strong> me jayein &rarr; Apne user ka password reset karein (e.g. <span className="font-mono bg-stone-100 px-1 font-bold">Nehsaan2026</span>) aur privileges me <strong>"Read and write to any database"</strong> select karein &rarr; Niche Tester tool me test kar ke Render me update karein.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-amber-950 text-xs">
                          Local Ephemeral Mode (MONGODB_URI not active)
                        </h5>
                        <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                          Server local store me chal raha hai. Render free tier par jab 15-20 min bad server sleep se wake hota hai to local memory reset ho sakti hai. 100% permanent storage ke liye niche MongoDB Atlas URI connect karein.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Interactive MongoDB Tester Tool */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                        <Database className="w-4 h-4 text-amber-600" />
                        <span>Live MongoDB URI Connection Tester & Linker</span>
                      </div>
                      <span className="text-[10px] text-stone-400">Zero Guesswork Test</span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-stone-700">
                        MongoDB Connection String (URI):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="mongodb+srv://username:password@cluster0.vzec4h0.mongodb.net/nehsaan?retryWrites=true&w=majority"
                          value={testMongoUriInput || ''}
                          onChange={(e) => setTestMongoUriInput(e.target.value)}
                          className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        />
                        <button
                          type="button"
                          disabled={testingMongo || !testMongoUriInput.trim()}
                          onClick={handleTestMongoUri}
                          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-amber-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          {testingMongo ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Testing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Test Connection</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Aap yahan direct apni MongoDB URI paste kar ke check kar sakte hain ke username/password sahi hai ya nahi.
                      </p>
                    </div>

                    {/* Test Results Display */}
                    {testMongoResult && (
                      <div
                        className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                          testMongoResult.success
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : 'bg-red-50 border-red-200 text-red-950'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {testMongoResult.success ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1 flex-1">
                            <p className="font-bold">{testMongoResult.message}</p>
                            {testMongoResult.diagnosis && (
                              <p className="text-[11px] opacity-90 leading-relaxed font-sans">
                                <strong>Tashkhees (Diagnosis):</strong> {testMongoResult.diagnosis}
                              </p>
                            )}
                            {testMongoResult.collections && testMongoResult.collections.length > 0 && (
                              <p className="text-[10px] opacity-80 font-mono">
                                Collections found: {testMongoResult.collections.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>

                        {testMongoResult.success && (
                          <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-medium text-emerald-800">
                              Yeh URI bilkul valid hai! Isay abhi server ke sath link karein:
                            </span>
                            <button
                              type="button"
                              disabled={applyingMongo}
                              onClick={handleApplyMongoUri}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {applyingMongo ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Linking & Syncing...</span>
                                </>
                              ) : (
                                <>
                                  <Database className="w-3.5 h-3.5" />
                                  <span>Apply & Sync Cloud Now</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Two Shields Explanation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-1 text-stone-700">
                      <span className="font-bold text-stone-900 block flex items-center gap-1.5 text-xs">
                        <Database className="w-3.5 h-3.5 text-amber-600" />
                        <span>Shield 1: Automatic MongoDB Cloud Sync</span>
                      </span>
                      <p className="leading-relaxed">
                        Jab aap Render Dashboard me <span className="font-mono text-amber-900 font-bold">MONGODB_URI</span> set kar dete hain, to har product, reseller, boutique, aur hero slide direct cloud me save hota rehta ha. Server jab bhi restart hoga, cloud se data khud-ba-khud auto-load ho jayega.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-1 text-stone-700">
                      <span className="font-bold text-stone-900 block flex items-center gap-1.5 text-xs">
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Shield 2: Automatic Browser Mirror Self-Healing</span>
                      </span>
                      <p className="leading-relaxed">
                        Agar MongoDB configure na bhi ho, tab bhi aapka browser live snapshot mirror karta rehta ha. Agar Render restart ho jaye to admin portal kholte hi system background me data auto-restore kar deta ha.
                      </p>
                    </div>
                  </div>

                  {/* Manual Backup Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const mirrorStr = localStorage.getItem('nehsaan_browser_backup_mirror');
                          if (mirrorStr) {
                            const mirror = JSON.parse(mirrorStr);
                            const res = await api.autoRestoreDatabase(mirror, true);
                            showNotification(
                              `⚡ Shield Active: ${res.counts?.products || products.length} products & ${res.counts?.resellers || resellers.length} resellers synced successfully!`
                            );
                            loadAllData();
                          } else {
                            handleExportBackup();
                          }
                        } catch (err: any) {
                          showNotification('Sync test completed: ' + err.message);
                        }
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sync & Test Cloud Shield Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON Backup</span>
                    </button>

                    <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload JSON Backup</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleRestoreBackupFile}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleRestoreFromBrowserMirror}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                      <span>Restore From Browser Mirror</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow"
              >
                Save All Business Settings
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Product Modal - Fully Responsive Bottom Sheet on Mobile / Centered Modal on Tablet & Desktop */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 transition-all duration-300">
          <div className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden border border-stone-200/80">
            {/* Mobile Sheet Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Sticky Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-stone-200 bg-stone-50/95 backdrop-blur-xs flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-amber-700" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 truncate leading-tight">
                      {editingProduct._id ? 'Edit Product Catalog' : 'Add New Product'}
                    </h3>
                    {editingProduct.sku && (
                      <span className="font-mono text-[10px] bg-stone-200 text-stone-800 px-1.5 py-0.5 rounded font-bold uppercase">
                        {editingProduct.sku}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {editingProduct._id
                      ? `Updating catalog item: ${editingProduct.name || editingProduct.sku || 'Item'}`
                      : 'Fill in product specifications, pricing, fabric, and pictures.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="w-10 h-10 -mr-1 sm:-mr-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 overflow-hidden text-xs">
              <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-5 flex-1 overscroll-contain pb-6">
                {/* Section 1: Basic Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                    <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                      1. Basic Information
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">* Required fields</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                    <div className="sm:col-span-7 md:col-span-8">
                      <label className="block font-semibold text-stone-700 mb-1 text-xs sm:text-[11px]">
                        Product Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Luxury Swiss Lawn 3-Piece Embroidered Suit"
                        value={editingProduct.name || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full px-3 py-2.5 sm:py-2 border border-stone-300 rounded-lg text-sm sm:text-xs text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-5 md:col-span-4">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-stone-700 text-xs sm:text-[11px]">
                          SKU / Code <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const catPrefix = (editingProduct.category || 'NVR').substring(0, 3).toUpperCase();
                            const subPrefix = (editingProduct.subcategory || 'ST').substring(0, 2).toUpperCase();
                            const randomNum = Math.floor(1000 + Math.random() * 9000);
                            setEditingProduct({
                              ...editingProduct,
                              sku: `${catPrefix}-${subPrefix}-${randomNum}`,
                            });
                          }}
                          className="text-[10px] text-amber-700 hover:text-amber-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          title="Generate a unique random SKU"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Auto SKU</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. NVR-LWN-001"
                        value={editingProduct.sku || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        className="w-full px-3 py-2.5 sm:py-2 border border-stone-300 rounded-lg font-mono text-sm sm:text-xs uppercase text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Classification, Fabric & Color */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                    <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                      2. Category, Fabric & Color
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Category */}
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1 text-xs sm:text-[11px]">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editingProduct.category || 'Ladies'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full px-3 py-2.5 sm:py-2 border border-stone-300 rounded-lg text-sm sm:text-xs text-stone-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                      >
                        <option value="Ladies">Ladies</option>
                        <option value="Gents">Gents</option>
                        <option value="Kids">Kids</option>
                        {categories
                          .filter((c) => !['Ladies', 'Gents', 'Kids'].includes(c.name))
                          .map((c) => (
                            <option key={c._id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Subcategory */}
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1 text-xs sm:text-[11px]">
                        Subcategory <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editingProduct.subcategory || 'Stitched'}
                        onChange={(e) => {
                          const newSub = e.target.value;
                          const isUnst = newSub === 'Unstitched';
                          const updatedSizes = isUnst
                            ? ['Unstitched']
                            : ((editingProduct.sizes || []).filter((s) => s !== 'Unstitched').length > 0
                                ? (editingProduct.sizes || []).filter((s) => s !== 'Unstitched')
                                : ['Small', 'Medium', 'Large']);
                          setEditingProduct({
                            ...editingProduct,
                            subcategory: newSub,
                            sizes: updatedSizes,
                          });
                        }}
                        className="w-full px-3 py-2.5 sm:py-2 border border-stone-300 rounded-lg text-sm sm:text-xs text-stone-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                      >
                        <option value="Stitched">Stitched (Pret / Readymade)</option>
                        <option value="Unstitched">Unstitched (3PC / 2PC Fabric)</option>
                      </select>
                    </div>

                    {/* Fabric / Material */}
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1 text-xs sm:text-[11px]">
                        Fabric / Material <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        list="product-fabric-datalist"
                        required
                        placeholder="e.g. Lawn, Chiffon, Boski, Velvet"
                        value={editingProduct.fabric || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                        className="w-full px-3 py-2.5 sm:py-2 border border-stone-300 rounded-lg text-sm sm:text-xs text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                      />
                      <datalist id="product-fabric-datalist">
                        <option value="Swiss Lawn" />
                        <option value="Chiffon" />
                        <option value="Organza" />
                        <option value="Boski" />
                        <option value="Dhanak" />
                        <option value="Velvet" />
                        <option value="Jacquard" />
                        <option value="Cotton" />
                        <option value="Linen" />
                        <option value="Raw Silk" />
                        <option value="Khaddar" />
                        <option value="Karandi" />
                        {categories.map((c) => (
                          <option key={c._id} value={c.name} />
                        ))}
                      </datalist>
                    </div>

                    {/* Color / Shade */}
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1 text-xs sm:text-[11px]">
                        Color / Shade
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Emerald Green, Mustard, Multi"
                        value={editingProduct.color || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })}
                        className="w-full px-3 py-2.5 sm:py-2 border border-stone-300 rounded-lg text-sm sm:text-xs text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Pricing, Cost & Stock with Live Margin Preview */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-100 pb-1.5">
                    <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                      3. Pricing & Inventory
                    </span>
                    {/* Live Margin Calculation Badge */}
                    {Number(editingProduct.retailPrice || 0) > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                        <span>Net Profit / Margin:</span>
                        <strong className="font-bold">
                          Rs. {(Number(editingProduct.retailPrice || 0) - Number(editingProduct.wholesaleCost || 0)).toLocaleString()}
                        </strong>
                        <span className="text-emerald-600 text-[10px]">
                          ({Math.round(((Number(editingProduct.retailPrice || 0) - Number(editingProduct.wholesaleCost || 0)) / Number(editingProduct.retailPrice || 1)) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1 text-xs sm:text-[11px]">
                        Retail Price (Rs. COD) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold pointer-events-none">
                          Rs.
                        </span>
                        <input
                          type="number"
                          required
                          min={0}
                          value={editingProduct.retailPrice !== undefined && editingProduct.retailPrice !== null ? editingProduct.retailPrice : ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, retailPrice: e.target.value === '' ? 0 : Number(e.target.value) })}
                          className="w-full pl-10 pr-3 py-2.5 sm:py-2 border border-stone-300 rounded-lg text-sm sm:text-xs text-stone-900 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">Customer storefront purchase price</p>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1 text-xs sm:text-[11px]">
                        Wholesale Cost (Rs. COGS) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold pointer-events-none">
                          Rs.
                        </span>
                        <input
                          type="number"
                          required
                          min={0}
                          value={editingProduct.wholesaleCost !== undefined && editingProduct.wholesaleCost !== null ? editingProduct.wholesaleCost : ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, wholesaleCost: e.target.value === '' ? 0 : Number(e.target.value) })}
                          className="w-full pl-10 pr-3 py-2.5 sm:py-2 border border-stone-300 rounded-lg text-sm sm:text-xs text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">Private supplier cost (never shown to customer)</p>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1 text-xs sm:text-[11px]">
                        Stock Quantity (Units) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={editingProduct.stock !== undefined && editingProduct.stock !== null ? editingProduct.stock : ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value === '' ? 0 : Number(e.target.value) })}
                        className="w-full px-3 py-2.5 sm:py-2 border border-stone-300 rounded-lg text-sm sm:text-xs text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">Available warehouse quantity</p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Sizing Management (Unstitched vs Stitched Pret) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                    <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                      4. Size Options
                    </span>
                  </div>

                  {editingProduct.subcategory === 'Unstitched' ? (
                    <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 sm:p-4 flex items-start gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg text-amber-900 shrink-0 mt-0.5">
                        <ShieldCheck className="w-5 h-5 text-amber-800" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="block font-bold text-stone-900 text-xs sm:text-sm">
                          Unstitched Fabric — Automatic Zero-Confusion Mode
                        </span>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          Aap ne <strong>Unstitched</strong> subcategory select ki hai. Storefront par customer se size (Small/Medium/Large) nahi poocha jayega kyun ke yeh unstitched suit hai. Customer direct add to cart ya one-click Cash on Delivery order kar sake ga.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-stone-50 border border-stone-200 p-3.5 sm:p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="block font-bold text-stone-900 text-xs sm:text-sm">
                            Stitched Apparel Sizes (Pret) <span className="text-red-500">*</span>
                          </span>
                          <p className="text-[11px] text-stone-500">
                            Customer storefront card / quick view me in sizes me se select karega:
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingProduct({
                                ...editingProduct,
                                sizes: ['Small', 'Medium', 'Large'],
                              })
                            }
                            className="text-[10px] font-bold text-stone-700 bg-white hover:bg-stone-100 px-2 py-1 rounded border border-stone-300 cursor-pointer"
                          >
                            Standard (S, M, L)
                          </button>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200">
                            {(editingProduct.sizes || []).filter((s) => s !== 'Unstitched').length} selected
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {['XS', 'Small', 'Medium', 'Large', 'XL', 'XXL', 'Custom'].map((sz) => {
                          const isSelected = (editingProduct.sizes || []).includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                const current = (editingProduct.sizes || []).filter((s) => s !== 'Unstitched');
                                const next = isSelected
                                  ? current.filter((s) => s !== sz)
                                  : [...current, sz];
                                setEditingProduct({
                                  ...editingProduct,
                                  sizes: next.length > 0 ? next : [sz],
                                });
                              }}
                              className={`min-h-[42px] px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-xs'
                                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400 hover:bg-stone-50'
                              }`}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{sz}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 5: Direct Picture Upload & Gallery Management */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-1.5 flex-wrap gap-2">
                    <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                      5. Product Pictures & Variety Angles <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                      {(editingProduct.images || []).filter(Boolean).length} Photos Uploaded
                    </span>
                  </div>

                  <div className="border border-stone-200 bg-stone-50/70 p-3.5 sm:p-4 rounded-xl space-y-3.5">
                    {/* Direct Upload Dropzone */}
                    <div className="relative border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/20 rounded-xl p-4 sm:p-6 text-center transition-all cursor-pointer group">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={imageUploading}
                        onChange={async (e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setImageUploading(true);
                            try {
                              const newImages = await processImageFiles(e.target.files);
                              const current = (editingProduct.images || []).filter(Boolean);
                              setEditingProduct({
                                ...editingProduct,
                                images: [...current, ...newImages],
                              });
                            } catch (err: any) {
                              alert('Error reading images: ' + err.message);
                            } finally {
                              setImageUploading(false);
                              e.target.value = '';
                            }
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="product-direct-image-upload"
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none space-y-2">
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                          {imageUploading ? (
                            <RefreshCw className="w-6 h-6 animate-spin text-amber-700" />
                          ) : (
                            <Camera className="w-6 h-6 text-amber-800" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-stone-900">
                            {imageUploading ? 'Optimizing & Uploading Photos...' : 'Tap to Upload Pictures from Mobile Gallery / Camera'}
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Multiple photos allowed (JPG, PNG, WEBP). Pehli photo Cover banegi.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Visual Thumbnail Gallery Grid */}
                    {(editingProduct.images || []).filter(Boolean).length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-stone-600 font-semibold px-0.5">
                          <span>Uploaded Photos (Reorder or set Cover):</span>
                          <span className="text-amber-800 font-medium text-[10px]">★ First image is the main Cover</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 max-h-80 overflow-y-auto p-1.5 bg-white rounded-xl border border-stone-200">
                          {(editingProduct.images || []).filter(Boolean).map((imgUrl, index) => (
                            <div
                              key={index}
                              className={`group/card relative rounded-lg overflow-hidden border transition-all flex flex-col justify-between ${
                                index === 0
                                    ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-50/20'
                                  : 'border-stone-200 hover:border-stone-400 bg-stone-50'
                              }`}
                            >
                              {/* Image Thumbnail */}
                              <div className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden">
                                <img
                                  src={imgUrl}
                                  alt={`Product photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                {/* Badge */}
                                <div className="absolute top-1.5 left-1.5 z-10">
                                  {index === 0 ? (
                                    <span className="px-1.5 py-0.5 bg-amber-500 text-stone-950 text-[9px] font-extrabold uppercase rounded shadow-xs flex items-center gap-0.5">
                                      <span>★ Cover</span>
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-stone-900/80 text-white text-[9px] font-bold rounded shadow-xs">
                                      #{index + 1}
                                    </span>
                                  )}
                                </div>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = (editingProduct.images || []).filter((_, i) => i !== index);
                                    setEditingProduct({
                                      ...editingProduct,
                                      images: filtered,
                                    });
                                  }}
                                  className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-md shadow-xs transition-colors cursor-pointer"
                                  title="Delete photo"
                                  aria-label="Delete photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Card Controls */}
                              <div className="p-1.5 bg-white border-t border-stone-100 flex items-center justify-between gap-1 text-[10px]">
                                {index !== 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = [...(editingProduct.images || []).filter(Boolean)];
                                      const selected = current.splice(index, 1)[0];
                                      current.unshift(selected);
                                      setEditingProduct({
                                        ...editingProduct,
                                        images: current,
                                      });
                                    }}
                                    className="flex-1 py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded text-center transition-colors truncate cursor-pointer"
                                    title="Make this the Cover photo"
                                  >
                                    Set Cover
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-800 px-1 py-0.5 truncate">
                                    Main Cover
                                  </span>
                                )}

                                {/* Move left / right */}
                                <div className="flex items-center gap-0.5 shrink-0">
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = [...(editingProduct.images || []).filter(Boolean)];
                                        const temp = current[index];
                                        current[index] = current[index - 1];
                                        current[index - 1] = temp;
                                        setEditingProduct({ ...editingProduct, images: current });
                                      }}
                                      className="p-1.5 text-stone-600 hover:bg-stone-100 rounded cursor-pointer"
                                      title="Move Left"
                                    >
                                      ←
                                    </button>
                                  )}
                                  {index < (editingProduct.images || []).filter(Boolean).length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = [...(editingProduct.images || []).filter(Boolean)];
                                        const temp = current[index];
                                        current[index] = current[index + 1];
                                        current[index + 1] = temp;
                                        setEditingProduct({ ...editingProduct, images: current });
                                      }}
                                      className="p-1.5 text-stone-600 hover:bg-stone-100 rounded cursor-pointer"
                                      title="Move Right"
                                    >
                                      →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optional Fallback URL input for external links */}
                    <div className="pt-1 border-t border-stone-200/60">
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer py-1"
                      >
                        <span>{showUrlInput ? '− Hide Image URL Option' : '+ Or Paste an Image Web URL (Optional)'}</span>
                      </button>

                      {showUrlInput && (
                        <div className="mt-2 flex flex-col sm:flex-row gap-2">
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/... or any image web link"
                            value={manualUrlInput || ''}
                            onChange={(e) => setManualUrlInput(e.target.value)}
                            className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (manualUrlInput.trim()) {
                                const current = (editingProduct.images || []).filter(Boolean);
                                setEditingProduct({
                                  ...editingProduct,
                                  images: [...current, manualUrlInput.trim()],
                                });
                                setManualUrlInput('');
                              }
                            }}
                            className="px-4 py-2 bg-stone-900 text-amber-300 rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
                          >
                            Add URL
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 6: Description */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-stone-700 text-xs sm:text-[11px]">
                    Product Description & Highlights
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about fabric embroidery, dupatta drape, trouser cut, and washing instructions..."
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3 py-2.5 sm:py-2 border border-stone-300 rounded-lg text-sm sm:text-xs text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                  />
                </div>
              </div>

              {/* Sticky Footer with Touch-Friendly Action Buttons */}
              <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-stone-200 bg-stone-50/95 sm:bg-white flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0 z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="text-[11px] text-stone-500 hidden sm:flex items-center gap-2">
                  <span>Photos: <strong>{(editingProduct.images || []).filter(Boolean).length}</strong></span>
                  <span>•</span>
                  <span>Stock: <strong>{editingProduct.stock || 0} units</strong></span>
                  {Number(editingProduct.retailPrice || 0) > 0 && (
                    <>
                      <span>•</span>
                      <span>Margin: <strong className="text-emerald-700 font-bold">{Math.round(((Number(editingProduct.retailPrice || 0) - Number(editingProduct.wholesaleCost || 0)) / Number(editingProduct.retailPrice || 1)) * 100)}%</strong></span>
                    </>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 bg-white hover:bg-stone-100 rounded-xl font-semibold text-xs sm:text-sm text-stone-700 transition-colors min-h-[44px] cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={imageUploading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-amber-300 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{editingProduct._id ? 'Update Product' : 'Save & Publish Product'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Status Override Modal */}
      {emergencyOverrideModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Admin Emergency Status Override</span>
            </div>
            <p className="text-xs text-stone-600">
              You are overriding status for Order #{emergencyOverrideModal.order.orderNumber} to:
            </p>

            <select
              value={emergencyOverrideModal.newStatus || 'PENDING'}
              onChange={(e) =>
                setEmergencyOverrideModal({
                  ...emergencyOverrideModal,
                  newStatus: e.target.value as OrderStatus,
                })
              }
              className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="RETURNED">RETURNED</option>
            </select>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Documented Reason (Mandatory Audit Trail) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="State the justification for this emergency status change..."
                value={overrideReason || ''}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEmergencyOverrideModal(null)}
                className="flex-1 py-2 text-xs border border-stone-300 rounded font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmergencyOverrideSubmit}
                className="flex-1 py-2 text-xs bg-red-600 hover:bg-red-500 text-white rounded font-bold"
              >
                Commit Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disburse Payout Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Disburse Reseller Commission Payout
            </h3>
            <p className="text-xs text-stone-600">
              Disbursing to <strong>{payoutModalOpen.fullName}</strong> (Code: {payoutModalOpen.code})
            </p>

            <form onSubmit={handleDisbursePayout} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Payout Amount (Rs.)</label>
                <input
                  type="number"
                  required
                  value={payoutAmount ?? 0}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Payment Method</label>
                <select
                  value={payoutMethod || 'Easypaisa'}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
                >
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer (1Link/Raast)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Transaction Reference ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EP-748920194 or Bank TID"
                  value={payoutRef || ''}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Paid weekly commissions batch"
                  value={payoutNotes || ''}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(null)}
                  className="flex-1 py-2 border border-stone-300 rounded font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded font-bold"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reseller Approve Code Modal */}
      {approveCodeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Approve Reseller Application</h3>
            <p className="text-xs text-stone-600">
              Assign referral code for <strong>{approveCodeModal.fullName}</strong> ({approveCodeModal.city}):
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Referral Code</label>
              <input
                type="text"
                required
                value={customApproveCode || ''}
                onChange={(e) => setCustomApproveCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-stone-300 rounded font-mono font-bold uppercase text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApproveCodeModal(null)}
                className="flex-1 py-2 text-xs border border-stone-300 rounded text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveReseller}
                className="flex-1 py-2 text-xs bg-emerald-600 text-white font-bold rounded hover:bg-emerald-500"
              >
                Approve & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal (Create / Configure) */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Create Discount Coupon</h3>
                  <p className="text-xs text-stone-500">Configure vouchers or 100% discount passes for special VIPs.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-600">Quick Presets:</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setCouponForm({
                      code: `VIP100-${Math.floor(100 + Math.random() * 900)}`,
                      type: 'percentage',
                      amount: 100,
                      minimumSubtotal: 0,
                      maxDiscount: '',
                      usageLimit: '25',
                      notes: 'VIP Inner Circle 100% Free Order Pass',
                    })
                  }
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] rounded flex items-center gap-1 shadow-sm"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>VIP 100% OFF</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCouponForm({
                      code: `HALF50-${Math.floor(100 + Math.random() * 900)}`,
                      type: 'percentage',
                      amount: 50,
                      minimumSubtotal: 1000,
                      maxDiscount: '5000',
                      usageLimit: '50',
                      notes: '50% Off Special Flash Deal',
                    })
                  }
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold rounded"
                >
                  50% OFF
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCouponForm({
                      code: `SAVE1000`,
                      type: 'fixed',
                      amount: 1000,
                      minimumSubtotal: 3000,
                      maxDiscount: '',
                      usageLimit: '100',
                      notes: 'Rs. 1,000 Flat Discount on orders over Rs. 3,000',
                    })
                  }
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold rounded"
                >
                  Rs. 1,000 Flat
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCouponForm({
                      code: `SAVE500`,
                      type: 'fixed',
                      amount: 500,
                      minimumSubtotal: 2000,
                      maxDiscount: '',
                      usageLimit: '200',
                      notes: 'Rs. 500 Welcome Discount',
                    })
                  }
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold rounded"
                >
                  Rs. 500 Flat
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-stone-700">Coupon Code *</label>
                  <button
                    type="button"
                    onClick={() =>
                      setCouponForm({
                        ...couponForm,
                        code: `PROMO${Math.floor(1000 + Math.random() * 9000)}`,
                      })
                    }
                    className="text-[11px] text-amber-700 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Generate Random</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP100, SUMMER20, EIDSPECIAL"
                  value={couponForm.code || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-stone-300 rounded font-mono font-bold text-stone-900 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={couponForm.type || 'percentage'}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, type: e.target.value as 'percentage' | 'fixed' })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {couponForm.type === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (Rs.) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={couponForm.type === 'percentage' ? 100 : undefined}
                      placeholder={couponForm.type === 'percentage' ? '100' : '500'}
                      value={couponForm.amount ?? 0}
                      onChange={(e) => setCouponForm({ ...couponForm, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-stone-300 rounded font-bold"
                    />
                    {couponForm.type === 'percentage' && couponForm.amount === 100 && (
                      <span className="absolute right-2 top-2 px-1.5 py-0.5 bg-amber-500 text-stone-950 font-black text-[9px] rounded">
                        100% VIP FREE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Min Order Subtotal (Rs.)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0 for no minimum"
                    value={couponForm.minimumSubtotal ?? 0}
                    onChange={(e) => setCouponForm({ ...couponForm, minimumSubtotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Usage Limit (Redemptions)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Leave empty for unlimited"
                    value={couponForm.usageLimit ?? ''}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Internal Notes & Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Given to family member, or exclusive marketing affiliate"
                  value={couponForm.notes || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="flex-1 py-2.5 border border-stone-300 rounded-lg font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold shadow-sm"
                >
                  Create & Activate Coupon
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Supplier Modal (Create / Edit) */}
      {supplierModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {editingSupplier._id ? 'Edit Supplier' : 'Add Manufacturing Supplier'}
                </h3>
                <p className="text-xs text-stone-500">Record textile mill or wholesale supplier details.</p>
              </div>
              <button
                type="button"
                onClick={() => setSupplierModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Supplier / Mill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Karam Mills, Sitara Textiles"
                  value={editingSupplier.name || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haji Tariq"
                    value={editingSupplier.contactPerson || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="03XX-XXXXXXX"
                    value={editingSupplier.phone || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Faisalabad, Lahore"
                    value={editingSupplier.city || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, city: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Fabric Specialty</label>
                  <select
                    value={editingSupplier.categorySpecialty || 'Unstitched'}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, categorySpecialty: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
                  >
                    <option value="Unstitched">Unstitched Lawn</option>
                    <option value="Luxury Chiffon">Luxury Chiffon</option>
                    <option value="Stitched Pret">Stitched Pret</option>
                    <option value="Gentlemen Fabric">Gentlemen Fabric</option>
                    <option value="Khaddar / Linen">Khaddar / Linen</option>
                    <option value="General Mills">General Mills</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Notes / Terms</label>
                <input
                  type="text"
                  placeholder="e.g. 15-day credit terms, direct mill delivery"
                  value={editingSupplier.notes || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSupplierModalOpen(false)}
                  className="flex-1 py-2.5 border border-stone-300 rounded font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded font-bold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Suspend Reseller Modal */}
      {suspendModalReseller && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3 text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <UserX className="w-6 h-6 shrink-0 text-amber-600" />
              <div>
                <h4 className="font-bold text-sm text-stone-900">Suspend Reseller Account</h4>
                <p className="text-xs text-stone-600">
                  Temporarily pause login access and referral earnings for this reseller.
                </p>
              </div>
            </div>

            <div className="text-xs space-y-2 text-stone-600">
              <p>
                <strong>Reseller:</strong> {suspendModalReseller.fullName} ({suspendModalReseller.code})
              </p>
              <p>
                <strong>Phone:</strong> {suspendModalReseller.phone} | <strong>City:</strong> {suspendModalReseller.city}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Reason for Temporary Suspension
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Policy violation inquiry, requested account hiatus..."
                value={suspendReason || ''}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModalReseller(null)}
                className="flex-1 py-2 text-xs border border-stone-300 rounded font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspendReseller}
                className="flex-1 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded font-bold shadow-sm"
              >
                Confirm Suspension
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Reseller Modal */}
      {deleteModalReseller && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3 text-red-800 bg-red-50 p-3 rounded-xl border border-red-200">
              <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
              <div>
                <h4 className="font-bold text-sm text-stone-900">Permanently Delete Reseller</h4>
                <p className="text-xs text-stone-600">
                  This action is irreversible. The reseller account and associated credentials will be removed.
                </p>
              </div>
            </div>

            <div className="text-xs space-y-1 text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-200">
              <p>
                <strong>Name:</strong> {deleteModalReseller.fullName}
              </p>
              <p>
                <strong>Referral Code:</strong> {deleteModalReseller.code}
              </p>
              <p>
                <strong>Phone:</strong> {deleteModalReseller.phone}
              </p>
              <p>
                <strong>Pending Payout:</strong> Rs. {(deleteModalReseller.balance?.pendingPayout ?? deleteModalReseller.pendingPayout ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalReseller(null)}
                className="flex-1 py-2 text-xs border border-stone-300 rounded font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReseller}
                className="flex-1 py-2 text-xs bg-red-600 hover:bg-red-500 text-white rounded font-bold shadow-sm"
              >
                Yes, Delete Reseller
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Category Create / Edit Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Category / Fabric Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Velvet, Silk, Khaddar, Lawn"
                  value={categoryForm.name || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  This will be shown in the storefront filter bar and catalog dropdowns.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of this fabric/collection..."
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="flex-1 py-2.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-stone-900 text-amber-300 hover:bg-stone-800 rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Curated Boutique Create / Edit Modal */}
      {boutiqueModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {editingBoutique ? 'Edit Curated Boutique' : 'Add New Curated Boutique'}
                </h3>
              </div>
              <button
                onClick={() => setBoutiqueModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBoutique} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Boutique Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Edit, Festive Wear"
                    value={boutiqueForm.name || ''}
                    onChange={(e) => setBoutiqueForm({ ...boutiqueForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Subtitle / Short Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Swiss Voile & Light Lawns"
                    value={boutiqueForm.subtitle || ''}
                    onChange={(e) => setBoutiqueForm({ ...boutiqueForm, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Picture Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or cloud image URL"
                  value={boutiqueForm.image || ''}
                  onChange={(e) => setBoutiqueForm({ ...boutiqueForm, image: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900 font-mono text-[11px]"
                />
                {/* Live Image Preview */}
                {boutiqueForm.image && (
                  <div className="mt-2 relative h-28 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                    <img
                      src={boutiqueForm.image}
                      alt="Boutique Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <span className="absolute bottom-1 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded">
                      Live Preview
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Filter Category Query
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Summer, Festive Wear, Lawn"
                    value={boutiqueForm.categoryQuery || ''}
                    onChange={(e) => setBoutiqueForm({ ...boutiqueForm, categoryQuery: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Filter Fabric Query (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lawn, Chiffon, Jacquard, Boski"
                    value={boutiqueForm.fabricQuery || ''}
                    onChange={(e) => setBoutiqueForm({ ...boutiqueForm, fabricQuery: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Trending, Haute Drop"
                    value={boutiqueForm.tag || ''}
                    onChange={(e) => setBoutiqueForm({ ...boutiqueForm, tag: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={boutiqueForm.order ?? 1}
                    onChange={(e) => setBoutiqueForm({ ...boutiqueForm, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={boutiqueForm.active ? 'true' : 'false'}
                    onChange={(e) => setBoutiqueForm({ ...boutiqueForm, active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setBoutiqueModalOpen(false)}
                  className="flex-1 py-2.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-stone-900 text-amber-300 hover:bg-stone-800 rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  {editingBoutique ? 'Update Boutique' : 'Create Boutique'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Hero Page Event Banner Create / Edit Modal */}
      {heroModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {editingHeroSlide ? 'Edit Hero Event Banner' : 'Add New Hero Event Banner'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Controls the main carousel banners on your storefront homepage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHeroModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Click Event Presets */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-900 block">Quick Event Presets (1-Click Fill):</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    name: '🌙 Eid Edit',
                    tag: 'Limited Festive Drop',
                    title: 'Eid Edit 2026',
                    subtitle: 'Up to 30% Off Haute Couture Ensembles',
                    description: 'Handcrafted zari, resham and tilla embroidery on pure swiss lawn & chiffon. Express Cash on Delivery nationwide.',
                    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=80',
                    ctaText: 'Shop Eid Edit',
                    secondaryCta: 'View Festive Wear',
                    category: 'Festive Wear',
                    fabric: 'Organza',
                  },
                  {
                    name: '☀️ Summer Voile',
                    tag: 'New Season Arrival',
                    title: 'Summer Voile & Lawn',
                    subtitle: 'Breezy Swiss Weaves & Floral Prints',
                    description: 'Ultra-breathable summer textures crafted for effortless daytime sophistication and evening comfort.',
                    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=80',
                    ctaText: 'Explore Summer Edit',
                    secondaryCta: 'Shop Swiss Lawn',
                    category: 'Summer',
                    fabric: 'Lawn',
                  },
                  {
                    name: '❄️ Winter Shawls',
                    tag: 'Regal Ensembles',
                    title: 'Winter Luxury & Shawls',
                    subtitle: 'Pashmina, Raw Silk & Embroidered Velvet',
                    description: 'Rich jewel tones, heavy embroidered borders and handcrafted warm shawls for statement occasions.',
                    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=2000&q=80',
                    ctaText: 'Explore Winter',
                    secondaryCta: 'View Luxury Pret',
                    category: 'Winter',
                    fabric: 'Jacquard',
                  },
                  {
                    name: '👑 Imperial Boski',
                    tag: 'Heritage Collection',
                    title: 'Imperial Gents Boski & Pret',
                    subtitle: 'Authentic 10-Pound Boski Silk & Cotton',
                    description: 'Traditional heritage wear tailored for gentlemen. Genuine gold seal fabric with flawless drape and luxury finish.',
                    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=80',
                    ctaText: 'Shop Gents Boski',
                    secondaryCta: 'View All Designs',
                    category: 'Boski',
                    fabric: 'Boski',
                  },
                  {
                    name: '⚡ Flash Sale 40%',
                    tag: 'Flash Sale Alert',
                    title: 'Mid-Season Clearance',
                    subtitle: 'Flat 40% Off Handcrafted Luxury Suites',
                    description: 'Limited stock available with immediate dispatch and 100% verified money-back guarantee.',
                    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=2000&q=80',
                    ctaText: 'Shop Clearance',
                    secondaryCta: 'View Catalog',
                    category: 'all',
                    fabric: '',
                  },
                ].map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setHeroSlideForm({
                        ...heroSlideForm,
                        tag: p.tag,
                        title: p.title,
                        subtitle: p.subtitle,
                        description: p.description,
                        image: p.image,
                        ctaText: p.ctaText,
                        secondaryCta: p.secondaryCta,
                        category: p.category,
                        fabric: p.fabric,
                      })
                    }
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-stone-800 rounded border border-amber-300 text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveHeroSlide} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Banner Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eid Edit 2026, Summer Voile"
                    value={heroSlideForm.title || ''}
                    onChange={(e) => setHeroSlideForm({ ...heroSlideForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Badge Tag (e.g. Limited Drop, New Arrival)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Limited Festive Drop, 40% Off"
                    value={heroSlideForm.tag || ''}
                    onChange={(e) => setHeroSlideForm({ ...heroSlideForm, tag: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Subtitle (Highlight Offer / Tagline)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Up to 30% Off Haute Couture Ensembles"
                  value={heroSlideForm.subtitle || ''}
                  onChange={(e) => setHeroSlideForm({ ...heroSlideForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description Text
                </label>
                <textarea
                  rows={2}
                  placeholder="Short engaging copy explaining the collection and fabrics..."
                  value={heroSlideForm.description || ''}
                  onChange={(e) => setHeroSlideForm({ ...heroSlideForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Banner Image URL (High Resolution) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={heroSlideForm.image || ''}
                  onChange={(e) => setHeroSlideForm({ ...heroSlideForm, image: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                />
                {heroSlideForm.image && (
                  <div className="mt-2 relative h-28 rounded-lg overflow-hidden border border-stone-200 bg-stone-950">
                    <img
                      src={heroSlideForm.image}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-white text-[11px] font-bold">
                        Preview: {heroSlideForm.title || 'Banner Title'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Eid Edit, Explore Lawn"
                    value={heroSlideForm.ctaText || ''}
                    onChange={(e) => setHeroSlideForm({ ...heroSlideForm, ctaText: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. View All Designs"
                    value={heroSlideForm.secondaryCta || ''}
                    onChange={(e) => setHeroSlideForm({ ...heroSlideForm, secondaryCta: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Target Category (When user clicks)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Festive Wear, Summer, Winter, all"
                    value={heroSlideForm.category || ''}
                    onChange={(e) => setHeroSlideForm({ ...heroSlideForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Target Fabric Filter (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lawn, Organza, Boski, Jacquard"
                    value={heroSlideForm.fabric || ''}
                    onChange={(e) => setHeroSlideForm({ ...heroSlideForm, fabric: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={heroSlideForm.order ?? 1}
                    onChange={(e) => setHeroSlideForm({ ...heroSlideForm, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={heroSlideForm.active ? 'true' : 'false'}
                    onChange={(e) => setHeroSlideForm({ ...heroSlideForm, active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  >
                    <option value="true">Active (Live on Carousel)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setHeroModalOpen(false)}
                  className="flex-1 py-2.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-stone-900 text-amber-300 hover:bg-stone-800 rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  {editingHeroSlide ? 'Update Hero Banner' : 'Publish Hero Banner'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3 text-red-800 bg-red-50 p-4 rounded-xl border border-red-200">
              {confirmDialog.icon === 'alert' ? (
                <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
              ) : (
                <Trash2 className="w-6 h-6 shrink-0 text-red-600" />
              )}
              <div>
                <h4 className="font-bold text-sm text-stone-900">{confirmDialog.title}</h4>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                disabled={confirmLoading}
                className="flex-1 py-2.5 text-xs border border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmLoading}
                onClick={async () => {
                  setConfirmLoading(true);
                  try {
                    await confirmDialog.onConfirm();
                  } finally {
                    setConfirmLoading(false);
                  }
                }}
                className={`flex-1 py-2.5 text-xs rounded-lg font-bold shadow-sm transition-all ${
                  confirmDialog.confirmButtonClass || 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {confirmLoading ? 'Processing...' : confirmDialog.confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
