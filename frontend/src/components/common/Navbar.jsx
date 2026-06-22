import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home',    to: '/' },
  { label: 'About',   to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (isLogin) return null;

  const dark = !scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.08)]' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between relative">

        {/* ── Logo ───────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div
            className="flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #3525cd, #39b8fd)',
              borderRadius: 10,
            }}
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>
              school
            </span>
          </div>
          
          {/* FIXED: Removed WebkitTextFillColor glitch and optimized contrast */}
          <span 
            className={`font-headline font-extrabold text-xl tracking-tight transition-colors duration-300 ${
              scrolled 
                ? 'bg-gradient-to-r from-[#3525cd] to-[#006591] bg-clip-text text-transparent' 
                : 'text-white drop-shadow-sm'
            }`}
          >
            Zubi Dubi
          </span>
        </Link>

        {/* ── Desktop links ──────────────────── */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, to }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="text-sm transition-all duration-200 no-underline relative py-1"
                style={{
                  color: active
                    ? (dark ? '#64b5ff' : '#3525cd')
                    : (dark ? 'rgba(255,255,255,0.9)' : '#464555'),
                  fontWeight: active ? 700 : 600,
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* ── CTA ────────────────────────────── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold bg-transparent border-none cursor-pointer transition-colors duration-200 hover:opacity-80"
            style={{ color: dark ? '#ffffff' : '#3525cd' }}
          >
            Login
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className={`text-sm font-bold border-none rounded-lg cursor-pointer transition-all duration-200 hidden sm:inline-flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] ${
              dark 
                ? 'bg-white text-[#3525cd] shadow-md' 
                : 'bg-[#3525cd] text-white'
            }`}
            style={{ padding: '9px 22px', fontSize: 14 }}
          >
            Get Started
          </button>

          {/* Hamburger */}
          <button
            className="flex md:hidden items-center justify-center p-2 rounded-lg bg-transparent border-none cursor-pointer transition-transform duration-200 active:scale-90"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle Menu"
          >
            <span
              className="material-symbols-outlined transition-transform duration-200"
              style={{ 
                color: dark && !mobileOpen ? '#ffffff' : '#3525cd', 
                fontSize: 24,
                transform: mobileOpen ? 'rotate(90deg)' : 'none'
              }}
            >
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden flex flex-col gap-3 px-6 py-5 border-t animate-in fade-in slide-in-from-top-4 duration-200"
          style={{
            background: '#ffffff',
            borderColor: '#e5eeff',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          }}
        >
          {NAV_LINKS.map(({ label, to }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="text-sm font-semibold no-underline py-2 px-1 rounded-md transition-colors"
                style={{ 
                  color: active ? '#3525cd' : '#464555',
                  background: active ? '#f0f5ff' : 'transparent'
                }}
              >
                {label}
              </Link>
            );
          })}
          
          <Link
            to="/login"
            className="text-sm flex justify-center mt-2 no-underline bg-[#3525cd] text-white font-bold rounded-lg shadow-sm transition-transform active:scale-[0.98]"
            style={{ padding: '12px 20px' }}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}