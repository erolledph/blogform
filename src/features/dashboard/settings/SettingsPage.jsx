import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDomain } from '@/contexts/DomainContext';
import InputField from '@/components/shared/InputField';
import { User, Globe, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const { publicCustomDomain, updateCustomDomain } = useDomain();
  const [customDomain, setCustomDomainState] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load custom domain from context
    setCustomDomainState(publicCustomDomain);
  }, [publicCustomDomain]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate domain format if provided
      if (customDomain && !isValidDomain(customDomain)) {
        toast.error('Please enter a valid domain (e.g., example.com or https://example.com)');
        setLoading(false);
        return;
      }

      // Save to Firestore via context
      await updateCustomDomain(customDomain);
      
      setSaved(true);
      toast.success('Settings saved successfully!');
      
      // Reset saved state after 2 seconds
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const isValidDomain = (domain) => {
    if (!domain) return true; // Empty is valid (will use default)
    
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '');
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    return domainRegex.test(cleanDomain);
  };

  const formatDomainPreview = (domain) => {
    if (!domain) return 'ailodi.xyz (default)';
    
    // Add https:// if no protocol is present
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      return `https://${domain}`;
    }
    return domain;
  };

  return (
    <div className="section-spacing">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* User Information */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h2 className="card-title">User Information</h2>
            </div>
            <p className="card-description">Your account details</p>
          </div>
          <div className="card-content space-y-6">
            <InputField
              label="Email Address"
              value={currentUser?.email || 'Not available'}
              disabled
              className="opacity-75 cursor-not-allowed"
            />
            <p className="text-sm text-muted-foreground">
              Your email address cannot be changed from this interface
            </p>
            
            <InputField
              label="Role"
              value="Administrator"
              disabled
              className="opacity-75 cursor-not-allowed"
            />
            <p className="text-sm text-muted-foreground">
              Your current role in the system
            </p>
          </div>
        </div>

        {/* Custom Domain Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="card-title">Custom Domain</h2>
            </div>
            <p className="card-description">
              Configure your custom domain for content links
            </p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSave} className="space-y-6">
              <InputField
                label="Custom Domain"
                name="customDomain"
                type="text"
                placeholder="example.com or https://example.com"
                value={customDomain}
                onChange={(e) => setCustomDomainState(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Enter your custom domain where your content is published. Leave empty to use the default domain.
              </p>

              {/* Domain Preview */}
              <div className="p-6 bg-muted/30 rounded-lg">
                <h3 className="text-base font-semibold text-foreground mb-3">Preview</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Content links will use this domain:
                </p>
                <code className="text-sm bg-background px-3 py-2 rounded border block break-all">
                  {formatDomainPreview(customDomain)}/post/your-content-slug
                </code>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {saved ? (
                    <>
                      <Check className="h-5 w-5 mr-3" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-3" />
                      {loading ? 'Saving...' : 'Save Settings'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Additional Settings Placeholder */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Additional Settings</h2>
          <p className="card-description">
            More settings will be available here in future updates
          </p>
        </div>
        <div className="card-content">
          <div className="text-center py-8 text-muted-foreground">
            <p>Additional configuration options will be added here as the application grows.</p>
          </div>
        </div>
      </div>
    </div>
  );
}