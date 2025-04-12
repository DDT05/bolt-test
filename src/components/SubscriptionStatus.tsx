import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentSubscription, getProductByPriceId } from '../lib/stripe';

export function SubscriptionStatus() {
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription'],
    queryFn: getCurrentSubscription,
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading subscription status</div>;
  }

  if (!subscription || !subscription.price_id) {
    return <div className="text-gray-600">No active subscription</div>;
  }

  const product = getProductByPriceId(subscription.price_id);

  if (!product) {
    return <div className="text-gray-600">Unknown subscription</div>;
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-green-600">●</span>
      <span>{product.name}</span>
    </div>
  );
}