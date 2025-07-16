import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useContent } from '@/hooks/useContent';
import { analyticsService } from '@/services/analyticsService';
import DataTable from '@/components/shared/DataTable';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Modal from '@/components/shared/Modal';
import { Edit, Trash2, ExternalLink, Plus, ImageIcon, BarChart3, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { getStatusBadgeClass, getContentUrl } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function ManageContentPage() {
  const { content, loading, error, refetch } = useContent();
  const { getAuthToken } = useAuth();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, content: null });
  const [analyticsModal, setAnalyticsModal] = useState({ isOpen: false, content: null });

  const handleDelete = async (contentItem) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`/.netlify/functions/admin-content`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: contentItem.id })
      });

      if (response.ok) {
        toast.success('Content deleted successfully');
        refetch(); // Refresh the list
        setDeleteModal({ isOpen: false, content: null });
      } else {
        throw new Error('Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleViewAnalytics = (contentItem) => {
    setAnalyticsModal({ isOpen: true, content: contentItem });
  };
  const columns = [
    {
      key: 'featuredImageUrl',
      title: 'Image',
      sortable: false,
      render: (value, row) => (
        <div className="w-16 h-16 flex-shrink-0">
          {value ? (
            <img
              src={value}
              alt={row.title}
              className="w-16 h-16 object-cover rounded-md border border-border"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-16 h-16 bg-muted rounded-md border border-border flex items-center justify-center ${value ? 'hidden' : 'flex'}`}
          >
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      )
    },
    {
      key: 'title',
      title: 'Title',
      render: (value, row) => (
        <div className="flex flex-col">
          <div className="text-base font-medium text-foreground truncate max-w-xs mb-1">
            {value}
          </div>
          <div className="text-sm text-muted-foreground truncate max-w-xs">
            /{row.slug}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`badge ${getStatusBadgeClass(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'author',
      title: 'Author',
      render: (value) => value || 'N/A'
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value) => value ? format(value.toDate(), 'MMM dd, yyyy') : 'N/A'
    },
    {
      key: 'viewCount',
      title: 'Views',
      render: (value) => (
        <div className="text-center">
          <div className="text-base font-medium text-foreground">{value || 0}</div>
          <div className="text-xs text-muted-foreground">tracked</div>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center space-x-1">
          <Link
            to={`/dashboard/edit/${row.id}`}
            className="text-primary p-2 rounded hover:bg-primary/10"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleViewAnalytics(row)}
            className="text-blue-600 p-2 rounded hover:bg-blue-50"
            title="View Analytics"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, content: row })}
            className="text-destructive p-2 rounded hover:bg-destructive/10"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <a
            href={getContentUrl(row.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground p-2 rounded hover:bg-muted"
            title="Visit"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading content: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Manage Content</h1>
          <p className="text-lg text-muted-foreground">
            {content.length} articles
          </p>
        </div>
        <Link
          to="/dashboard/create"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-3" />
          Create New
        </Link>
      </div>

      <DataTable
        data={content}
        columns={columns}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, content: null })}
        title="Delete Content"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-base text-foreground">
            Are you sure you want to delete "{deleteModal.content?.title}"?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => setDeleteModal({ isOpen: false, content: null })}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteModal.content)}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        isOpen={analyticsModal.isOpen}
        onClose={() => setAnalyticsModal({ isOpen: false, content: null })}
        title={`Analytics: ${analyticsModal.content?.title}`}
        size="lg"
      >
        <ContentAnalyticsModal 
          contentId={analyticsModal.content?.id}
          contentTitle={analyticsModal.content?.title}
        />
      </Modal>
    </div>
  );
}

// Content Analytics Modal Component
function ContentAnalyticsModal({ contentId, contentTitle }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    if (!contentId) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await analyticsService.getContentAnalytics(contentId, period);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [contentId, period]);

  if (loading) {
    return <LoadingSpinner size="md" className="h-32" />;
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Performance Overview</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="input-field w-auto text-sm"
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-900">{analytics.totalViews}</div>
          <div className="text-sm text-blue-600">Total Views</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-900">{analytics.totalInteractions}</div>
          <div className="text-sm text-green-600">Interactions</div>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-900">{analytics.viewCount}</div>
          <div className="text-sm text-purple-600">Total Views</div>
        </div>
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-900">
            {Math.round(analytics.totalViews / period)}
          </div>
          <div className="text-sm text-orange-600">Avg/Day</div>
        </div>
      </div>

      {analytics.analytics && (
        <div>
          <h4 className="text-base font-semibold text-foreground mb-3">Activity Pattern</h4>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Peak viewing hour: {analytics.analytics.peakHour}:00
            </p>
            <p className="text-sm text-muted-foreground">
              Average views per day: {Math.round(analytics.analytics.averageViewsPerDay)}
            </p>
          </div>
        </div>
      )}

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium mb-1">Analytics Note</p>
            <p className="text-sm text-amber-700">
              These metrics only track Firebase-connected interactions. For complete analytics, 
              consider integrating Google Analytics on your static site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}