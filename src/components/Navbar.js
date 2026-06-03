'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isCompose = pathname === '/' || pathname === '/compose';
  const isScheduled = pathname === '/scheduled';

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Logout request failed:', err);
    }
  };

  // Render a minimal navbar on the login page (no navigation links, no logout)
  if (pathname === '/login') {
    return (
      <nav className="navbar" id="main-navbar">
        <div className="navbar-left">
          <span className="wordmark" id="wordmark">
            Umeed
          </span>
        </div>
        <div className="navbar-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            id="theme-toggle"
          >
            {theme === 'dark' ? (
              <Sun size={16} strokeWidth={2} />
            ) : (
              <Moon size={16} strokeWidth={2} />
            )}
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar" id="main-navbar">
      {/* Left: Wordmark */}
      <div className="navbar-left">
        <Link href="/compose" className="wordmark" id="wordmark">
          Umeed
        </Link>
      </div>

      {/* Center: Nav links */}
      <div className="navbar-center">
        <Link
          href="/compose"
          className={`nav-link ${isCompose ? 'active' : ''}`}
          id="nav-compose"
        >
          Compose
        </Link>
        <Link
          href="/scheduled"
          className={`nav-link ${isScheduled ? 'active' : ''}`}
          id="nav-scheduled"
        >
          Scheduled
        </Link>
      </div>

      {/* Right: Theme toggle & Logout */}
      <div className="navbar-right" style={{ display: 'flex', gap: '8px' }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle"
        >
          {theme === 'dark' ? (
            <Sun size={16} strokeWidth={2} />
          ) : (
            <Moon size={16} strokeWidth={2} />
          )}
        </button>

        <button
          className="theme-toggle"
          onClick={handleLogout}
          aria-label="Log out"
          id="logout-btn"
        >
          <LogOut size={16} strokeWidth={2} />
        </button>
      </div>
    </nav>
  );
}
