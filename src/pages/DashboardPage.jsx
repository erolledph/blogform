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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
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
        </main>
      </div>
    </div>
  );
}