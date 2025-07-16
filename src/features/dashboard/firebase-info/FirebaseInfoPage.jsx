import React from 'react';
import { Database, Cloud, Zap, CreditCard, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function FirebaseInfoPage() {
  const currentPlan = 'Spark (Free)'; // This could be dynamic based on your Firebase project

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

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Firebase Usage & Plans</h1>
        <p className="text-lg text-muted-foreground">
          Understand your current Firebase setup, usage limits, and upgrade options
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="card border-primary/20 bg-primary/5">
        <div className="card-header">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="card-title">Current Plan: {currentPlan}</h2>
              <p className="card-description text-lg">
                You're currently on Firebase's free tier with generous limits for development
              </p>
            </div>
          </div>
        </div>
        <div className="card-content">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important: Image Upload Functionality</h3>
                <p className="text-base text-yellow-700 mb-3">
                  Your current setup <strong>DOES use Firebase Storage</strong> for image uploads, not Base64 conversion. 
                  This means image uploads are subject to Spark plan limits.
                </p>
                <p className="text-base text-yellow-700">
                  If you exceed the 5GB storage limit or 1GB/day download limit, image uploads may fail and you'll need to upgrade to the Blaze plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Usage Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Current Firebase Services Usage</h2>
          <p className="card-description text-lg">
            Overview of which Firebase services your application is currently using
          </p>
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

      {/* Spark Plan Limits */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Database className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="card-title">Spark Plan (Free) Limits</h2>
          </div>
          <p className="card-description text-lg">
            Daily and total limits for Firebase services on the free tier
          </p>
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
                    Free Limit
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
          <p className="card-description text-lg">
            What you get when upgrading to Firebase's paid plan
          </p>
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
          <p className="card-description text-lg">
            Best practices for managing Firebase usage in your application
          </p>
        </div>
        <div className="card-content">
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">For Current Spark Plan Users</h3>
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
          <p className="card-description text-lg">
            Useful links and actions for managing your Firebase project
          </p>
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