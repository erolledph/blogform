import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Eye, DollarSign, Tag, Package, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ProductPreviewPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${window.location.origin}/api/products.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const allProducts = await response.json();
      const foundProduct = allProducts.find(item => item.slug === slug);
      
      if (!foundProduct) {
        throw new Error('Product not found');
      }
      
      setProduct(foundProduct);
    } catch (err) {
      console.error('Error fetching product:', err);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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
            <h1 className="text-2xl font-bold text-red-800 mb-4">Product Not Found</h1>
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

  const hasDiscount = product?.percentOff && product.percentOff > 0;
  const discountedPrice = hasDiscount ? product.discountedPrice : product?.originalPrice;
  const savings = hasDiscount ? product.savings : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
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
              {product?.productUrl && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Store
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-12">
            
            {/* Product Image */}
            <div className="space-y-4">
              {product?.imageUrl ? (
                <div className="aspect-square w-full overflow-hidden rounded-lg border">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-gray-100 rounded-lg border flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product?.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product?.status || 'draft'}
                </span>
                <div className="text-sm text-gray-500">
                  Slug: /{product?.slug}
                </div>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product?.name}
              </h1>

              {/* Category */}
              {product?.category && (
                <div className="flex items-center text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{product.category}</span>
                </div>
              )}

              {/* Pricing */}
              <div className="space-y-2">
                {hasDiscount ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-green-600">
                        {formatPrice(discountedPrice)}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {product.percentOff}% OFF
                      </span>
                      <span className="text-sm text-gray-600">
                        Save {formatPrice(savings)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product?.originalPrice || 0)}
                  </span>
                )}
              </div>

              {/* Tags */}
              {product?.tags?.length > 0 && (
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
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

              {/* Created Date */}
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">Added {formatDate(product?.createdAt)}</span>
              </div>

              {/* Call to Action */}
              {product?.productUrl && (
                <div className="pt-4">
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                  >
                    External Product Link
                    Buy Now - {formatPrice(discountedPrice)}
                  </a>
                  <p className="text-sm text-gray-500 mt-2">
                    Affiliate link - opens in new tab
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Product Description */}
          {product?.description && (
            <div className="border-t border-gray-200 p-8 lg:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
              <div className="prose prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(product.description) 
                  }}
                />
              </div>
            </div>
          )}

          {/* Product Information */}
          <div className="border-t border-gray-200 p-8 lg:p-12 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Product ID: </span>
                  <span className="text-gray-600 font-mono text-sm">{product?.id}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Status: </span>
                  <span className="text-gray-600">{product?.status}</span>
                </div>
                {product?.category && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Category: </span>
                    <span className="text-gray-600">{product.category}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Created: </span>
                  <span className="text-gray-600">{formatDate(product?.createdAt)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Last Updated: </span>
                  <span className="text-gray-600">{formatDate(product?.updatedAt)}</span>
                </div>
                {product?.productUrl && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">External Link: </span>
                    <a 
                      href={product.productUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                    >
                      {product.productUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}