import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Eye, Calendar, TrendingUp, Plus, BarChart3, Package, ShoppingBag } from 'lucide-react';
import { useContentStats } from '@/hooks/useContent';
import { useProductStats } from '@/hooks/useProducts';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function OverviewPage() {
  const { stats, loading, error } = useContentStats();
  const { stats: productStats, loading: productLoading, error: productError } = useProductStats();
  const { currentUser } = useAuth();

  const statCards = [
    {
      title: 'Total Content',
      value: stats.totalContent,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Published',
      value: stats.publishedContent,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Drafts',
      value: stats.draftContent,
      icon: Calendar,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Recent (7 days)',
      value: stats.recentContent,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const productStatCards = [
    {
      title: 'Total Products',
      value: productStats.totalProducts,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      title: 'Published',
      value: productStats.publishedProducts,
      icon: ShoppingBag,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Drafts',
      value: productStats.draftProducts,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Recent (7 days)',
      value: productStats.recentProducts,
      icon: TrendingUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    }
  ];

  if (loading || productLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || productError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading dashboard: {error || productError}</p>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-description">
          Welcome to your content management system
        </p>
      </div>

      {/* Content Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Blog Content</h2>
        <div className="grid-responsive-4">
          {statCards.map((stat, index) => (
            <div key={index} className={`card border ${stat.borderColor} ${stat.bgColor}`}>
              <div className="card-content p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-muted-foreground mb-2 sm:mb-3">{stat.title}</p>
                    <p className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 sm:p-4 rounded-full ${stat.bgColor} border ${stat.borderColor}`}>
                    <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Products</h2>
        <div className="grid-responsive-4">
          {productStatCards.map((stat, index) => (
            <div key={index} className={`card border ${stat.borderColor} ${stat.bgColor}`}>
              <div className="card-content p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-muted-foreground mb-2 sm:mb-3">{stat.title}</p>
                    <p className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 sm:p-4 rounded-full ${stat.bgColor} border ${stat.borderColor}`}>
                    <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
          <p className="card-description">Get started with these common tasks</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/dashboard/create"
              className="group p-6 sm:p-8 border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">Create Blog Post</h3>
              <p className="text-base text-muted-foreground">Start writing a new article</p>
            </Link>
            
            <Link
              to="/dashboard/create-product"
              className="group p-6 sm:p-8 border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">Add Product</h3>
              <p className="text-base text-muted-foreground">Add a new product to your catalog</p>
            </Link>
            
            <Link
              to="/dashboard/manage"
              className="group p-6 sm:p-8 border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">Manage Content</h3>
              <p className="text-base text-muted-foreground">Edit or delete existing content</p>
            </Link>
            
            <Link
              to="/dashboard/manage-products"
              className="group p-6 sm:p-8 border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">Manage Products</h3>
              <p className="text-base text-muted-foreground">Edit or delete existing products</p>
            </Link>
            
            <Link
              to="/dashboard/analytics"
              className="group p-6 sm:p-8 border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">View Analytics</h3>
              <p className="text-base text-muted-foreground">Track performance and usage</p>
            </Link>
            
            <a
              href={`/users/${currentUser?.uid}/blogs/${currentUser?.uid}/api/content.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 sm:p-8 border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <Eye className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">Content API</h3>
              <p className="text-base text-muted-foreground">Check your blog content API</p>
            </a>
            
            <a
              href={`/users/${currentUser?.uid}/blogs/${currentUser?.uid}/api/products.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 sm:p-8 border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">Products API</h3>
              <p className="text-base text-muted-foreground">Check your products API endpoint</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}