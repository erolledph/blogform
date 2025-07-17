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
  Folder,
  LogOut,
  Menu,
} from 'lucide-react';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { name: 'Manage Content', href: '/dashboard/manage', icon: FileText },
  { name: 'Create Content', href: '/dashboard/create', icon: Plus },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'File Storage', href: '/dashboard/storage', icon: Folder },
  { name: 'Firebase Info', href: '/dashboard/firebase-info', icon: Database },
  { name: 'Tips', href: '/dashboard/tips', icon: Lightbulb },
  { name: 'Documentation', href: '/dashboard/documentation', icon: BookOpen },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, closeSidebar }) {
  const location = useLocation();
  const { logout } = useAuth();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <nav 
      className={`sidebar ${sidebarOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-header">
        <button 
          className="hamburger-toggle"
          onClick={toggleExpanded}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Menu className="h-5 w-5" />
        </button>
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
                title={!isExpanded && !isHovered ? item.name : ''}
                aria-label={item.name}
              >
                <item.icon className="nav-link-icon" />
                <span className="nav-link-text">{item.name}</span>
                {!isExpanded && !isHovered && (
                  <div className="nav-tooltip">{item.name}</div>
                )}
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
          title={!isExpanded && !isHovered ? 'Logout' : ''}
          aria-label="Logout"
        >
          <LogOut className="logout-button-icon" />
          <span className="logout-button-text">Logout</span>
          {!isExpanded && !isHovered && (
            <div className="nav-tooltip">Logout</div>
          )}
        </button>
      </div>
    </nav>
  );
}