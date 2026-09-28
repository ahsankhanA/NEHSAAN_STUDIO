import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { ProductController } from '../controllers/product.controller.js';
import { OrderController } from '../controllers/order.controller.js';
import { ResellerController } from '../controllers/reseller.controller.js';
import { FinanceController } from '../controllers/finance.controller.js';
import { SettingsController } from '../controllers/settings.controller.js';
import { SupplierController } from '../controllers/supplier.controller.js';
import { CustomerController } from '../controllers/customer.controller.js';
import { ExchangeController } from '../controllers/exchange.controller.js';
import { AuditController } from '../controllers/audit.controller.js';
import { NotificationController } from '../controllers/notification.controller.js';
import { CouponController } from '../controllers/coupon.controller.js';
import { CategoryController } from '../controllers/category.controller.js';
import { ReviewController } from '../controllers/review.controller.js';
import { CartController } from '../controllers/cart.controller.js';
import { BoutiqueController } from '../controllers/boutique.controller.js';
import { HeroController } from '../controllers/hero.controller.js';
import { SystemController } from '../controllers/system.controller.js';
import { authenticate, requireSuperAdmin, requireReseller } from '../middleware/auth.middleware.js';

const router = Router();

// 1. Health & DB Status
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NEHSAAN Luxury E-Commerce & Reseller Engine',
    timestamp: new Date().toISOString(),
  });
});

// 2. Auth Routes
router.get('/auth/setup-status', AuthController.getSetupStatus);
router.post('/auth/initial-setup', AuthController.initialSetup);
router.post('/auth/login', AuthController.login);
router.post('/auth/apply-reseller', AuthController.applyReseller);
router.get('/auth/me', authenticate, AuthController.getProfile);
router.put('/auth/profile', authenticate, AuthController.updateProfile);
router.put('/auth/change-password', authenticate, AuthController.changePassword);

// 3. Product Routes
router.get('/products', ProductController.getPublicProducts);
router.get('/products/slug/:slug', ProductController.getPublicProductBySlug);
router.get('/products/admin/all', authenticate, requireSuperAdmin, ProductController.getAdminProducts);
router.post('/products/admin', authenticate, requireSuperAdmin, ProductController.createProduct);
router.put('/products/admin/:id', authenticate, requireSuperAdmin, ProductController.updateProduct);
router.patch('/products/admin/:id/toggle-stock', authenticate, requireSuperAdmin, ProductController.toggleStock);
router.delete('/products/admin/:id', authenticate, requireSuperAdmin, ProductController.deleteProduct);

// 4. Order Routes
router.post('/orders', OrderController.createOrder); // Public checkout
router.post('/orders/track', OrderController.trackOrder); // Public tracking
router.get('/orders/reseller', authenticate, requireReseller, OrderController.getResellerOrders);
router.put('/orders/reseller/:orderId/status', authenticate, requireReseller, OrderController.updateOrderStatusByReseller);
router.get('/orders/admin/all', authenticate, requireSuperAdmin, OrderController.getAdminOrders);
router.put('/orders/admin/:orderId/emergency-override', authenticate, requireSuperAdmin, OrderController.adminEmergencyStatusOverride);
router.put('/orders/admin/:orderId/status', authenticate, requireSuperAdmin, OrderController.adminEmergencyStatusOverride);

// 5. Reseller Routes
router.get('/resellers/me/stats', authenticate, requireReseller, ResellerController.getResellerDashboardStats);
router.get('/resellers/me/customers', authenticate, requireReseller, ResellerController.getResellerCustomers);
router.post('/resellers/me/resign', authenticate, requireReseller, ResellerController.resignReseller);
router.get('/resellers/admin/all', authenticate, requireSuperAdmin, ResellerController.getAdminResellers);
router.get('/resellers/admin/performance', authenticate, requireSuperAdmin, ResellerController.getResellerPerformance);
router.put('/resellers/admin/:id/approve', authenticate, requireSuperAdmin, ResellerController.approveReseller);
router.put('/resellers/admin/:id/reject', authenticate, requireSuperAdmin, ResellerController.rejectReseller);
router.put('/resellers/admin/:id/suspend', authenticate, requireSuperAdmin, ResellerController.suspendReseller);
router.put('/resellers/admin/:id/reactivate', authenticate, requireSuperAdmin, ResellerController.reactivateReseller);
router.delete('/resellers/admin/:id', authenticate, requireSuperAdmin, ResellerController.deleteReseller);

// 6. Finance & Commissions Routes
router.get('/finance/commissions', authenticate, FinanceController.getCommissions);
router.get('/finance/bonuses', authenticate, FinanceController.getBonuses);
router.get('/finance/payouts', authenticate, FinanceController.getPayouts);
router.post('/finance/payouts', authenticate, requireSuperAdmin, FinanceController.createPayout);
router.get('/finance/admin/analytics', authenticate, requireSuperAdmin, FinanceController.getFinancialAnalytics);

