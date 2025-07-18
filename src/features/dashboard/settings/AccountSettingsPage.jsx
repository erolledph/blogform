import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import InputField from '@/components/shared/InputField';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountSettingsPage() {
  const { currentUser } = useAuth();

  return (
    <div className="section-spacing">
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-description">
          Manage your account settings
        </p>
      </div>

      <div className="max-w-2xl">
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
    </div>
  );
}