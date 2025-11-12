import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError('DISPLAY NAME IS REQUIRED');
          setLoading(false);
          return;
        }
        if (displayName.length < 2 || displayName.length > 30) {
          setError('DISPLAY NAME MUST BE 2-30 CHARACTERS');
          setLoading(false);
          return;
        }
        await signup(email, password, displayName.trim());
      }
    } catch (err: any) {
      console.error('Authentication error:', err);

      // Map Firebase error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'EMAIL ALREADY IN USE',
        'auth/weak-password': 'PASSWORD TOO WEAK (MIN 6 CHARACTERS)',
        'auth/invalid-email': 'INVALID EMAIL ADDRESS',
        'auth/user-not-found': 'USER NOT FOUND',
        'auth/wrong-password': 'INCORRECT PASSWORD',
        'auth/too-many-requests': 'TOO MANY ATTEMPTS, TRY AGAIN LATER',
      };

      setError(errorMessages[err.code] || 'AUTHENTICATION FAILED');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-mono font-bold text-green-400 uppercase tracking-wider mb-2">
            LITTORAL COMMANDER
          </h1>
          <p className="text-gray-400 font-mono tracking-wide uppercase text-sm">
            CAMPAIGN SYSTEM
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800 border-2 border-green-600 rounded-lg p-6">
          <h2 className="text-2xl font-mono font-bold text-green-400 uppercase tracking-wider mb-6 text-center">
            {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (signup only) */}
            {!isLogin && (
              <div>
                <label className="block font-mono text-sm text-gray-300 uppercase tracking-wide mb-2">
                  DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-green-400 focus:outline-none focus:border-green-500"
                  placeholder="YOUR NAME"
                  required={!isLogin}
                  minLength={2}
                  maxLength={30}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block font-mono text-sm text-gray-300 uppercase tracking-wide mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-green-400 focus:outline-none focus:border-green-500"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-mono text-sm text-gray-300 uppercase tracking-wide mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-green-400 focus:outline-none focus:border-green-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 border border-red-600 rounded p-3">
                <p className="font-mono text-sm text-red-200 uppercase tracking-wide">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-mono font-bold py-3 rounded uppercase tracking-wider transition-colors"
            >
              {loading ? 'PROCESSING...' : isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="font-mono text-sm text-gray-400 mb-2">
              {isLogin ? "DON'T HAVE AN ACCOUNT?" : 'ALREADY HAVE AN ACCOUNT?'}
            </p>
            <button
              type="button"
              onClick={toggleMode}
              className="font-mono text-green-400 hover:text-green-300 uppercase tracking-wide text-sm font-bold"
            >
              {isLogin ? 'CREATE ACCOUNT' : 'LOGIN'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-gray-500 uppercase tracking-wide">
            INDO-PACIFIC THEATER OPERATIONS
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
