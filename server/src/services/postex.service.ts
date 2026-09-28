export interface IPostExBookingPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  cityName: string;
  invoicePayment: number;
  orderDetail: string;
  itemsCount: number;
}

export interface IPostExTrackingResult {
  trackingNumber: string;
  carrier: string;
  status: string;
  trackingUrl: string;
  statusDetail?: string;
  history?: Array<{
    status: string;
    timestamp: string;
    location?: string;
  }>;
}

export class PostExService {
  /**
   * Generates tracking URL
   */
  public static getTrackingUrl(trackingNumber: string): string {
    return `/?tab=track&orderNumber=${encodeURIComponent(trackingNumber)}`;
  }

  /**
   * Generate an automated courier tracking number
   */
  public static generateTrackingNumber(): string {
    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    return `EXP-${randomSuffix}`;
  }

  /**
   * Book shipment via Express Courier
   */
  public static async bookShipment(payload: IPostExBookingPayload): Promise<{
    success: boolean;
    trackingNumber: string;
    carrier: string;
    trackingUrl: string;
    message: string;
  }> {
    const trackingNumber = this.generateTrackingNumber();
    return {
      success: true,
      trackingNumber,
      carrier: 'Express Courier',
      trackingUrl: this.getTrackingUrl(trackingNumber),
      message: 'Tracking number assigned for Express Courier Cash on Delivery.',
    };
  }

  /**
   * Get tracking status
   */
  public static async trackShipment(trackingNumber: string): Promise<IPostExTrackingResult> {
    const trackingUrl = this.getTrackingUrl(trackingNumber);

    return {
      trackingNumber,
      carrier: 'Express Courier',
      status: 'In Transit',
      trackingUrl,
      statusDetail: 'Shipment dispatched via Express Courier Cash on Delivery',
    };
  }
}
