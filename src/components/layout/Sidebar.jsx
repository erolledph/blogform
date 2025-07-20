import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Database,
  BarChart3,
  Settings,
  Folder,
  Package,
  Plus,
  Lightbulb,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  // Create New menu will be inserted here
  { name: 'Manage Content', href: '/dashboard/manage', icon: FileText },
  { name: 'Manage Products', href: '/dashboard/manage-products', icon: Package },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'File Storage', href: '/dashboard/storage', icon: Folder },
  { name: 'Firebase Info', href: '/dashboard/firebase-info', icon: Database },
];

const createMenuItems = [
  { name: 'Create Content', href: '/dashboard/create', icon: FileText },
  { name: 'Add Product', href: '/dashboard/create-product', icon: Package },
];

const settingsMenuItems = [
  { name: 'Account Settings', href: '/dashboard/account-settings', icon: Settings },
  { name: 'Tips', href: '/dashboard/tips', icon: Lightbulb },
  { name: 'Documentation', href: '/dashboard/documentation', icon: BookOpen },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, closeSidebar }) {
  const location = useLocation();
  const { logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  const handleLinkClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 1023) {
      closeSidebar();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleCreateMenu = () => {
    setCreateMenuOpen(!createMenuOpen);
  };

  const toggleSettingsMenu = () => {
    setSettingsMenuOpen(!settingsMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav 
      className={`sidebar ${sidebarOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}
    >
      <div className="sidebar-header">
        <button 
          className="hamburger-toggle"
          onClick={toggleExpanded}
          aria-label="Toggle sidebar"
        >
          {isExpanded ? <ChevronLeft /> : <Menu />}
        </button>
        <div className="logo">Admin CMS</div>
        <button className="hamburger" onClick={closeSidebar} aria-label="Close sidebar">
          <ChevronLeft />
        </button>
      </div>
      
      <ul className="nav-menu">
        {/* Overview */}
        <li className="nav-item">
          <Link
            to="/dashboard/overview"
            onClick={handleLinkClick}
            className={`nav-link ${location.pathname === '/dashboard/overview' || location.pathname === '/dashboard' ? 'active' : ''}`}
            title={!isExpanded && !sidebarOpen ? 'Overview' : ''}
            aria-label="Overview"
          >
            <LayoutDashboard className="nav-link-icon" />
            <span className="nav-link-text">Overview</span>
            {!isExpanded && !sidebarOpen && (
              <div className="nav-tooltip">Overview</div>
            )}
          </Link>
        </li>
        
        {/* Create New Mega Menu - moved up */}
        <li className="nav-item">
          <button
            onClick={toggleCreateMenu}
            className={`nav-link w-full text-left ${createMenuOpen ? 'active' : ''}`}
            title={!isExpanded && !sidebarOpen ? 'Create New' : ''}
            aria-label="Create New"
          >
            <Plus className="nav-link-icon" />
            <span className="nav-link-text">Create New</span>
            <span className="nav-link-text ml-auto">
              <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${createMenuOpen ? 'rotate-90' : ''}`} />
            </span>
            {!isExpanded && !sidebarOpen && (
              <div className="nav-tooltip">Create New</div>
            )}
          </button>
          
          {/* Submenu */}
          {createMenuOpen && (isExpanded || sidebarOpen) && (
            <ul className="ml-6 mt-2 space-y-1">
              {createMenuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={handleLinkClick}
                    className={`nav-link text-sm py-2 ${location.pathname === item.href ? 'active' : ''}`}
                  >
                    <item.icon className="nav-link-icon h-4 w-4" />
                    <span className="nav-link-text">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>

        {/* Rest of navigation items (excluding Overview since it's already rendered above) */}
        {navigation.slice(1).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <li key={item.name} className="nav-item">
              <Link
                to={item.href}
                onClick={handleLinkClick}
                className={`nav-link ${isActive ? 'active' : ''}`}
                title={!isExpanded && !sidebarOpen ? item.name : ''}
                aria-label={item.name}
              >
                <item.icon className="nav-link-icon" />
                <span className="nav-link-text">{item.name}</span>
                {!isExpanded && !sidebarOpen && (
                  <div className="nav-tooltip">{item.name}</div>
                )}
              </Link>
            </li>
          );
        })}

        {/* Settings Mega Menu */}
        <li className="nav-item">
          <button
            onClick={toggleSettingsMenu}
            className={`nav-link w-full text-left ${settingsMenuOpen ? 'active' : ''}`}
            title={!isExpanded && !sidebarOpen ? 'Settings' : ''}
            aria-label="Settings"
          >
            <Settings className="nav-link-icon" />
            <span className="nav-link-text">Settings</span>
            <span className="nav-link-text ml-auto">
              <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${settingsMenuOpen ? 'rotate-90' : ''}`} />
            </span>
            {!isExpanded && !sidebarOpen && (
              <div className="nav-tooltip">Settings</div>
            )}
          </button>
          
          {/* Settings Submenu */}
          {settingsMenuOpen && (isExpanded || sidebarOpen) && (
            <ul className="ml-6 mt-2 space-y-1">
              {settingsMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      className={`nav-link text-sm py-2 ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className="nav-link-icon h-4 w-4" />
                      <span className="nav-link-text">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      </ul>

      {/* Logout Section */}
      <div className="logout-section">
        <button
          onClick={handleLogout}
          className="logout-button"
          title={!isExpanded && !sidebarOpen ? 'Logout' : ''}
          aria-label="Logout"
        >
          <LogOut className="logout-button-icon" />
          <span className="logout-button-text">Logout</span>
          {!isExpanded && !sidebarOpen && (
            <div className="nav-tooltip">Logout</div>
          )}
        </button>
      </div>
    </nav>
  );
}