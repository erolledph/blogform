import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  BookOpen, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { name: 'Manage Content', href: '/dashboard/manage', icon: FileText },
  { name: 'Create Content', href: '/dashboard/create', icon: Plus },
  { name: 'Documentation', href: '/dashboard/documentation', icon: BookOpen },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
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

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-background p-2 rounded-md shadow-md border border-border hover:bg-accent transition-colors"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">Admin CMS</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-destructive rounded-md hover:bg-destructive/10 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}