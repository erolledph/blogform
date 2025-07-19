import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Package, Calendar, Star, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ProductPreviewPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

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
      
      const allProductsData = await response.json();
      const foundProduct = allProductsData.find(item => item.slug === slug);
      
      if (!foundProduct) {
        throw new Error('Product not found');
      }
      
      setProduct(foundProduct);
      setAllProducts(allProductsData);
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

  const getRelatedProducts = () => {
    return allProducts
      .filter(item => item.id !== product?.id && item.status === 'published')
      .slice(0, 8);
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
  const relatedProducts = getRelatedProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      {/* Product Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8 lg:p-12">
            
            {/* Product Images */}
            <div className="space-y-4 order-1 lg:order-1">
              {product?.imageUrl ? (
                <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-2">
              {/* Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product?.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product?.status || 'draft'}
                </span>
                <div className="text-sm text-gray-500 font-mono">
                  /{product?.slug}
                </div>
              </div>

              {/* Product Name */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4">
                  {product?.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">(4.8) • 127 reviews</span>
                </div>
              </div>

              {/* Category */}
              {product?.category && (
                <div className="flex items-center text-gray-600 text-sm sm:text-base">
                  <Package className="h-4 w-4 mr-2" />
                  <span className="font-medium">{product.category}</span>
                </div>
              )}

              {/* Pricing */}
              <div className="space-y-3 sm:space-y-4 py-4 sm:py-6 border-y border-gray-200">
                {hasDiscount ? (
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">
                        {formatPrice(discountedPrice)}
                      </span>
                      <span className="text-lg sm:text-xl lg:text-2xl text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {product.percentOff}% OFF
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600">
                        You save {formatPrice(savings)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    {formatPrice(product?.originalPrice || 0)}
                  </span>
                )}
                
                <p className="text-xs sm:text-sm text-gray-600">
                  Free shipping on orders over $50
                </p>
              </div>

              {/* Product Features */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 py-4 sm:py-6 border-b border-gray-200">
                <div className="text-center">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Free Shipping</div>
                  <div className="text-xs text-gray-600 hidden sm:block">On orders $50+</div>
                </div>
                <div className="text-center">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Secure Payment</div>
                  <div className="text-xs text-gray-600 hidden sm:block">SSL Protected</div>
                </div>
                <div className="text-center">
                  <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Easy Returns</div>
                  <div className="text-xs text-gray-600 hidden sm:block">30-day policy</div>
                </div>
              </div>

              {/* Tags */}
              {product?.tags?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
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

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
                {product?.productUrl && (
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    Buy Now - {formatPrice(discountedPrice)}
                  </a>
                )}
                
                {product?.productUrl && (
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
                    Affiliate link - opens in new tab
                  </p>
                )}
              </div>

              {/* Created Date */}
              <div className="flex items-center text-gray-600 pt-3 sm:pt-4 border-t border-gray-200 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Added {formatDate(product?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Product Description */}
          {product?.description && (
            <div className="border-t border-gray-200 p-6 sm:p-8 lg:p-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Product Description</h2>
              <div className="prose prose-base sm:prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(product.description) 
                  }}
                />
              </div>
            </div>
          )}

          {/* Product Information */}
          <div className="border-t border-gray-200 p-6 sm:p-8 lg:p-12 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Product ID:</span>
                  <span className="text-sm text-gray-600 font-mono break-all">{product?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className="text-sm text-gray-600">{product?.status}</span>
                </div>
                {product?.category && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Category:</span>
                    <span className="text-sm text-gray-600">{product.category}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Created:</span>
                  <span className="text-sm text-gray-600">{formatDate(product?.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                  <span className="text-sm text-gray-600">{formatDate(product?.updatedAt)}</span>
                </div>
                {product?.productUrl && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">External Link:</span>
                    <a 
                      href={product.productUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline truncate max-w-32 sm:max-w-xs"
                    >
                      View Product
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* More Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 sm:mt-20">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">More Products</h2>
              <p className="text-base sm:text-lg text-gray-600">Discover more amazing products</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((item) => {
                const itemHasDiscount = item.percentOff && item.percentOff > 0;
                const itemDiscountedPrice = itemHasDiscount ? item.discountedPrice : item.originalPrice;
                
                return (
                  <Link
                    key={item.id}
                    to={`/preview/product/${item.slug}`}
                    className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {item.imageUrl ? (
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                      
                      <div className="mb-2 sm:mb-3">
                        {itemHasDiscount ? (
                          <div className="space-y-0.5 sm:space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm sm:text-base lg:text-lg font-bold text-green-600">
                                {formatPrice(itemDiscountedPrice)}
                              </span>
                              <span className="text-xs sm:text-sm line-through text-gray-500">
                                {formatPrice(item.originalPrice)}
                              </span>
                            </div>
                            <div className="text-xs text-red-600 font-medium hidden sm:block">
                              {item.percentOff}% OFF
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-500">
                        {item.category && (
                          <span className="truncate text-xs">{item.category}</span>
                        )}
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
                );
              })}
            </div>
            
            <div className="text-center mt-8 sm:mt-12">
              <Link
                to="/dashboard/manage-products"
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                View All Products
                <ArrowLeft className="ml-2 h-5 w-5 transform rotate-180" />
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}