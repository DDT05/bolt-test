import React from 'react';
import { CheckoutButton } from '../components/CheckoutButton';
import { products } from '../stripe-config';
import { Check } from 'lucide-react';

export function Checkout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Start creating professional product videos today with our powerful AI-powered platform
          </p>
        </div>

        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{products.pro.name}</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Most Popular
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">$29.99</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {products.pro.description.split('•').map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-600">{feature.trim()}</span>
                </li>
              ))}
            </ul>

            <CheckoutButton
              product={products.pro}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium text-lg"
            />
          </div>

          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span>✓ 14-day money-back guarantee</span>
              <span>•</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}