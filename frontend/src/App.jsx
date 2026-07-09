import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/home/HomePage';
import AboutPage from './pages/about/AboutPage';
import ContactPage from './pages/contact/ContactPage';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import RegistrationStatusPage from './pages/register/RegistrationStatusPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- NO NAVBAR PAGES --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/status" element={<RegistrationStatusPage />} />

        {/* Dashboards — each gated to its own role, no public Navbar */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* --- PUBLIC SITE WITH NAVBAR --- */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/"        element={<HomePage />} />
                <Route path="/about"   element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                {/* Fallback catches invalid URLs and sends to home */}
                <Route path="*"        element={<Navigate to="/" replace />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
