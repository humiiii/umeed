'use client';

import { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, Lock, Loader } from 'lucide-react';

export default function LoginForm({ isConfigured }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter a passcode.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to dashboard page
        window.location.href = '/compose';
      } else {
        setError(data.error || 'Invalid passcode. Please try again.');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-header-group">
        <h2 className="login-logo">Umeed</h2>
        <p className="login-subtitle">Enter your passcode to sign in</p>
      </div>

      {!isConfigured && (
        <div className="alert alert-warning" id="config-warning">
          <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Warning:</strong> ADMIN_PASSWORD environment variable is not configured.
            Please add it to your <code>.env.local</code> file to enable sign-in.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-input-group">
          <label className="login-input-label" htmlFor="password-field">
            Passcode
          </label>
          <div className="login-input-wrapper">
            <input
              className="login-input"
              type={showPassword ? 'text' : 'password'}
              id="password-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || !isConfigured}
            />
            <button
              className="password-toggle-btn"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
              disabled={!isConfigured}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" id="login-error">
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <button
          className="btn btn-primary btn-full"
          type="submit"
          disabled={isLoading || !isConfigured}
          id="login-btn"
        >
          {isLoading ? (
            <>
              <Loader size={16} className="spinner" />
              Verifying...
            </>
          ) : (
            <>
              <Lock size={14} />
              Unlock App
            </>
          )}
        </button>
      </form>
    </div>
  );
}