// 7. Settings Routes
router.get('/settings/public', SettingsController.getPublicSettings);
router.get('/settings/admin', authenticate, requireSuperAdmin, SettingsController.getAdminSettings);
router.put('/settings/admin', authenticate, requireSuperAdmin, SettingsController.updateSettings);

// 8. Suppliers Routes
router.get('/suppliers', authenticate, requireSuperAdmin, SupplierController.getSuppliers);
router.post('/suppliers', authenticate, requireSuperAdmin, SupplierController.createSupplier);
router.put('/suppliers/:id', authenticate, requireSuperAdmin, SupplierController.updateSupplier);
router.delete('/suppliers/:id', authenticate, requireSuperAdmin, SupplierController.deleteSupplier);

// 9. Customers Directory
router.get('/customers/admin', authenticate, requireSuperAdmin, CustomerController.getCustomers);

// 10. Returns & Exchanges
router.post('/exchanges/request', ExchangeController.submitExchangeRequest);
router.get('/exchanges/admin', authenticate, requireSuperAdmin, ExchangeController.getAdminExchanges);
router.put('/exchanges/admin/:id', authenticate, requireSuperAdmin, ExchangeController.updateExchangeStatus);

// 11. Audit Logs
router.get('/audit/logs', authenticate, requireSuperAdmin, AuditController.getLogs);

// 12. In-App Notifications
router.get('/notifications/customer', NotificationController.getCustomerNotifications);
router.post('/notifications/broadcast', authenticate, requireSuperAdmin, NotificationController.sendBroadcastNotification);
router.get('/notifications', authenticate, NotificationController.getMyNotifications);
router.put('/notifications/:id/read', authenticate, NotificationController.markAsRead);
router.put('/notifications/read-all', authenticate, NotificationController.markAllAsRead);

// 13. Coupons Management & Validation
router.post('/coupons/validate', CouponController.validateCoupon);
router.get('/coupons', authenticate, requireSuperAdmin, CouponController.getAllCoupons);
router.post('/coupons', authenticate, requireSuperAdmin, CouponController.createCoupon);
router.put('/coupons/:id', authenticate, requireSuperAdmin, CouponController.updateCoupon);
router.delete('/coupons/:id', authenticate, requireSuperAdmin, CouponController.deleteCoupon);

// 14. Categories Dynamic Management (Super Admin & Public)
router.get('/categories', CategoryController.getCategories);
router.post('/categories', authenticate, requireSuperAdmin, CategoryController.createCategory);
router.put('/categories/:id', authenticate, requireSuperAdmin, CategoryController.updateCategory);
router.delete('/categories/:id', authenticate, requireSuperAdmin, CategoryController.deleteCategory);

// 15. Reviews & Social Proof
router.get('/products/:id/reviews', ReviewController.getProductReviews);
router.post('/products/:id/reviews', ReviewController.submitReview);
router.get('/reviews/testimonials', ReviewController.getLandingTestimonials);

// 16. Abandoned Cart Recovery (Exact 60 Min)
router.post('/cart/sync', CartController.syncCart);
router.get('/cart/recover/:token', CartController.recoverCart);

// 17. Curated Boutiques Dynamic Management (Public & Admin)
router.get('/boutiques', BoutiqueController.getBoutiques);
router.post('/boutiques', authenticate, requireSuperAdmin, BoutiqueController.createBoutique);
router.put('/boutiques/:id', authenticate, requireSuperAdmin, BoutiqueController.updateBoutique);
router.delete('/boutiques/:id', authenticate, requireSuperAdmin, BoutiqueController.deleteBoutique);

// 18. Hero Page Carousel & Event Sliders Dynamic Management (Public & Admin)
router.get('/hero-slides', HeroController.getHeroSlides);
router.post('/hero-slides', authenticate, requireSuperAdmin, HeroController.createHeroSlide);
router.put('/hero-slides/:id', authenticate, requireSuperAdmin, HeroController.updateHeroSlide);
router.delete('/hero-slides/:id', authenticate, requireSuperAdmin, HeroController.deleteHeroSlide);

// 19. System Data Persistence & Disaster Recovery (Render protection)
router.get('/system/status', authenticate, requireSuperAdmin, SystemController.getDatabaseStatus);
router.post('/system/test-db-uri', authenticate, requireSuperAdmin, SystemController.testDatabaseUri);
router.post('/system/switch-db-uri', authenticate, requireSuperAdmin, SystemController.switchDatabaseUri);
router.get('/system/backup', authenticate, requireSuperAdmin, SystemController.exportBackup);
router.post('/system/restore', authenticate, requireSuperAdmin, SystemController.restoreBackup);
router.post('/system/auto-restore', SystemController.autoRestore);

export default router;

