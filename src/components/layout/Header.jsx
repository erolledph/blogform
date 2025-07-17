import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Header({ onMenuClick }) {
  const { currentUser } = useAuth();

  return (
    <header className="bg-white border-b border-border px-4 sm:px-6 py-4 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors duration-200"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Page title for mobile */}
          <h1 className="lg:hidden ml-4 text-lg font-semibold text-foreground">
            Admin Dashboard
          </h1>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Notifications */}
          <button 
            className="p-2 rounded-md hover:bg-muted transition-colors duration-200 relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </button>

          {/* User menu */}
          <Link 
            to="/dashboard/settings"
            className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-md hover:bg-muted transition-colors duration-200"
            title="User Settings"
          >
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-foreground">
                {currentUser?.email?.split('@')[0] || 'Admin'}
              </div>
              <div className="text-xs text-muted-foreground">Administrator</div>
            </div>
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}