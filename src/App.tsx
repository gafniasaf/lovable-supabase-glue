
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './hooks/useAuth';
import { AdminAuditLogsPage, FilesPage } from '@lovable/expertfolio-ui';
import { ExpertfolioProvider } from '@lovable/expertfolio-ui/integration';
import { adminAuditLogsAdapter, filesAdapter } from '@lovable/expertfolio-adapters';
import LoginPage from './pages/LoginPage';
import AuditLogDetailPage from './pages/AuditLogDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

export default function App() {
  const adapters = {
    adminAuditLogs: adminAuditLogsAdapter,
    files: filesAdapter
  };

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ExpertfolioProvider 
          adapters={adapters}
          onNavigate={handleNavigate}
        >
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/admin/audit-logs" replace />} />
                <Route 
                  path="/admin/audit-logs" 
                  element={
                    <ProtectedRoute>
                      <div className="container mx-auto p-6">
                        <AdminAuditLogsPage />
                      </div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/audit-logs/:id" 
                  element={
                    <ProtectedRoute>
                      <div className="container mx-auto p-6">
                        <AuditLogDetailPage />
                      </div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/files" 
                  element={
                    <ProtectedRoute>
                      <div className="container mx-auto p-6">
                        <FilesPage />
                      </div>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </Router>
          <Toaster />
        </ExpertfolioProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
