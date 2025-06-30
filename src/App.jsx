import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(0 0% 100%)',
                color: 'hsl(222.2 84% 4.9%)',
                border: '1px solid hsl(214.3 31.8% 91.4%)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;