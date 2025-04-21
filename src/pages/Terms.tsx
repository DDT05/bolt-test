import React from 'react';
import { Play } from 'lucide-react';

export default function Terms() {
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
          <h1 className="text-4xl font-bold text-purple-900 mb-8">Terms of Use</h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-lg text-purple-800 mb-6">Last updated: March 18, 2024</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using VideoSnap AI, you accept and agree to be bound by the terms and conditions of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">2. User Responsibilities</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>You must be at least 18 years old to use this service</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree not to upload any illegal or unauthorized content</li>
                <li>You must have rights to the content you upload</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">3. Intellectual Property</h2>
              <p className="mb-4">
                The service and its original content, features, and functionality are owned by VideoSnap AI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-900 mb-4">4. Contact</h2>
              <p className="mb-4">
                For any questions about these Terms, please contact us at:{' '}
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