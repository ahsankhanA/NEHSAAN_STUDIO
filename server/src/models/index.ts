import mongoose, { Schema } from 'mongoose';
import type {
  IUser,
  IReseller,
  IProduct,
  ISupplier,
  IOrder,
  ICommission,
  IBonus,
  IPayout,
  ICustomerInfo,
  ICoupon,
  IReturnRequest,
  IExchangeRequest,
  ISettings,
  IAuditLog,
  INotification
} from '../../src/types/index.js';

// User Schema
const UserSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['SUPER_ADMIN', 'RESELLER', 'CUSTOMER'], default: 'CUSTOMER' },
  isActive: { type: Boolean, default: true },
  resellerId: { type: String, ref: 'Reseller' },
}, { timestamps: true });

// Reseller Schema
const ResellerSchema = new Schema<IReseller>({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  experience: { type: String },
  notes: { type: String },
  profileImage: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended', 'resigned'], default: 'pending', index: true },
  paymentDetails: {
    accountTitle: { type: String, default: '' },
    paymentMethod: { type: String, enum: ['Easypaisa', 'JazzCash', 'Bank Transfer'], default: 'Easypaisa' },
    accountNumber: { type: String, default: '' },
    bankName: { type: String },
    iban: { type: String },
  },
  totalOrders: { type: Number, default: 0 },
  deliveredOrders: { type: Number, default: 0 },
  cancelledOrders: { type: Number, default: 0 },
  returnedOrders: { type: Number, default: 0 },
  totalRevenueGenerated: { type: Number, default: 0 },
  totalCommissionEarned: { type: Number, default: 0 },
  totalBonusEarned: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  pendingPayout: { type: Number, default: 0 },
  resignedAt: { type: String },
  resignationReason: { type: String },
}, { timestamps: true });

// Product Schema
const ProductSchema = new Schema<IProduct>({
  _id: { type: String, required: true },
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  sku: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, index: true },
  subcategory: { type: String, required: true, index: true },
  brand: { type: String, default: 'NIVORA' },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  retailPrice: { type: Number, required: true },
  compareAtPrice: { type: Number },
  wholesaleCost: { type: Number, required: true }, // PRIVATE
  images: [{ type: String }],
  videoUrl: { type: String },
  color: { type: String, required: true },
  fabric: { type: String, required: true },
  sizes: [{ type: String }],
  variants: [{
    size: String,
    color: String,
    sku: String,
    stock: Number,
  }],
  stock: { type: Number, default: 10 },
  lowStockThreshold: { type: Number, default: 2 },
  stockState: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock', 'pre_order', 'supplier_confirmation_required'], default: 'in_stock' },
  stockStatus: { type: String, enum: ['IN_STOCK', 'OUT_OF_STOCK'], default: 'IN_STOCK', index: true },
  outOfStockAt: { type: Date, default: null, index: true },
  supplierId: { type: String, ref: 'Supplier' },
  supplierProductCode: { type: String },
  status: { type: String, enum: ['active', 'draft', 'out_of_stock', 'archived'], default: 'active', index: true },
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: true },
  bestSeller: { type: Boolean, default: false },
  sale: { type: Boolean, default: false },
  tags: [{ type: String }],
  seoTitle: { type: String },
  seoDescription: { type: String },
}, { timestamps: true });

// Supplier Schema
const SupplierSchema = new Schema<ISupplier>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  address: { type: String, required: true },
  notes: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Order Schema
const OrderSchema = new Schema<IOrder>({
  _id: { type: String, required: true },
  orderNumber: { type: String, required: true, unique: true, index: true },
  customerId: { type: String },
  customer: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    whatsapp: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    street: { type: String },
    area: { type: String },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String },
  },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String },
    color: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    wholesaleCostSnapshot: { type: Number, required: true },
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  perThousandCharge: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  orderStatus: {
    type: String,
    enum: [
      'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED',
      'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'EXCHANGE_REQUESTED', 'EXCHANGED'
    ],
    default: 'PENDING',
    index: true,
  },
  statusHistory: [{
    oldStatus: String,
    newStatus: String,
    changedBy: String,
    changedByRole: String,
    reason: String,
    timestamp: String,
  }],
  resellerId: { type: String, ref: 'Reseller', index: true, default: null },
  resellerCode: { type: String, default: null },
  referralSource: { type: String },
  referralTimestamp: { type: String },
  shipment: {
    carrier: { type: String, default: 'Express Courier' },
    trackingNumber: { type: String },
    status: { type: String, default: 'unassigned' },
    shippedAt: { type: String },
    deliveredAt: { type: String },
  },
  notes: { type: String },
}, { timestamps: true });

// Commission Schema
const CommissionSchema = new Schema<ICommission>({
  _id: { type: String },
  resellerId: { type: String, required: true, ref: 'Reseller', index: true },
  orderId: { type: String, required: true, ref: 'Order', index: true },
  orderNumber: { type: String, required: true },
  amount: { type: Number, required: true, default: 300 },
  status: { type: String, enum: ['pending', 'earned', 'payable', 'paid', 'reversed'], default: 'pending' },
  earnedAt: { type: String },
  paidAt: { type: String },
  payoutId: { type: String, ref: 'Payout' },
  notes: { type: String },
}, { timestamps: true });

