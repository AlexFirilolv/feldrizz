import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HeartIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDayView = location.pathname.startsWith('/day/');

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            {(isAdminRoute || isDayView) && (
              <Link 
                to="/"
                className="text-warm-orange hover:text-sunset transition-colors duration-200"
                title="Back to Home"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
            )}
            
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-sunset rounded-full group-hover:scale-110 transition-transform duration-200">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-gray-800 group-hover:text-warm-orange transition-colors duration-200">
                  25 Days
                </h1>
                <p className="text-sm text-warm-gray-600 romantic-text">
                  Our Anniversary Journey
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {isAdminRoute ? (
              // Admin navigation
              <div className="flex items-center space-x-4">
                <span className="text-sm text-warm-gray-600">
                  Admin Panel
                </span>
                <button
                  onClick={logout}
                  className="btn-outline text-sm px-4 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Public navigation
              <div className="flex items-center space-x-4">
                {location.pathname !== '/' && (
                  <Link 
                    to="/"
                    className="text-warm-gray-600 hover:text-warm-orange transition-colors duration-200"
                  >
                    Home
                  </Link>
                )}
                
                {isAuthenticated ? (
                  <Link 
                    to="/admin/dashboard"
                    className="flex items-center space-x-2 text-warm-gray-600 hover:text-warm-orange transition-colors duration-200"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                ) : (
                  <Link 
                    to="/admin"
                    className="flex items-center space-x-2 text-warm-gray-600 hover:text-warm-orange transition-colors duration-200"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>
        
        {/* Page breadcrumb for admin routes */}
        {isAdminRoute && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <nav className="text-sm">
              <ol className="flex items-center space-x-2 text-warm-gray-600">
                <li>
                  <Link to="/admin/dashboard" className="hover:text-warm-orange transition-colors">
                    Dashboard
                  </Link>
                </li>
                {location.pathname.includes('/edit/') && (
                  <>
                    <li className="text-warm-gray-400">/</li>
                    <li className="text-warm-orange">
                      Edit Day {location.pathname.split('/').pop()}
                    </li>
                  </>
                )}
              </ol>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 