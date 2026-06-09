import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu automatically whenever the route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  // Compute theme variables depending on scroll layout state
  const navBackground = isScrolled ? 'rgba(255,255,255,0.97)' : 'transparent';
  const navShadow = isScrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none';
  const navBackdrop = isScrolled ? 'blur(12px)' : 'none';
  const logoBackground = isScrolled ? 'linear-gradient(135deg,#3525cd,#006591)' : 'linear-gradient(135deg,#c3c0ff,#89ceff)';
  const loginLinkColor = isScrolled ? '#3525cd' : '#c3c0ff';
  const linkClass = isScrolled 
    ? 'text-sm font-semibold cursor-pointer text-[#464555] hover:text-[#3525cd] transition-colors' 
    : 'text-sm font-semibold cursor-pointer text-white/80 hover:text-white transition-colors';

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ background: navBackground, boxShadow: navShadow, backdropFilter: navBackdrop }}
    >
      <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between relative">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 bg-transparent border-none">
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#3525cd,#39b8fd)', borderRadius: '10px' }} className="flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>school</span>
          </div>
          <span 
            className="font-headline font-extrabold text-xl" 
            style={{ background: logoBackground, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Zubi Dubi
          </span>
        </Link>

        {/* Navigation Menu (Handles Desktop & Mobile states correctly) */}
        <div 
          className={`
            md:flex items-center gap-8 
            ${mobileNavOpen 
              ? 'flex flex-col absolute top-[70px] left-0 right-0 bg-white p-6 shadow-xl gap-4 border-t border-surface-container text-[#464555]' 
              : 'hidden'
            }
          `}
          id="desktop-nav"
        >
          <Link 
            to="/" 
            className={`${mobileNavOpen ? 'text-[#464555] text-sm font-semibold hover:text-[#3525cd]' : linkClass} ${isActive('/') ? 'text-[#3525cd] font-bold' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`${mobileNavOpen ? 'text-[#464555] text-sm font-semibold hover:text-[#3525cd]' : linkClass} ${isActive('/about') ? 'text-[#3525cd] font-bold' : ''}`}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`${mobileNavOpen ? 'text-[#464555] text-sm font-semibold hover:text-[#3525cd]' : linkClass} ${isActive('/contact') ? 'text-[#3525cd] font-bold' : ''}`}
          >
            Contact
          </Link>
        </div>

        {/* CTA Elements */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-bold transition-colors" style={{ color: loginLinkColor }}>Login</Link>
          <Link to="/login" className="btn-primary text-sm" style={{ padding: '9px 22px' }}>Get Started</Link>
          
          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden flex items-center justify-center p-2 rounded-lg bg-transparent border-none cursor-pointer" 
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <span className="material-symbols-outlined" style={{ color: isScrolled ? '#3525cd' : '#c3c0ff' }}>
              {mobileNavOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}