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
  Package,
  ChevronDown,
  Edit,
  ShoppingBag,
  LogOut,
  Menu,
} from 'lucide-react';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { name: 'Manage Content', href: '/dashboard/manage', icon: FileText },
  { name: 'Manage Products', href: '/dashboard/manage-products', icon: Package },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'File Storage', href: '/dashboard/storage', icon: Folder },
  { name: 'Firebase Info', href: '/dashboard/firebase-info', icon: Database },
  { name: 'Tips', href: '/dashboard/tips', icon: Lightbulb },
  { name: 'Documentation', href: '/dashboard/documentation', icon: BookOpen },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const createMenuItems = [
  { name: 'Blog Post', href: '/dashboard/create', icon: Edit },
  { name: 'Product', href: '/dashboard/create-product', icon: ShoppingBag },
];
export default function Sidebar({ sidebarOpen, setSidebarOpen, closeSidebar }) {
  const location = useLocation();
  const { logout } = useAuth();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [createMenuOpen, setCreateMenuOpen] = React.useState(false);

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
        
        {/* Create New Mega Menu */}
        <li className="nav-item">
          <button
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className={`nav-link w-full text-left ${createMenuItems.some(item => location.pathname === item.href) ? 'active' : ''}`}
            title={!isExpanded && !isHovered ? 'Create New' : ''}
            aria-label="Create New"
          >
            <Plus className="nav-link-icon" />
            <span className="nav-link-text">Create New</span>
            <ChevronDown className={`nav-link-icon ml-auto transition-transform duration-200 ${createMenuOpen ? 'rotate-180' : ''}`} />
            {!isExpanded && !isHovered && (
              <div className="nav-tooltip">Create New</div>
            )}
          </button>
          
          {/* Submenu */}
          {createMenuOpen && (isExpanded || isHovered || sidebarOpen) && (
            <ul className="ml-8 mt-2 space-y-1">
              {createMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center py-2 px-3 text-sm rounded-md transition-colors duration-200 ${
                        isActive 
                          ? 'bg-primary-foreground/20 text-primary-foreground font-medium' 
                          : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
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