import React, { useState, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Lazy load dashboard pages
const OverviewPage = React.lazy(() => import('@/features/dashboard/overview/OverviewPage'));
const ManageContentPage = React.lazy(() => import('@/features/dashboard/manage-content/ManageContentPage'));
const CreateContentPage = React.lazy(() => import('@/features/dashboard/create-content/CreateContentPage'));
const AnalyticsPage = React.lazy(() => import('@/features/dashboard/analytics/AnalyticsPage'));
const FirebaseStoragePage = React.lazy(() => import('@/features/dashboard/storage/FirebaseStoragePage'));
const FirebaseInfoPage = React.lazy(() => import('@/features/dashboard/firebase-info/FirebaseInfoPage'));
const TipsPage = React.lazy(() => import('@/features/dashboard/tips/TipsPage'));
const DocumentationPage = React.lazy(() => import('@/features/dashboard/documentation/DocumentationPage'));
const SettingsPage = React.lazy(() => import('@/features/dashboard/settings/SettingsPage'));

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* Overlay for mobile */}
      <div 
        className={`overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      ></div>

      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        closeSidebar={closeSidebar}
      />
      
      <main className="main-content">
        {/* Header is now sticky and positioned at the top */}
        <Header onMenuClick={openSidebar} />

        <div className="content-section">
          <div className="container mx-auto px-6 pt-6 pb-10 lg:px-10 max-w-7xl">
            <Suspense fallback={<LoadingSpinner size="lg" className="h-64" />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/manage" element={<ManageContentPage />} />
                <Route path="/create" element={<CreateContentPage />} />
                <Route path="/edit/:id" element={<CreateContentPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/storage" element={<FirebaseStoragePage />} />
                <Route path="/firebase-info" element={<FirebaseInfoPage />} />
                <Route path="/tips" element={<TipsPage />} />
                <Route path="/documentation" element={<DocumentationPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}