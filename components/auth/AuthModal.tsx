'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type AuthView = 'login' | 'signup' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  if (!isOpen) return null;

  const handleSuccess = (): void => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentView === 'login' && 'Welcome Back'}
            {currentView === 'signup' && 'Create Account'}
            {currentView === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-gray-400 text-sm">
            {currentView === 'login' && 'Sign in to save and manage your prompts'}
            {currentView === 'signup' && 'Start creating amazing AI prompts'}
            {currentView === 'forgot' && 'We\'ll help you get back in'}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 pt-2">
          {currentView === 'login' && (
            <LoginForm
              onSwitchToSignup={() => setCurrentView('signup')}
              onSwitchToForgot={() => setCurrentView('forgot')}
              onSuccess={handleSuccess}
            />
          )}
          {currentView === 'signup' && (
            <SignupForm
              onSwitchToLogin={() => setCurrentView('login')}
              onSuccess={handleSuccess}
            />
          )}
          {currentView === 'forgot' && (
            <ForgotPasswordForm
              onBackToLogin={() => setCurrentView('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
