import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import CountdownGrid from './components/CountdownGrid';
import DayView from './components/DayView';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminDayEditor from './components/admin/AdminDayEditor';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-romantic">
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FEF9E7',
              color: '#44403C',
              border: '1px solid #FEB47B',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#FEB47B',
                secondary: '#FEF9E7',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF6B6B',
                secondary: '#FEF9E7',
              },
            },
          }}
        />

        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<CountdownGrid />} />
            <Route path="/day/:dayNumber" element={<DayView />} />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                isAuthenticated ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <AdminLogin />
                )
              } 
            />
            
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/edit/:dayNumber" 
              element={
                <ProtectedRoute>
                  <AdminDayEditor />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="mt-16 py-8 text-center">
          <div className="container mx-auto px-4">
            <p className="text-warm-gray-600 romantic-text text-lg">
              Made with 💕 for our special journey
            </p>
            <p className="text-warm-gray-500 text-sm mt-2">
              © 2025 - Our Anniversary Countdown
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App; 