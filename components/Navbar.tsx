'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import UserMenu from './auth/UserMenu';
import AuthModal from './auth/AuthModal';
import { Sparkles } from 'lucide-react';

const Navbar: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const { user, loading } = useAuth();

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Prompt Master
              </h1>
            </Link>

            {/* Auth Section */}
            <div>
              {loading ? (
                <div className="w-20 h-10 bg-gray-800 rounded-lg animate-pulse" />
              ) : user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Navbar;
