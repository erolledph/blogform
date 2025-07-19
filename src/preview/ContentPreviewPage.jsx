import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, ExternalLink, Eye, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ContentPreviewPage() {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [slug]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${window.location.origin}/api/content.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const allContent = await response.json();
      const foundContent = allContent.find(item => item.slug === slug);
      
      if (!foundContent) {
        throw new Error('Content not found');
      }
      
      setContent(foundContent);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMarkdown = (markdown) => {
    if (!markdown) return '';
    
    // Simple markdown to HTML conversion for preview
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 text-gray-900">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 text-gray-800">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-3 text-gray-700">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n\n/gim, '</p><p class="mb-4 leading-relaxed text-gray-700">')
      .replace(/\n/gim, '<br>')
      .replace(/^(.+)$/gim, '<p class="mb-4 leading-relaxed text-gray-700">$1</p>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8">
          <div className="bg-red-100 border border-red-300 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Content Not Found</h1>
            <p className="text-red-700 mb-6">{error}</p>
            <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Eye className="h-4 w-4 mr-1" />
                Preview Mode
              </span>
              {content?.contentUrl && (
                <a
                  href={content.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Live Site
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Featured Image */}
          {content?.featuredImageUrl && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={content.featuredImageUrl}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="p-8 lg:p-12">
            <div className="mb-8">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  content?.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {content?.status || 'draft'}
                </span>
                <div className="text-sm text-gray-500">
                  Slug: /{content?.slug}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {content?.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                {content?.author && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{content.author}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(content?.createdAt)}</span>
                </div>
                {content?.publishDate && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Published {formatDate(content.publishDate)}</span>
                  </div>
                )}
              </div>

              {/* Categories and Tags */}
              <div className="flex flex-wrap gap-4 mb-8">
                {content?.categories?.length > 0 && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">Categories:</span>
                    <div className="flex flex-wrap gap-2">
                      {content.categories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {content?.tags?.length > 0 && (
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-gray-500" />
                    <div className="flex flex-wrap gap-2">
                      {content.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Meta Description */}
              {content?.metaDescription && (
                <div className="p-4 bg-gray-50 rounded-lg mb-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Meta Description:</h3>
                  <p className="text-gray-600 italic">{content.metaDescription}</p>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="prose prose-lg max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdown(content?.content || '') 
                }}
              />
            </div>

            {/* SEO Information */}
            {(content?.seoTitle || content?.keywords?.length > 0) && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Information</h3>
                <div className="space-y-3">
                  {content?.seoTitle && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">SEO Title: </span>
                      <span className="text-gray-600">{content.seoTitle}</span>
                    </div>
                  )}
                  {content?.keywords?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Keywords: </span>
                      <span className="text-gray-600">{content.keywords.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}