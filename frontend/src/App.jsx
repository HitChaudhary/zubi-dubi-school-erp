import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/home/Navbar';
import Footer from './components/home/Footer';
import Home from './pages/Home/Home';
import About from './pages/Home/About';
import Contact from './pages/Home/Contact';
import Login from './pages/Login';

// Wrapper component to selectively hide layout components on paths like /login
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased font-sans">
      {!isLoginPage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <>
      <AppContent />
      </>
    
  );
}