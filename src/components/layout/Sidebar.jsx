import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  BookOpen, 
  Lightbulb,
  Database,
  BarChart3,
  Settings,
  LogOut, 
} from 'lucide-react';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { name: 'Manage Content', href: '/dashboard/manage', icon: FileText },
  { name: 'Create Content', href: '/dashboard/create', icon: Plus },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Firebase Info', href: '/dashboard/firebase-info', icon: Database },
  { name: 'Tips', href: '/dashboard/tips', icon: Lightbulb },
  { name: 'Documentation', href: '/dashboard/documentation', icon: BookOpen },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, closeSidebar }) {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 1023) {
      closeSidebar();
    }
  };

  return (
    <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">Admin CMS</div>
        <button className="hamburger" onClick={closeSidebar}>
          ×
        </button>
      </div>
      
      <ul className="nav-menu">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <li key={item.name} className="nav-item">
              <Link
                to={item.href}
                onClick={handleLinkClick}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <item.icon className="inline-block mr-4 h-5 w-5" />
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout button */}
      <div className="logout-section">
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut className="inline-block mr-4 h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}