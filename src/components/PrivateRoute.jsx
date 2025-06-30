
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Helper: check localStorage for auth (adjust key as needed)
  const isLoggedInOffline = () => {
    // Example: check for a token or user object in localStorage
    return Boolean(localStorage.getItem('authToken') || localStorage.getItem('user'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If online, use normal auth logic
  if (navigator.onLine) {
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  }

  // If offline, check localStorage for auth
  if (!isLoggedInOffline()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">Login Required</h2>
          <p className="text-gray-500 mb-4">You must be logged in to access this page, even offline.</p>
          <p className="text-xs text-gray-400">Please connect to the internet and log in.</p>
        </div>
      </div>
    );
  }

  // Offline and logged in
  return children;
}
