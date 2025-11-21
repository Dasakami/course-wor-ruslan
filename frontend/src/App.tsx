import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Teachers } from './pages/Teachers';
import { TeacherDetails } from './pages/TeacherDetails';
import { MyBookings } from './pages/MyBookings';
import { TeacherAvailability } from './pages/TeacherAvailability';
import { TeacherBookings } from './pages/TeacherBookings';
import { Profile } from './pages/Profile';

function App() {
  const { loadUser, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers"
          element={
            <ProtectedRoute>
              <Layout>
                <Teachers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers/:teacherId"
          element={
            <ProtectedRoute>
              <Layout>
                <TeacherDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute requiredRole="student">
              <Layout>
                <MyBookings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/availability"
          element={
            <ProtectedRoute requiredRole="teacher">
              <Layout>
                <TeacherAvailability />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/bookings"
          element={
            <ProtectedRoute requiredRole="teacher">
              <Layout>
                <TeacherBookings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
