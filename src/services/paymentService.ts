const getServiceApiUrl = () => { const envUrl = import.meta.env.VITE_API_URL; return (envUrl && envUrl.trim() !== '') ? envUrl.replace(/\/$/, '') : ''; }; const API_URL = getServiceApiUrl();

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentSuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentConfig {
  name: string;
  description: string;
  amount?: number;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

class PaymentService {
  private scriptLoaded = false;

  /**
   * Loads the Razorpay SDK script dynamically
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        this.scriptLoaded = true;
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Fetches the Razorpay Key ID from the environment or server
   */
  async getRazorpayKey(): Promise<string> {
    // Prefer client-side env variable if provided (useful for explicit test mode)
    const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (envKey) {
      if (envKey.startsWith('rzp_test_')) {
        console.log("LOG: [Payment] Using Razorpay Test Key from Environment ✅");
      }
      return envKey;
    }

    const res = await fetch(`${API_URL}/api/razorpay-key`);
    if (!res.ok) throw new Error('Could not fetch Razorpay configuration from server');
    const data = await res.json();
    return data.keyId;
  }

  /**
   * Creates a new order on the backend
   */
  async createOrder(token: string): Promise<RazorpayOrder> {
    const res = await fetch(`${API_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Order creation failed with status ${res.status}`)    }

    const data = await res.json();
    if (!data.success || !data.order) {
      throw new Error(data.error || 'Failed to create order on server');
    }

    return data.order;
  }

  /**
   * Verifies the payment on the backend
   */
  async verifyPayment(token: string, response: PaymentSuccessResponse): Promise<any> {
    const res = await fetch(`${API_URL}/api/payment/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(response),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Payment verification failed');
    }

    return await res.json();
  }

  /**
   * Main entry point to initiate a payment flow
   */
  async initiatePayment(token: string, config: PaymentConfig): Promise<PaymentSuccessResponse> {
    const isScriptLoaded = await this.loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    const key = await this.getRazorpayKey();
    if (!key) {
      throw new Error('Payment system is not configured. Please contact support.');
    }

    const order = await this.createOrder(token);

    return new Promise((resolve, reject) => {
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: config.name,
        description: config.description,
        order_id: order.id,
        handler: (response: PaymentSuccessResponse) => resolve(response),
        prefill: config.prefill,
        theme: config.theme || { color: '#1e3a34' },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled by user')),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        reject(new Error(response.error.description || 'Payment failed'));
      });
      rzp.open();
    });
  }
}

export const paymentService = new PaymentService();
