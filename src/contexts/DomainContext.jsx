import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '@/services/settingsService';

const DomainContext = createContext();

export function useDomain() {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
}

export function DomainProvider({ children }) {
  const [publicCustomDomain, setPublicCustomDomain] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomDomain = async () => {
    try {
      setLoading(true);
      const domain = await settingsService.getPublicCustomDomain();
      setPublicCustomDomain(domain);
    } catch (error) {
      console.error('Error fetching custom domain:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomDomain = async (domain) => {
    try {
      await settingsService.setPublicCustomDomain(domain);
      setPublicCustomDomain(domain);
      return true;
    } catch (error) {
      console.error('Error updating custom domain:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomDomain();
  }, []);

  const value = {
    publicCustomDomain,
    loading,
    updateCustomDomain,
    refetch: fetchCustomDomain
  };

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  );
}