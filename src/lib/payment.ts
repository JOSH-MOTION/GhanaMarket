import { supabase } from './supabase';
import type { PaymentMethod, PaymentProvider } from './database.types';

export interface InitiatePaymentParams {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  provider: PaymentProvider;
  phoneNumber?: string;
  email: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  authorizationUrl?: string;
  reference?: string;
  instructions?: string;
  error?: string;
}

export async function initiatePayment(params: InitiatePaymentParams): Promise<PaymentResponse> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-initiate`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Payment initiation failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

export async function verifyPayment(reference: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-verify`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

export async function releaseEscrow(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/escrow-release`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      throw new Error('Escrow release failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Escrow release error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Release failed',
    };
  }
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    mtn_momo: 'MTN Mobile Money',
    vodafone_cash: 'Vodafone Cash',
    airteltigo_money: 'AirtelTigo Money',
    card: 'Debit/Credit Card',
  };
  return labels[method];
}

export function formatAmount(amount: number, currency: string = 'GHS'): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
