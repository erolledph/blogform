import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '@/services/settingsService';
import InputField from '@/components/shared/InputField';
import { User, DollarSign, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountSettingsPage() {
  const { currentUser } = useAuth();
  const [currency, setCurrency] = useState('$');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const currencyOptions = [
    { value: '$', label: 'US Dollar ($)' },
    { value: '€', label: 'Euro (€)' },
    { value: '£', label: 'British Pound (£)' },
    { value: '¥', label: 'Japanese Yen (¥)' },
    { value: '₹', label: 'Indian Rupee (₹)' },
    { value: 'C$', label: 'Canadian Dollar (C$)' },
    { value: 'A$', label: 'Australian Dollar (A$)' },
    { value: '₽', label: 'Russian Ruble (₽)' },
    { value: '₩', label: 'South Korean Won (₩)' },
    { value: '₦', label: 'Nigerian Naira (₦)' },
    { value: '₱', label: 'Philippine Peso (₱)' },
    { value: '₡', label: 'Costa Rican Colón (₡)' },
    { value: '₪', label: 'Israeli New Shekel (₪)' },
    { value: '₫', label: 'Vietnamese Dong (₫)' },
    { value: '₴', label: 'Ukrainian Hryvnia (₴)' },
    { value: '₸', label: 'Kazakhstani Tenge (₸)' },
    { value: '₼', label: 'Azerbaijani Manat (₼)' },
    { value: '₾', label: 'Georgian Lari (₾)' },
    { value: '﷼', label: 'Saudi Riyal (﷼)' },
    { value: 'kr', label: 'Swedish Krona (kr)' },
    { value: 'zł', label: 'Polish Złoty (zł)' },
    { value: 'Kč', label: 'Czech Koruna (Kč)' },
    { value: 'Ft', label: 'Hungarian Forint (Ft)' },
    { value: 'lei', label: 'Romanian Leu (lei)' },
    { value: 'лв', label: 'Bulgarian Lev (лв)' },
    { value: 'kn', label: 'Croatian Kuna (kn)' },
    { value: 'din', label: 'Serbian Dinar (din)' },
    { value: 'CHF', label: 'Swiss Franc (CHF)' },
    { value: 'NOK', label: 'Norwegian Krone (NOK)' },
    { value: 'DKK', label: 'Danish Krone (DKK)' },
    { value: 'SEK', label: 'Swedish Krona (SEK)' },
    { value: 'R', label: 'South African Rand (R)' },
    { value: 'R$', label: 'Brazilian Real (R$)' },
    { value: '$', label: 'Mexican Peso (MX$)' },
    { value: 'S$', label: 'Singapore Dollar (S$)' },
    { value: 'HK$', label: 'Hong Kong Dollar (HK$)' },
    { value: 'NT$', label: 'New Taiwan Dollar (NT$)' },
    { value: '₿', label: 'Bitcoin (₿)' },
    { value: 'Ξ', label: 'Ethereum (Ξ)' }
  ];

  useEffect(() => {
    fetchUserSettings();
  }, [currentUser]);

  const fetchUserSettings = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setInitialLoading(true);
      const settings = await settingsService.getUserSettings(currentUser.uid);
      setCurrency(settings.currency || '$');
    } catch (error) {
      console.error('Error fetching user settings:', error);
      toast.error('Failed to load user settings');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.uid) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);

    try {
      await settingsService.setUserSettings(currentUser.uid, {
        currency
      });
      
      // Also save currency to public app settings so it's available in the API
      await settingsService.setPublicAppSettings({
        currency
      });
      
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

  if (initialLoading) {
    return (
      <div className="section-spacing">
        <div className="page-header">
          <h1 className="page-title">Account Settings</h1>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
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

        {/* Currency Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="card-title">Currency Settings</h2>
            </div>
            <p className="card-description">
              Choose your preferred currency symbol for product pricing
            </p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-base font-medium text-foreground mb-4">
                  Preferred Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field"
                  disabled={loading}
                >
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground mt-2">
                  This currency symbol will be used when creating and editing products
                </p>
              </div>

              {/* Currency Preview */}
              <div className="p-6 bg-muted/30 rounded-lg">
                <h3 className="text-base font-semibold text-foreground mb-3">Preview</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Product pricing will display as:
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-medium text-foreground">{currency}</span>
                  <span className="text-lg text-muted-foreground">99.99</span>
                </div>
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

        {/* Additional Settings Placeholder */}
        <div className="card xl:col-span-2">
          <div className="card-header">
            <h2 className="card-title">Additional Settings</h2>
            <p className="card-description">
              System information and additional configuration options
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-6">
              {/* Version Information */}
              <div className="p-6 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-2">System Information</h3>
                    <p className="text-sm text-muted-foreground">Current application version and build details</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">v1.0.0</div>
                    <div className="text-sm text-muted-foreground">Admin CMS</div>
                  </div>
                </div>
              </div>
              
              {/* Future Settings Placeholder */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Additional configuration options will be added here as the application grows.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}