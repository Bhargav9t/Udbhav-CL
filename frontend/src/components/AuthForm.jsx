import React, { useState } from 'react';
import { signIn, signUp } from '../lib/auth';

export default function AuthForm({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFullName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        if (onSuccess) onSuccess();
      } else {
        if (!fullName.trim()) {
          throw new Error("Full Name is required for registration.");
        }
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setSuccessMsg("Registration successful! Please check your email to verify your account.");
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        
        <h2 className="text-3xl font-bold text-center text-white mb-8 tracking-wide">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-100 text-sm">
            <p><strong>Error:</strong> {errorMsg}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-100 text-sm">
            <p>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name - Only for Sign Up */}
          {!isLogin && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/30 transition-all"
                placeholder="Jane Doe"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/30 transition-all"
              placeholder="jane@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/30 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white text-purple-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-white font-bold hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
        
      </div>
    </div>
  );
}
