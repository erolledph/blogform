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
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Published',
      value: stats.publishedContent,
      icon: Eye,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Drafts',
      value: stats.draftContent,
      icon: Calendar,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Recent (7 days)',
      value: stats.recentContent,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your content management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`card ${stat.bgColor}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/create"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <Plus className="h-8 w-8 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Create New Content</h3>
            <p className="text-sm text-gray-600">Start writing a new article</p>
          </a>
          
          <a
            href="/dashboard/manage"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <FileText className="h-8 w-8 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Content</h3>
            <p className="text-sm text-gray-600">Edit or delete existing content</p>
          </a>
          
          <a
            href="/api/content.json"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <Eye className="h-8 w-8 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">View API</h3>
            <p className="text-sm text-gray-600">Check your public API endpoint</p>
          </a>
        </div>
      </div>
    </div>
  );
}