'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isCompose = pathname === '/' || pathname === '/compose';
  const isScheduled = pathname === '/scheduled';

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

      {/* Right: Theme toggle */}
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
