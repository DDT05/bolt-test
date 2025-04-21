import React from 'react';
import { Play } from 'lucide-react';

export default function Refund() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-purple-900 py-4 px-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center space-x-2">
            <Play className="text-purple-200" size={24} />
            <span className="text-white text-xl font-bold">VideoSnap AI</span>
          </a>
        </nav>
      </header>

      <main className="flex-grow bg-gradient-to-b from-purple-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-purple-900 mb-8">Refund Policy</h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-lg text-purple-800 mb-6">Last updated: March 18, 2024</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">1. Refund Eligibility</h2>
              <p className="mb-4">
                We offer a 14-day money-back guarantee on all our subscription plans. If you're not satisfied with our service, you can request a full refund within 14 days of your initial purchase.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">2. Refund Process</h2>
              <p className="mb-4">To request a refund:</p>
              <ol className="list-decimal pl-6 mb-4">
                <li>Contact our support team at contact.hebedai@gmail.com</li>
                <li>Provide your order number and reason for the refund</li>
                <li>Allow 5-10 business days for processing</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">3. Non-Refundable Items</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Usage beyond the 14-day period</li>
                <li>Custom development work</li>
                <li>API usage charges</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">4. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about our refund policy, please contact us at:{' '}
                <a href="mailto:contact.hebedai@gmail.com" className="text-purple-600 hover:text-purple-800">
                  contact.hebedai@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-purple-900 text-white py-6 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-purple-200">
            © 2024 VideoSnap AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}