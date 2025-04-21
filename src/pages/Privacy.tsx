import React from 'react';
import { Play } from 'lucide-react';

export default function Privacy() {
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
          <h1 className="text-4xl font-bold text-purple-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-lg text-purple-800 mb-6">Last updated: March 18, 2024</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">1. Introduction</h2>
              <p className="mb-4">
                VideoSnap AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-purple-800 mb-3">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Email address</li>
                <li>Payment information</li>
                <li>Usage data</li>
                <li>Images and videos you upload</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information for:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Providing and maintaining our service</li>
                <li>Processing your payments</li>
                <li>Improving our service</li>
                <li>Communicating with you</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">4. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at:{' '}
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