import { ENV } from '../config/env.js';
import type { IOrder, IReseller } from '../../src/types/index.js';

export class WhatsAppService {
  /**
   * Formats the order text according to specification
   */
  public static formatOrderMessage(order: IOrder, reseller?: IReseller | null): string {
    const itemsList = order.items
      .map(
        (item: any, idx: number) =>
          `${idx + 1}. ${item.name} (${item.quantity}x) [${item.size || 'Standard'}, ${item.color || 'Default'}] - Rs. ${item.price.toLocaleString()}`
      )
      .join('\n');

    const resellerInfo = reseller
      ? `Reseller: ${reseller.fullName}\nCode: ${reseller.code}\nReferral Source: ${order.referralSource || 'Direct Link'}`
      : 'Direct Customer Order (No Reseller)';

    return `*NEW ORDER ALERT - ${order.orderNumber}*

*Customer Details:*
Name: ${order.customer.fullName}
Phone: ${order.customer.phone}
WhatsApp: ${order.customer.whatsapp}
Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.province}

*Ordered Items:*
${itemsList}

*Financial Breakdown:*
Subtotal: Rs. ${order.subtotal.toLocaleString()}
Delivery (Courier COD): Rs. ${order.deliveryFee.toLocaleString()}
Extra Service Charge: Rs. ${order.perThousandCharge.toLocaleString()}
${order.discount ? `Discount: -Rs. ${order.discount.toLocaleString()}\n` : ''}*Total Amount:* Rs. ${order.total.toLocaleString()}
Payment Method: ${order.paymentMethod}
Order Status: ${order.orderStatus}

*Attribution:*
${resellerInfo}

Time: ${new Date(order.createdAt).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}`;
  }

  /**
   * Generates a prefilled WhatsApp Web URL for +923235277238
   */
  public static generatePrefilledWhatsAppLink(order: IOrder, reseller?: IReseller | null, recipientPhone?: string): string {
    const recipient = recipientPhone || '+923235277238';
    const cleanPhone = recipient.replace(/[^0-9]/g, '');
    const message = this.formatOrderMessage(order, reseller);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Generates direct WhatsApp order notification link for manual processing
   */
  public static async dispatchOrderNotification(
    order: IOrder,
    reseller?: IReseller | null
  ): Promise<{ success: boolean; method: 'prefilled_link'; link: string }> {
    const prefilledLink = this.generatePrefilledWhatsAppLink(order, reseller);
    console.log(`[WhatsApp] Order ${order.orderNumber} notification link prepared for +923235277238`);
    return {
      success: true,
      method: 'prefilled_link',
      link: prefilledLink,
    };
  }
}
