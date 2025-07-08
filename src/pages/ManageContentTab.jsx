import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Edit, Trash2, ExternalLink, Search, Filter, FileText, Plus, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ManageContentTab() {
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { getAuthToken } = useAuth();

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [content, searchTerm, statusFilter]);

  const fetchContent = async () => {
    try {
      const contentRef = collection(db, 'content');
      const snapshot = await getDocs(contentRef);
      const contentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by creation date (newest first)
      contentData.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      setContent(contentData);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredContent(filtered);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(`/.netlify/functions/admin-content`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        toast.success('Content deleted successfully');
        fetchContent(); // Refresh the list
      } else {
        throw new Error('Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return 'badge-success';
      case 'draft':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Manage Content</h1>
          <p className="text-lg text-muted-foreground">
            {filteredContent.length} of {content.length} articles
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

      {/* Filters */}
      <div className="card">
        <div className="card-content p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by title, author, or category..."
                  className="input-field pl-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="lg:w-64">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select
                  className="input-field pl-12 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content List */}
      {filteredContent.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-16">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-4">No content found</h3>
            <p className="text-lg text-muted-foreground mb-8">
              {content.length === 0 
                ? "Get started by creating your first article."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {content.length === 0 && (
              <div>
                <Link to="/dashboard/create" className="btn-primary">
                  Create New Content
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-8 py-4 text-right text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {filteredContent.map((item) => (
                  <tr key={item.id}>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="w-20 h-20 flex-shrink-0">
                        {item.featuredImageUrl ? (
                          <img
                            src={item.featuredImageUrl}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-md border border-border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-20 h-20 bg-muted rounded-md border border-border flex items-center justify-center ${item.featuredImageUrl ? 'hidden' : 'flex'}`}
                        >
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="text-base font-medium text-foreground truncate max-w-xs mb-2">
                          {item.title}
                        </div>
                        <div className="text-base text-muted-foreground truncate max-w-xs">
                          /{item.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`badge ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-foreground">
                      {item.author}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-muted-foreground">
                      {item.createdAt ? format(item.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-base font-medium">
                      <div className="flex items-center justify-end space-x-4">
                        <Link
                          to={`/dashboard/edit/${item.id}`}
                          className="text-primary p-2 rounded"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="text-destructive p-2 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <a
                          href={`https://ailodi.xyz/post/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground p-2 rounded"
                          title="Visit"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}