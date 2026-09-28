import type { ICategory, IBoutique, IHeroSlide } from '../types';

const API_BASE = '/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('nivora_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('nivora_token', token);
    } else {
      localStorage.removeItem('nivora_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = new Error(data.error || `HTTP error ${response.status}`);
      (err as any).status = response.status;
      (err as any).data = data;
      throw err;
    }

    return data;
  }

  // Health & Setup
  public getSetupStatus() {
    return this.request<{ needsSetup: boolean; brandName: string }>('/auth/setup-status');
  }

  public initialSetup(payload: any) {
    return this.request('/auth/initial-setup', { method: 'POST', body: JSON.stringify(payload) });
  }

  // Auth
  public login(credentials: { email: string; password: string; role?: string }) {
    return this.request<{ token: string; user: any; reseller?: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  public applyReseller(application: any) {
    return this.request('/auth/apply-reseller', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  public getMe() {
    return this.request<{ user: any; reseller?: any }>('/auth/me');
  }

  public updateProfile(updates: any) {
    return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(updates) });
  }

  public changePassword(payload: any) {
    return this.request('/auth/change-password', { method: 'PUT', body: JSON.stringify(payload) });
  }

  // Products
  public getPublicProducts(params: Record<string, string | number | boolean> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v));
    });
    return this.request<{ total: number; products: any[] }>(`/products?${query.toString()}`);
  }

  public getPublicProductBySlug(slug: string) {
    return this.request<{ product: any; related: any[] }>(`/products/slug/${slug}`);
  }

  public getAdminProducts() {
    return this.request<{ total: number; products: any[] }>('/products/admin/all');
  }

  public createProduct(product: any) {
    return this.request('/products/admin', { method: 'POST', body: JSON.stringify(product) });
  }

  public updateProduct(id: string, updates: any) {
    return this.request(`/products/admin/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  }

  public archiveProduct(id: string) {
    return this.request(`/products/admin/${id}`, { method: 'DELETE' });
  }

  public deleteProduct(id: string) {
    return this.request(`/products/admin/${id}`, { method: 'DELETE' });
  }

  public toggleProductStock(id: string) {
    return this.request(`/products/admin/${id}/toggle-stock`, { method: 'PATCH' });
  }

  // Orders
  public createOrder(orderPayload: any) {
    return this.request<{ message: string; order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  }

  public trackOrder(orderNumber: string, phone: string) {
    return this.request<{ order: any }>('/orders/track', {
      method: 'POST',
      body: JSON.stringify({ orderNumber, phone }),
    });
  }

  public getResellerOrders() {
    return this.request<{ total: number; orders: any[] }>('/orders/reseller');
  }

  public updateOrderStatusByReseller(orderId: string, newStatus: string, reason?: string) {
    return this.request(`/orders/reseller/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ newStatus, reason }),
    });
  }

  public getAdminOrders(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ total: number; orders: any[] }>(`/orders/admin/all?${query}`);
  }

  public adminEmergencyStatusOverride(orderId: string, newStatus: string, emergencyReason: string) {
    return this.request(`/orders/admin/${orderId}/emergency-override`, {
      method: 'PUT',
      body: JSON.stringify({ newStatus, emergencyReason }),
    });
  }

  // Resellers
  public getResellerStats() {
    return this.request<any>('/resellers/me/stats');
  }

  public getResellerCustomers() {
    return this.request<{ total: number; customers: any[] }>('/resellers/me/customers');
  }

  public resignReseller(reason: string) {
    return this.request('/resellers/me/resign', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public getAdminResellers(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ total: number; resellers: any[] }>(`/resellers/admin/all?${query}`);
  }

  public getResellerPerformance() {
    return this.request<{ performance: any[] }>('/resellers/admin/performance');
  }

  public approveReseller(id: string, customCode?: string) {
    return this.request(`/resellers/admin/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ customCode }),
    });
  }

  public rejectReseller(id: string, reason?: string) {
    return this.request(`/resellers/admin/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  public suspendReseller(id: string, reason?: string) {
    return this.request(`/resellers/admin/${id}/suspend`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  public reactivateReseller(id: string) {
    return this.request(`/resellers/admin/${id}/reactivate`, { method: 'PUT' });
  }

  public deleteReseller(id: string) {
    return this.request(`/resellers/admin/${id}`, { method: 'DELETE' });
  }

  // Finance
  public getCommissions(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/finance/commissions?${query}`);
  }

  public getBonuses() {
    return this.request<any>('/finance/bonuses');
  }

  public getPayouts() {
    return this.request<any>('/finance/payouts');
  }

  public createPayout(payload: any) {
    return this.request('/finance/payouts', { method: 'POST', body: JSON.stringify(payload) });
  }

  public getFinancialAnalytics() {
    return this.request<any>('/finance/admin/analytics');
  }

  // Settings
  public getPublicSettings() {
    return this.request<any>('/settings/public');
  }

  public getAdminSettings() {
    return this.request<any>('/settings/admin');
  }

  public updateSettings(settings: any) {
    return this.request('/settings/admin', { method: 'PUT', body: JSON.stringify(settings) });
  }

  // Suppliers
  public getSuppliers() {
    return this.request<{ suppliers: any[] }>('/suppliers');
  }

  public createSupplier(supplier: any) {
    return this.request('/suppliers', { method: 'POST', body: JSON.stringify(supplier) });
  }

  public updateSupplier(id: string, updates: any) {
    return this.request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  }

  public deleteSupplier(id: string) {
    return this.request(`/suppliers/${id}`, { method: 'DELETE' });
  }

  // Coupons
  public validateCoupon(code: string, subtotal: number) {
    return this.request<{
      valid: boolean;
      code: string;
      type: 'percentage' | 'fixed';
      amount: number;
      discount: number;
      isFullDiscount?: boolean;
      message: string;
    }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  }

  public getAdminCoupons() {
    return this.request<{ coupons: any[] }>('/coupons');
  }

  public createCoupon(payload: any) {
    return this.request('/coupons', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public updateCoupon(id: string, updates: any) {
    return this.request(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public deleteCoupon(id: string) {
    return this.request(`/coupons/${id}`, { method: 'DELETE' });
  }

  // Customers
  public getAdminCustomers(search?: string) {
    return this.request<{ total: number; customers: any[] }>(
      `/customers/admin${search ? `?search=${encodeURIComponent(search)}` : ''}`
    );
  }

  // Exchanges
  public submitExchangeRequest(payload: any) {
    return this.request('/exchanges/request', { method: 'POST', body: JSON.stringify(payload) });
  }

  public getAdminExchanges() {
    return this.request<{ exchanges: any[]; returns: any[] }>('/exchanges/admin');
  }

  public updateExchangeStatus(id: string, status: string, adminNotes?: string) {
    return this.request(`/exchanges/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  // Audit Logs
  public getAuditLogs(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ total: number; logs: any[] }>(`/audit/logs?${query}`);
  }

  // Notifications
  public getNotifications() {
    return this.request<{ notifications: any[]; unreadCount: number }>('/notifications');
  }

  public getCustomerNotifications() {
    return this.request<{ notifications: any[]; unreadCount: number }>('/notifications/customer');
  }

  public broadcastNotification(title: string, message: string) {
    return this.request<{ message: string; notification: any }>('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message }),
    });
  }

  public markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  public markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  // Categories (Dynamic Category Management)
  public getCategories() {
    return this.request<{ categories: ICategory[] }>('/categories');
  }

  public createCategory(payload: { name: string; description?: string }) {
    return this.request<{ message: string; category: ICategory }>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public updateCategory(id: string, payload: { name?: string; description?: string }) {
    return this.request<{ message: string; category: ICategory }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public deleteCategory(id: string) {
    return this.request<{ message: string; categoryId: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Curated Boutiques
  public getBoutiques() {
    return this.request<IBoutique[]>('/boutiques');
  }

  public createBoutique(payload: Partial<IBoutique>) {
    return this.request<IBoutique>('/boutiques', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public updateBoutique(id: string, payload: Partial<IBoutique>) {
    return this.request<IBoutique>(`/boutiques/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public deleteBoutique(id: string) {
    return this.request<{ message: string; id: string }>(`/boutiques/${id}`, {
      method: 'DELETE',
    });
  }

  // Hero Page & Seasonal Event Slides
  public getHeroSlides() {
    return this.request<IHeroSlide[]>('/hero-slides');
  }

  public createHeroSlide(payload: Partial<IHeroSlide>) {
    return this.request<IHeroSlide>('/hero-slides', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public updateHeroSlide(id: string, payload: Partial<IHeroSlide>) {
    return this.request<IHeroSlide>(`/hero-slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public deleteHeroSlide(id: string) {
    return this.request<{ message: string; id: string }>(`/hero-slides/${id}`, {
      method: 'DELETE',
    });
  }

  // System Persistence & Backup Recovery (Render Protection)
  public getSystemStatus() {
    return this.request<{
      engine: string;
      isConnected: boolean;
      isAtlasConfigured: boolean;
      host?: string | null;
      lastError?: string | null;
      errorDetail?: string | null;
      lastAttemptAt?: string | null;
      counts: Record<string, number>;
      message: string;
    }>('/system/status');
  }

  public testDatabaseUri(uri: string) {
    return this.request<{
      success: boolean;
      host?: string;
      dbName?: string;
      collections?: string[];
      message: string;
      error?: string;
      diagnosis?: string;
    }>('/system/test-db-uri', {
      method: 'POST',
      body: JSON.stringify({ uri }),
    });
  }

  public switchDatabaseUri(uri: string) {
    return this.request<{
      success: boolean;
      message: string;
      counts?: Record<string, number>;
      error?: string;
    }>('/system/switch-db-uri', {
      method: 'POST',
      body: JSON.stringify({ uri }),
    });
  }

  public exportBackup() {
    return this.request<any>('/system/backup');
  }

  public restoreBackup(data: any) {
    return this.request<{ message: string; success: boolean; counts: Record<string, number> }>('/system/restore', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public autoRestoreDatabase(data: any, force = false) {
    return this.request<{ restored: boolean; message: string; counts?: Record<string, number> }>(
      `/system/auto-restore${force ? '?force=true' : ''}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }
}

export const api = new ApiService();
