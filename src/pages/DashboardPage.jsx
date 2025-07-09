import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import OverviewTab from './OverviewTab';
import ManageContentTab from './ManageContentTab';
import CreateContentTab from './CreateContentTab';
import TipsTab from './TipsTab';
import DocumentationTab from './DocumentationTab';

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
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="mobile-hamburger" onClick={openSidebar}>
            ☰
          </button>
          <div className="mobile-title">Admin Dashboard</div>
          <div></div>
        </div>

        <div className="content-section">
          <div className="container mx-auto px-6 py-10 lg:px-10 max-w-7xl">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
              <Route path="/overview" element={<OverviewTab />} />
              <Route path="/manage" element={<ManageContentTab />} />
              <Route path="/create" element={<CreateContentTab />} />
              <Route path="/edit/:id" element={<CreateContentTab />} />
              <Route path="/tips" element={<TipsTab />} />
              <Route path="/documentation" element={<DocumentationTab />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}