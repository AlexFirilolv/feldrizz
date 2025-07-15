import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminCountdown } from '../../hooks/useAdminCountdown';
import LoadingSpinner from '../LoadingSpinner';
import { PencilIcon, EyeIcon } from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  const { days, loading, error, refetch } = useAdminCountdown();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading admin dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-warm-gray-800 mb-4">
            Error Loading Dashboard
          </h2>
          <p className="text-warm-gray-600 mb-6 max-w-md">
            {error}
          </p>
          <button onClick={refetch} className="btn-romantic">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-warm-gray-800 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-warm-gray-600 text-lg">
          Manage countdown content and preview days
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {days?.map((day) => (
          <div key={day.id} className="admin-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-warm-gray-800">
                Day {day.day_number}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs ${
                day.is_unlocked 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {day.is_unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
            
            <h4 className="text-warm-gray-600 mb-4">
              {day.title}
            </h4>
            
            <div className="text-sm text-warm-gray-500 mb-4">
              {day.content_html ? (
                <span className="text-green-600">✓ Content added</span>
              ) : (
                <span className="text-gray-500">No content yet</span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Link
                to={`/admin/edit/${day.day_number}`}
                className="flex-1 btn-soft text-center text-sm py-2"
              >
                <PencilIcon className="w-4 h-4 inline mr-1" />
                Edit
              </Link>
              
              <Link
                to={`/day/${day.day_number}?preview_token=vibeCoding2025!`}
                className="flex-1 btn-outline text-center text-sm py-2"
              >
                <EyeIcon className="w-4 h-4 inline mr-1" />
                Preview
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard; 