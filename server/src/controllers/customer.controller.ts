import { Response } from 'express';
import { store } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class CustomerController {
  public static async getCustomers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { search } = req.query;
    let list = [...store.customers];

    if (search) {
      const q = String(search).toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    // Attach order history previews
    const enriched = list.map((customer) => {
      const orders = store.orders.filter(
        (o) => o.customer.phone.replace(/[^0-9]/g, '') === customer.phone.replace(/[^0-9]/g, '')
      );
      return {
        ...customer,
        ordersCount: orders.length,
        deliveredCount: orders.filter((o) => o.orderStatus === 'DELIVERED').length,
        recentOrders: orders.slice(0, 3).map((o) => ({
          orderNumber: o.orderNumber,
          total: o.total,
          status: o.orderStatus,
          date: o.createdAt,
        })),
      };
    });

    res.json({
      total: enriched.length,
      customers: enriched,
    });
  }
}
