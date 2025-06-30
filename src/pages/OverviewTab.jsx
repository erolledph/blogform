import React, { useState, useEffect } from 'react';
import { FileText, Eye, Calendar, TrendingUp, Plus } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export default function OverviewTab() {
  const [stats, setStats] = useState({
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    recentContent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const contentRef = collection(db, 'content');
      
      // Get all content
      const allContent = await getDocs(contentRef);
      const totalContent = allContent.size;
      
      // Get published content
      const publishedQuery = query(contentRef, where('status', '==', 'published'));
      const publishedContent = await getDocs(publishedQuery);
      
      // Get draft content
      const draftQuery = query(contentRef, where('status', '==', 'draft'));
      const draftContent = await getDocs(draftQuery);
      
      // Get recent content (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentQuery = query(contentRef, where('createdAt', '>=', sevenDaysAgo));
      const recentContent = await getDocs(recentQuery);
      
      setStats({
        totalContent,
        publishedContent: publishedContent.size,
        draftContent: draftContent.size,
        recentContent: recentContent.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to your content management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`card border ${stat.borderColor} ${stat.bgColor}`}>
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor} border ${stat.borderColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/create"
              className="group p-6 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
            >
              <Plus className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-1">Create New Content</h3>
              <p className="text-sm text-muted-foreground">Start writing a new article</p>
            </a>
            
            <a
              href="/dashboard/manage"
              className="group p-6 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
            >
              <FileText className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-1">Manage Content</h3>
              <p className="text-sm text-muted-foreground">Edit or delete existing content</p>
            </a>
            
            <a
              href="/api/content.json"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
            >
              <Eye className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-1">View API</h3>
              <p className="text-sm text-muted-foreground">Check your public API endpoint</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}