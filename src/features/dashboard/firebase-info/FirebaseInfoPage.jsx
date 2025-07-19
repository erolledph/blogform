import React from 'react';
import { useFirebaseUsage } from '@/hooks/useAnalytics';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Database, Cloud, Zap, CreditCard, AlertTriangle, CheckCircle, XCircle, Info, RefreshCw, TrendingUp, HardDrive, Activity } from 'lucide-react';

export default function FirebaseInfoPage() {
  const { usage, loading: usageLoading, error: usageError, refetch } = useFirebaseUsage();

  const sparkLimits = [
    { feature: 'Cloud Storage', limit: '5 GB total', usage: 'Image uploads, file storage' },
    { feature: 'Cloud Storage Downloads', limit: '1 GB/day', usage: 'Serving images to users' },
    { feature: 'Cloud Storage Operations', limit: '50,000/day', usage: 'Upload, delete, metadata operations' },
    { feature: 'Cloud Firestore Reads', limit: '50,000/day', usage: 'Loading content, user data' },
    { feature: 'Cloud Firestore Writes', limit: '20,000/day', usage: 'Creating, updating content' },
    { feature: 'Cloud Firestore Deletes', limit: '20,000/day', usage: 'Removing content' },
    { feature: 'Authentication', limit: 'Unlimited', usage: 'User login/registration' },
    { feature: 'Hosting', limit: '10 GB storage, 10 GB/month transfer', usage: 'Static site hosting' }
  ];

  const blazeFeatures = [
    'Pay-as-you-go pricing after free tier limits',
    'No daily limits - only usage-based billing',
    'Access to additional Firebase services',
    'Cloud Functions (serverless functions)',
    'Advanced security rules',
    'Performance monitoring',
    'A/B testing capabilities'
  ];

  const currentUsageStatus = [
    { feature: 'Image Storage', status: 'active', description: 'Currently using Firebase Storage for image uploads' },
    { feature: 'Content Database', status: 'active', description: 'Using Cloud Firestore for content management' },
    { feature: 'User Authentication', status: 'active', description: 'Firebase Auth for admin login' },
    { feature: 'API Functions', status: 'external', description: 'Using Netlify Functions (not Firebase Functions)' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'inactive':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'external':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="section-spacing">
      <div className="page-header">
        <h1 className="page-title">Firebase Usage & Plans</h1>
      </div>

      {/* Firebase Plan Information */}
      <div className="card border-primary/20 bg-primary/5">
        <div className="card-header">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="card-title">Firebase Plans Overview</h2>
            </div>
          </div>
        </div>
        <div className="card-content">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Plan Detection Limitation</h3>
                <p className="text-base text-blue-700 mb-3">
                  Firebase doesn't provide a client-side API to detect your current billing plan. 
                  The information below shows general Firebase plan limits and your application's usage patterns.
                </p>
                <p className="text-base text-blue-700">
                  To check your actual plan and billing status, visit the 
                  <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-800 underline ml-1">
                    Firebase Console
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Firebase Usage */}
      <div className="card border-blue-200 bg-blue-50">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="card-title text-blue-900">Live Firebase Usage Monitor</h2>
              </div>
            </div>
            <button
              onClick={refetch}
              disabled={usageLoading}
              className="btn-secondary btn-sm bg-white hover:bg-blue-50 border-blue-200"
              title="Refresh usage data"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${usageLoading ? 'animate-spin' : ''}`} />
              {usageLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="card-content">
          {usageLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-4 text-lg text-blue-700">Fetching Firebase usage data...</span>
            </div>
          ) : usageError ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Usage Data</h3>
              <p className="text-red-700 mb-4">{usageError}</p>
              <button onClick={refetch} className="btn-secondary bg-white hover:bg-red-50 border-red-200">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          ) : usage ? (
            <div className="space-y-8">
              {/* Quick Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Database className="h-8 w-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-900">{usage.documentCounts.content}</span>
                  </div>
                  <h3 className="text-sm font-medium text-blue-700 mb-1">Content Items</h3>
                  <p className="text-xs text-blue-600">Blog posts & pages</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Activity className="h-8 w-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-900">{usage.documentCounts.pageViews}</span>
                  </div>
                  <h3 className="text-sm font-medium text-green-700 mb-1">Page Views</h3>
                  <p className="text-xs text-green-600">
                    Analytics records
                    {usage.errors?.includes('pageViews') && (
                      <span className="block text-amber-600">⚠ Limited</span>
                    )}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Zap className="h-8 w-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-900">{usage.documentCounts.interactions}</span>
                  </div>
                  <h3 className="text-sm font-medium text-purple-700 mb-1">Interactions</h3>
                  <p className="text-xs text-purple-600">
                    User actions
                    {usage.errors?.includes('interactions') && (
                      <span className="block text-amber-600">⚠ Limited</span>
                    )}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-orange-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <HardDrive className="h-8 w-8 text-orange-600" />
                    <span className="text-lg font-bold text-orange-900">
                      {usage.storageUsage.error ? 'N/A' : formatBytes(usage.storageUsage.contentSize || 0)}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-orange-700 mb-1">Storage Used</h3>
                  <p className="text-xs text-orange-600">Estimated size</p>
                </div>
              </div>

              {/* Error/Warning Notice */}
              {(usage.error || usage.errors) && (
                <div className="p-6 bg-amber-50 border border-amber-300 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800 mb-2">Data Access Limitations</h3>
                      <p className="text-base text-amber-700 mb-2">
                        {usage.error || 'Some Firebase collections could not be accessed due to security rules or permissions.'}
                      </p>
                      {usage.note && (
                        <p className="text-sm text-amber-600 mb-3">{usage.note}</p>
                      )}
                      <div className="bg-amber-100 p-3 rounded border border-amber-200">
                        <p className="text-sm text-amber-800">
                          <strong>Why this happens:</strong> Firebase security rules prevent client-side access to exact billing data. 
                          For precise usage statistics, check your Firebase Console directly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Storage Breakdown */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <HardDrive className="h-6 w-6 text-blue-600 mr-3" />
                  Storage Usage Details
                </h3>
                {usage.storageUsage.error ? (
                  <div className="text-center py-6">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-amber-500" />
                    <p className="text-amber-700 mb-2">{usage.storageUsage.error}</p>
                    <p className="text-sm text-muted-foreground">{usage.storageUsage.note}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-foreground">Estimated Content Size</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatBytes(usage.storageUsage.contentSize || 0)}
                      </span>
                    </div>
                    
                    {/* Progress bar for storage usage against free tier limit */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Usage vs Free Tier Limit (5 GB)</span>
                        <span className="text-muted-foreground">
                          {((usage.storageUsage.contentSize || 0) / (5 * 1024 * 1024 * 1024) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min((usage.storageUsage.contentSize || 0) / (5 * 1024 * 1024 * 1024) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-lg font-bold text-blue-900">Images</div>
                        <div className="text-sm text-blue-600">Primary usage</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-lg font-bold text-green-900">Documents</div>
                        <div className="text-sm text-green-600">Minimal impact</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-lg font-bold text-gray-900">Metadata</div>
                        <div className="text-sm text-gray-600">Negligible</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-4 p-3 bg-gray-50 rounded border">
                      {usage.storageUsage.note}
                    </p>
                  </div>
                )}
              </div>

              {/* Operations Usage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Database className="h-5 w-5 text-green-600 mr-2" />
                    Read Operations
                  </h4>
                  {usage.estimatedReads.error ? (
                    <div className="text-center py-4">
                      <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="text-sm text-red-600">{usage.estimatedReads.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-base text-foreground">Estimated Reads</span>
                        <span className="text-xl font-bold text-green-600">
                          ~{usage.estimatedReads.approximateReads || 0}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Free Tier Daily Limit</span>
                          <span className="text-muted-foreground">50,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${Math.min((usage.estimatedReads.approximateReads || 0) / 50000 * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 p-2 bg-green-50 rounded">
                        {usage.estimatedReads.note}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg border border-orange-200">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Database className="h-5 w-5 text-orange-600 mr-2" />
                    Write Operations
                  </h4>
                  {usage.estimatedWrites.error ? (
                    <div className="text-center py-4">
                      <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="text-sm text-red-600">{usage.estimatedWrites.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-base text-foreground">Estimated Writes</span>
                        <span className="text-xl font-bold text-orange-600">
                          ~{usage.estimatedWrites.approximateWrites || 0}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Free Tier Daily Limit</span>
                          <span className="text-muted-foreground">20,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${Math.min((usage.estimatedWrites.approximateWrites || 0) / 20000 * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 p-2 bg-orange-50 rounded">
                        {usage.estimatedWrites.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>
                    Last updated: {usage.lastUpdated ? new Date(usage.lastUpdated).toLocaleString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Usage Data Available</h3>
              <p className="text-gray-600 mb-4">Unable to fetch Firebase usage statistics</p>
              <button onClick={refetch} className="btn-secondary bg-white hover:bg-gray-50 border-gray-200">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Important Notice about Image Uploads */}
      <div className="card border-amber-200 bg-amber-50">
        <div className="card-content p-6">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Important: Image Upload Functionality</h3>
              <div className="text-base text-amber-700 space-y-2">
                <p>
                  Your application <strong>DOES use Firebase Storage</strong> for image uploads. 
                  This means image uploads are subject to Firebase plan limits.
                </p>
                <p>
                  <strong>Free Tier Limits:</strong> 5GB storage total, 1GB/day download limit
                </p>
                <p>
                  If you exceed these limits, image uploads may fail and you'll need to upgrade to the Blaze plan for pay-as-you-go pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Firebase Usage (Original Section - Enhanced) */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Database className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h2 className="card-title">Detailed Firebase Usage Analysis</h2>
                <p className="card-description text-lg">
                  In-depth breakdown of Firebase resource consumption and limits
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card-content">
          {usageLoading ? (
            <LoadingSpinner size="md" className="h-32" />
          ) : usageError ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
              <p className="text-destructive">Error loading usage data: {usageError}</p>
              <button onClick={refetch} className="btn-secondary mt-4">
                Try Again
              </button>
            </div>
          ) : usage ? (
            <div className="space-y-8">
              {/* Error/Warning Notice */}
              {(usage.error || usage.errors) && (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800 mb-2">Limited Data Available</h3>
                      <p className="text-base text-amber-700 mb-2">
                        {usage.error || 'Some Firebase collections could not be accessed due to permissions.'}
                      </p>
                      {usage.note && (
                        <p className="text-sm text-amber-600">{usage.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Document Counts */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Document Counts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl font-bold text-blue-900">{usage.documentCounts.content}</div>
                      <Database className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-sm text-blue-600 mb-1">Content Documents</div>
                    <div className="text-xs text-blue-500">Blog posts, pages, etc.</div>
                  </div>
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl font-bold text-green-900">{usage.documentCounts.pageViews}</div>
                      <Database className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-sm text-green-600 mb-1">Page View Records</div>
                    <div className="text-xs text-green-500">
                      Analytics tracking data
                      {usage.errors?.includes('pageViews') && (
                        <span className="block text-amber-600 mt-1">⚠ Limited access</span>
                      )}
                    </div>
                  </div>
                  <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl font-bold text-purple-900">{usage.documentCounts.interactions}</div>
                      <Database className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-sm text-purple-600 mb-1">Interaction Records</div>
                    <div className="text-xs text-purple-500">
                      Clicks, shares, likes
                      {usage.errors?.includes('interactions') && (
                        <span className="block text-amber-600 mt-1">⚠ Limited access</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage Usage */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Storage Usage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-muted/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Cloud className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-2">Estimated Content Size</h4>
                        {usage.storageUsage.error ? (
                          <p className="text-base text-foreground mb-2">
                            {usage.storageUsage.error}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-2xl font-bold text-foreground">
                              {formatBytes(usage.storageUsage.contentSize || 0)}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min((usage.storageUsage.contentSize || 0) / (5 * 1024 * 1024 * 1024) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              of 5 GB free tier limit
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          {usage.storageUsage.note}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-muted/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Storage Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Images:</span>
                            <span className="text-foreground">Primary usage</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Documents:</span>
                            <span className="text-foreground">Minimal</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Metadata:</span>
                            <span className="text-foreground">Negligible</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Most storage is used by uploaded images in Firebase Storage
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operations */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Operations (Estimated)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-muted/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Database className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-2">Read Operations</h4>
                        {usage.estimatedReads.error ? (
                          <p className="text-sm text-muted-foreground">{usage.estimatedReads.error}</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xl font-bold text-foreground">
                              ~{usage.estimatedReads.approximateReads || 0}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min((usage.estimatedReads.approximateReads || 0) / 50000 * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              of 50,000 free tier daily limit
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {usage.estimatedReads.note}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-muted/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Database className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-2">Write Operations</h4>
                        {usage.estimatedWrites.error ? (
                          <p className="text-sm text-muted-foreground">{usage.estimatedWrites.error}</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xl font-bold text-foreground">
                              ~{usage.estimatedWrites.approximateWrites || 0}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min((usage.estimatedWrites.approximateWrites || 0) / 20000 * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              of 20,000 free tier daily limit
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {usage.estimatedWrites.note}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-center text-sm text-muted-foreground">
                Last updated: {usage.lastUpdated ? new Date(usage.lastUpdated).toLocaleString() : 'Unknown'}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Unable to load Firebase usage data</p>
              <button onClick={refetch} className="btn-secondary mt-4">
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Current Usage Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Current Firebase Services Usage</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentUsageStatus.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.feature}</h3>
                  <p className="text-base text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Free Tier (Spark Plan) Limits */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Database className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="card-title">Free Tier (Spark Plan) Limits</h2>
          </div>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Free Tier Limit
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Usage in Your App
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {sparkLimits.map((limit, index) => (
                  <tr key={index} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-medium text-foreground">{limit.feature}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base text-foreground">{limit.limit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-base text-muted-foreground">{limit.usage}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Blaze Plan Benefits */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="card-title">Blaze Plan (Pay-as-you-go) Benefits</h2>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blazeFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-base text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recommendations</h2>
        </div>
        <div className="card-content">
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">For Free Tier Users</h3>
              <ul className="space-y-2 text-base text-blue-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  Monitor your Firebase console regularly for usage statistics
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  Optimize image sizes before upload to reduce storage usage
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  Consider implementing image compression in your upload process
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  Set up billing alerts in Firebase console to avoid unexpected charges
                </li>
              </ul>
            </div>

            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">When to Consider Upgrading</h3>
              <ul className="space-y-2 text-base text-green-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  You're consistently hitting daily limits
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  You need more than 5GB of storage for images
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  You want to use Cloud Functions for server-side processing
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  Your application has grown beyond development/testing phase
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              <Cloud className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Firebase Console</h3>
              <p className="text-base text-muted-foreground">Monitor usage and manage your project</p>
            </a>
            
            <a
              href="https://firebase.google.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              <CreditCard className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Pricing Details</h3>
              <p className="text-base text-muted-foreground">View detailed pricing for all Firebase services</p>
            </a>
            
            <a
              href="https://firebase.google.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              <Database className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Documentation</h3>
              <p className="text-base text-muted-foreground">Learn more about Firebase services</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}