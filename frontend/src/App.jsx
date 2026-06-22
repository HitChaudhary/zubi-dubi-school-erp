import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import HomePage from './pages/home/HomePage';
import AboutPage from './pages/about/AboutPage';
import ContactPage from './pages/contact/ContactPage';
import LoginPage from './pages/login/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Mock placeholders for other roles for now
const StaffDashboard = () => <div style={{ padding: 40 }}><h2>Staff Meeting Dashboard</h2></div>;
const StudentDashboard = () => <div style={{ padding: 40 }}><h2>Student Classroom Portal</h2></div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- NO NAVBAR PAGES --- */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Dashboards (No main public Navbar) */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />

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