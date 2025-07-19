import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Eye, Clock, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ContentPreviewPage() {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [allContent, setAllContent] = useState([]);
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
      
      const allContentData = await response.json();
      const foundContent = allContentData.find(item => item.slug === slug);
      
      if (!foundContent) {
        throw new Error('Content not found');
      }
      
      setContent(foundContent);
      setAllContent(allContentData);
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
    
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
      .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>')
      .replace(/^(.+)$/gim, '<p>$1</p>');
  };

  const getRelatedContent = () => {
    return allContent
      .filter(item => item.id !== content?.id && item.status === 'published')
      .slice(0, 6);
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

  const relatedContent = getRelatedContent();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Eye className="h-4 w-4 mr-1" />
              Preview Mode
            </span>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8 sm:mb-12">
            {/* Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                content?.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {content?.status || 'draft'}
              </span>
              <div className="text-sm text-gray-500 font-mono">
                /{content?.slug}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight tracking-tight">
              {content?.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-600 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
              {content?.author && (
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-medium text-gray-900">{content.author}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Author</div>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">{formatDate(content?.createdAt)}</span>
              </div>
              {content?.publishDate && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm sm:text-base">Published {formatDate(content.publishDate)}</span>
                </div>
              )}
            </div>

            {/* Categories and Tags */}
            {(content?.categories?.length > 0 || content?.tags?.length > 0) && (
              <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8">
                {content?.categories?.length > 0 && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2 sm:mr-3">Categories:</span>
                    <div className="flex flex-wrap gap-2">
                      {content.categories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {content?.tags?.length > 0 && (
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 sm:mr-3 text-gray-500" />
                    <div className="flex flex-wrap gap-2">
                      {content.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {content?.featuredImageUrl && (
            <div className="mb-8 sm:mb-12">
              <img
                src={content.featuredImageUrl}
                alt={content.title}
                className="w-full h-auto rounded-lg shadow-lg max-h-96 sm:max-h-none object-cover"
              />
            </div>
          )}

          {/* Content Body */}
          <div className="prose prose-base sm:prose-lg prose-gray max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(content?.content || '') 
              }}
            />
          </div>

          {/* Meta Description */}
          {content?.metaDescription && (
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <p className="text-gray-600 italic text-base sm:text-lg leading-relaxed">{content.metaDescription}</p>
            </div>
          )}

          {/* SEO Information */}
          {(content?.seoTitle || content?.keywords?.length > 0) && (
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Information</h3>
              <div className="space-y-2 sm:space-y-3">
                {content?.seoTitle && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block sm:inline">SEO Title: </span>
                    <span className="text-gray-600 text-sm sm:text-base">{content.seoTitle}</span>
                  </div>
                )}
                {content?.keywords?.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block sm:inline">Keywords: </span>
                    <span className="text-gray-600 text-sm sm:text-base">{content.keywords.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </article>

        {/* More from the Blog Section */}
        {relatedContent.length > 0 && (
          <section className="mt-12 sm:mt-20 pt-8 sm:pt-12 border-t border-gray-200">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">More from the Blog</h2>
              <p className="text-base sm:text-lg text-gray-600">Discover more articles and insights</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedContent.map((item) => (
                <Link
                  key={item.id}
                  to={`/preview/content/${item.slug}`}
                  className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  {item.featuredImageUrl ? (
                    <div className="aspect-video sm:aspect-[4/3] overflow-hidden">
                      <img
                        src={item.featuredImageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video sm:aspect-[4/3] bg-gray-100 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    
                    {item.metaDescription && (
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                        {item.metaDescription}
                      </p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center">
                        {item.author && (
                          <>
                            <User className="h-4 w-4 mr-1" />
                            <span className="mr-2 sm:mr-3">{item.author}</span>
                          </>
                        )}
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-8 sm:mt-12">
              <Link
                to="/dashboard/manage"
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                View All Articles
                <ArrowLeft className="ml-2 h-5 w-5 transform rotate-180" />
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}