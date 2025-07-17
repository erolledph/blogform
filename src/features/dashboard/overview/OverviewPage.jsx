import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, Calendar, TrendingUp, Plus, BarChart3 } from 'lucide-react';
import { useContentStats } from '@/hooks/useContent';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function OverviewPage() {
  const { stats, loading, error } = useContentStats();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading dashboard: {error}</p>
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

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
          <p className="card-description">Get started with these common tasks</p>
        </div>
        <div className="card-content">
          <div className="grid-responsive-3">
            <Link
              to="/dashboard/create"
              className="group p-6 sm:p-8 border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">Create New Content</h3>
              <p className="text-base text-muted-foreground">Start writing a new article</p>
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
              to="/dashboard/analytics"
              className="group p-6 sm:p-8 border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">View Analytics</h3>
              <p className="text-base text-muted-foreground">Track performance and usage</p>
            </Link>
            
            <a
              href="/api/content.json"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 sm:p-8 border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-md"
            >
              <Eye className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">View API</h3>
              <p className="text-base text-muted-foreground">Check your public API endpoint</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}