'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-400">
          <h3 className="font-semibold mb-1">Reset email sent!</h3>
          <p className="text-sm">
            Check your email for instructions to reset your password.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-300">
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-200 mb-1">
          Email
        </label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-white"
          placeholder="you@example.com"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">Sending...</span>
          </>
        ) : (
          'Send Reset Link'
        )}
      </button>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-purple-400 hover:text-purple-300 transition-colors"
          disabled={loading}
        >
          Back to Sign In
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