// Bonus Schema
const BonusSchema = new Schema<IBonus>({
  _id: { type: String },
  resellerId: { type: String, required: true, ref: 'Reseller', index: true },
  milestoneOrders: { type: Number, required: true },
  amount: { type: Number, required: true, default: 500 },
  status: { type: String, enum: ['earned', 'paid'], default: 'earned' },
  earnedAt: { type: String, required: true },
  paidAt: { type: String },
  payoutId: { type: String, ref: 'Payout' },
}, { timestamps: true });

// Payout Schema
const PayoutSchema = new Schema<IPayout>({
  _id: { type: String },
  payoutNumber: { type: String, required: true, unique: true },
  resellerId: { type: String, required: true, ref: 'Reseller' },
  resellerName: { type: String, required: true },
  resellerCode: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  transactionReference: { type: String, required: true },
  paidBy: { type: String, required: true },
  paidAt: { type: String, required: true },
  notes: { type: String },
}, { timestamps: true });

// Customer Directory Schema
const CustomerSchema = new Schema({
  _id: { type: String },
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true, index: true },
  whatsapp: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  totalOrders: { type: Number, default: 0 },
  deliveredOrders: { type: Number, default: 0 },
  cancelledOrders: { type: Number, default: 0 },
  returnedOrders: { type: Number, default: 0 },
  totalSpend: { type: Number, default: 0 },
  associatedResellerId: { type: String, default: null },
}, { timestamps: true });

// Settings Schema
const SettingsSchema = new Schema<ISettings>({
  store: {
    brandName: { type: String, default: 'NEHSAAN' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    tagline: { type: String, default: 'Exclusive Haute Couture & Luxury Clothing' },
    primaryPhone: { type: String, default: '+92 323 5277238' },
    whatsappNumber: { type: String, default: '+923235277238' },
    email: { type: String, default: 'nehsaan@gmail.com' },
    address: { type: String, default: 'Sohan Islamabad' },
    currency: { type: String, default: 'PKR' },
  },
  shipping: {
    singleSuitFee: { type: Number, default: 300 },
    twoSuitsFee: { type: Number, default: 400 },
    threeSuitsBaseFee: { type: Number, default: 450 },
    additionalSuitFee: { type: Number, default: 50 },
    carrierName: { type: String, default: 'Express Courier' },
  },
  extraCharge: {
    enabled: { type: Boolean, default: true },
    ratePerThousand: { type: Number, default: 50 },
    roundingRule: { type: String, default: 'ceiling' },
  },
  reseller: {
    commissionPerDeliveredOrder: { type: Number, default: 300 },
    bonusThreshold: { type: Number, default: 10 },
    bonusAmount: { type: Number, default: 500 },
    bonusMode: { type: String, default: 'lifetime' },
    minimumPayout: { type: Number, default: 1000 },
    approvalRequired: { type: Boolean, default: true },
  },
  exchange: {
    customerExchangeFee: { type: Number, default: 300 },
    checkWindowDays: { type: Number, default: 7 },
    eligibleReasons: { type: [String], default: ['damaged_item', 'wrong_product', 'size_exchange', 'color_mismatch'] },
  },
  profitCosts: {
    packagingCostPerOrder: { type: Number, default: 100 },
    codHandlingFee: { type: Number, default: 50 },
    defaultRtoCost: { type: Number, default: 250 },
    operationalCostPerOrder: { type: Number, default: 50 },
  },
  postex: {
    enabled: { type: Boolean, default: true },
    apiUrl: { type: String, default: 'https://api.postex.pk/services/integration/api' },
    apiKey: { type: String, default: '' },
  },
  whatsapp: {
    enabled: { type: Boolean, default: true },
    adminPhone: { type: String, default: '+923235277238' },
    apiUrl: { type: String, default: 'https://graph.facebook.com/v19.0' },
    phoneNumberId: { type: String, default: '' },
    accessToken: { type: String, default: '' },
  },
}, { timestamps: true });

// Audit Log Schema
const AuditLogSchema = new Schema<IAuditLog>({
  actorId: { type: String, required: true },
  actorName: { type: String, required: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: String },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: String, required: true, default: () => new Date().toISOString() },
  ip: { type: String },
}, { timestamps: true });

// System Snapshot Schema for automatic cloud backup across Render restarts
const SystemSnapshotSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  lastSavedAt: { type: String, required: true, default: () => new Date().toISOString() },
}, { timestamps: true });

// Export Mongoose Models safely
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const ResellerModel = mongoose.models.Reseller || mongoose.model<IReseller>('Reseller', ResellerSchema);
export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export const SupplierModel = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const CommissionModel = mongoose.models.Commission || mongoose.model<ICommission>('Commission', CommissionSchema);
export const BonusModel = mongoose.models.Bonus || mongoose.model<IBonus>('Bonus', BonusSchema);
export const PayoutModel = mongoose.models.Payout || mongoose.model<IPayout>('Payout', PayoutSchema);
export const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
export const SettingsModel = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export const SystemSnapshotModel = mongoose.models.SystemSnapshot || mongoose.model('SystemSnapshot', SystemSnapshotSchema);
