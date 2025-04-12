import React, { useState } from 'react';
import { createCheckoutSession } from '../lib/stripe';
import type { ProductDetails } from '../stripe-config';
import { useAuth } from '../hooks/useAuth';

interface CheckoutButtonProps {
  product: ProductDetails;
  className?: string;
}

export function CheckoutButton({ product, className = '' }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();

  const handleCheckout = async () => {
    try {
      setLoading(true);

      if (!user) {
        await signIn();
        return;
      }

      const checkoutUrl = await createCheckoutSession(product.priceId, product.mode);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Processing...' : 'Subscribe Now'}
    </button>
  );
}