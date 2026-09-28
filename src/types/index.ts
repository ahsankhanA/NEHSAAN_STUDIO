// Shared TypeScript Types for NIVORA Clothing & Reseller Platform

export type UserRole = 'SUPER_ADMIN' | 'RESELLER' | 'CUSTOMER';

export interface IUser {
  _id: string;
  email: string;
  passwordHash?: string;
  fullName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  resellerId?: string; // If role is RESELLER
  preferences?: {
    marketingNotifications?: boolean;
    emailAlerts?: boolean;
    pushAlerts?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type ResellerStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'resigned'
  | 'PENDING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'RESIGNED';

export interface IResellerPaymentDetails {
  accountTitle: string;
  paymentMethod: 'Easypaisa' | 'JazzCash' | 'Bank Transfer';
  accountNumber: string;
  bankName?: string;
  iban?: string;
}

export interface IReseller {
  _id: string;
  userId: string;
  code: string; // E.g., ALI482
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  experience?: string;
  notes?: string;
  profileImage?: string;
  status: ResellerStatus;
  paymentDetails: IResellerPaymentDetails;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  totalRevenueGenerated: number;
  totalCommissionEarned: number;
  totalBonusEarned: number;
  totalPaid: number;
  pendingPayout: number;
  balance?: {
    pendingPayout: number;
    totalPaidOut: number;
  };
  resignedAt?: string;
  resignationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus =
  | 'active'
  | 'draft'
  | 'out_of_stock'
  | 'archived'
  | 'ACTIVE'
  | 'DRAFT'
  | 'OUT_OF_STOCK'
  | 'ARCHIVED';
export type StockState = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order' | 'supplier_confirmation_required';

export interface IProductVariant {
  size: string;
  color: string;
  sku: string;
  stock: number;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  order?: number;
  parent?: string;
  subcategories?: string[];
  active?: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: string; // e.g. "Ladies", "Gents"
  subcategory: string; // e.g. "Stitched Suits", "Unstitched Suits"
  brand: string;
  description: string;
  shortDescription: string;
  retailPrice: number;
  compareAtPrice?: number;
  wholesaleCost?: number; // STRICTLY PRIVATE: Only Super Admin
  images: string[];
  videoUrl?: string;
  color: string;
  fabric: string;
  sizes: string[];
  variants?: IProductVariant[];
  stock: number;
  lowStockThreshold: number;
  stockState: StockState;
  supplierId?: string;
  supplierProductCode?: string;
  status: ProductStatus;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  sale: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISupplier {
  _id: string;
  name: string;
  category: string; // e.g. "Ladies & Gents Unstitched Suits"
  phone: string;
  whatsapp: string;
  address: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'EXCHANGE_REQUESTED'
  | 'EXCHANGED';

export interface IOrderItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number; // Snapshot of retail price at time of purchase
  wholesaleCostSnapshot?: number; // Snapshot for admin profit calculation
}

export interface ICustomerInfo {
  fullName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  street?: string;
  area?: string;
  city: string;
  province: string;
  postalCode?: string;
}

export interface IOrderStatusHistory {
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  changedBy: string; // Name or ID
  changedByRole: 'SUPER_ADMIN' | 'RESELLER' | 'SYSTEM' | 'CUSTOMER';
  reason?: string;
  timestamp: string;
}

export interface IShipmentInfo {
  carrier: string; // "Express Courier"
  trackingNumber?: string;
  status?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string; // E.g. ORD-20260921-0001
  customerId?: string;
  customer: ICustomerInfo;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  perThousandCharge: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'COD';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  orderStatus: OrderStatus;
  statusHistory: IOrderStatusHistory[];
  resellerId?: string | null;
  resellerCode?: string | null;
  referralSource?: string;
  referralTimestamp?: string;
  shipment: IShipmentInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CommissionStatus = 'pending' | 'earned' | 'payable' | 'paid' | 'reversed';

export interface ICommission {
  _id: string;
  resellerId: string;
  orderId: string;
  orderNumber: string;
  amount: number; // Standard Rs. 300
  status: CommissionStatus;
  earnedAt?: string;
  paidAt?: string;
  payoutId?: string;
  createdAt: string;
  notes?: string;
}

export interface IBonus {
  _id: string;
  resellerId: string;
  milestoneOrders: number; // e.g. 10, 20, 30...
  amount: number; // Standard Rs. 500
  status: 'earned' | 'paid';
  earnedAt: string;
  paidAt?: string;
  payoutId?: string;
  createdAt: string;
}

export interface IPayout {
  _id: string;
  payoutNumber: string;
  resellerId: string;
  resellerName: string;
  resellerCode: string;
  amount: number;
  paymentMethod: string;
  transactionReference: string;
  paidBy: string;
  paidAt: string;
  notes?: string;
  createdAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  type: 'fixed' | 'percentage';
  amount: number;
  minimumSubtotal: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  userUsageLimit?: number;
  userUsage?: Record<string, number>;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IReview {
  _id: string;
  productId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  rating: number; // 1 - 5
  comment: string;
  photoUrl?: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

export interface IAbandonedCart {
  _id: string;
  token: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  reminderSent: boolean;
  reminderSentAt?: string;
  orderCompleted: boolean;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface IAnnouncementSettings {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkCategory?: string;
  linkUrl?: string;
}

export type ExchangeStatus = 'pending' | 'requested' | 'under_review' | 'approved' | 'rejected' | 'replacement_sent' | 'completed';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'picked_up' | 'received' | 'inspected' | 'completed';

export interface IReturnRequest {
  _id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  reason: string;
  photos: string[];
  status: ReturnStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IExchangeRequest {
  _id: string;
  exchangeNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  desiredProductOrSize: string;
  reason: string;
  exchangeFee: number; // Rs. 300 for customer-requested change; 0 for business fault
  photos: string[];
  status: ExchangeStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStoreSettings {
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
  tagline: string;
  primaryPhone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  currency: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
}

export interface IShippingSettings {
  singleSuitFee: number; // 300
  twoSuitsFee: number; // 400
  threeSuitsBaseFee: number; // 450
  additionalSuitFee: number; // 50
  carrierName: string; // Express Courier
}

export interface IExtraChargeSettings {
  enabled: boolean;
  ratePerThousand: number; // 50
  roundingRule: 'ceiling';
}

export interface IResellerSettings {
  commissionPerDeliveredOrder: number; // 300
  bonusThreshold: number; // 10
  bonusAmount: number; // 500
  bonusMode: 'lifetime' | 'monthly';
  minimumPayout: number; // 1000
  approvalRequired: boolean;
}

export interface IExchangeSettings {
  customerExchangeFee: number; // 300
  checkWindowDays: number; // 7
  eligibleReasons: string[];
}

export interface IProfitCostSettings {
  packagingCostPerOrder: number; // 100
  codHandlingFee: number; // 50
  defaultRtoCost: number; // 250
  operationalCostPerOrder: number; // 50
}

export interface ISettings {
  _id?: string;
  store: IStoreSettings;
  shipping: IShippingSettings;
  extraCharge: IExtraChargeSettings;
  reseller: IResellerSettings;
  exchange: IExchangeSettings;
  profitCosts: IProfitCostSettings;
  postex: {
    enabled: boolean;
    apiUrl: string;
    apiKey: string;
  };
  whatsapp: {
    enabled: boolean;
    adminPhone: string;
    apiUrl?: string;
    phoneNumberId?: string;
    accessToken?: string;
  };
  announcement?: IAnnouncementSettings;
}

export interface IAuditLog {
  _id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'SYSTEM';
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ip?: string;
}

export interface INotification {
  _id: string;
  recipientRole: 'SUPER_ADMIN' | 'RESELLER';
  recipientResellerId?: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IBoutique {
  _id: string;
  name: string;
  subtitle: string;
  image: string;
  categoryQuery: string;
  fabricQuery?: string;
  tag?: string;
  order?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IHeroSlide {
  _id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  secondaryCta?: string;
  category: string;
  fabric?: string;
  order?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
