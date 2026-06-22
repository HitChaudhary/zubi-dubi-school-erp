import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginLeftPanel from '../../components/login/LoginLeftPanel';
import RoleSelector   from '../../components/login/RoleSelector';

export default function LoginPage() {
  const navigate = useNavigate();

  // Matched backend role formats by mapping or keeping them lowercase if your RoleSelector relies on it
  const [role,     setRole]     = useState('student'); 
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState(''); // Changed to a string to display backend errors directly
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const handleLogin = async () => {
    // 1. Client-side basic check
    if (!email || !password) { 
      setError('Please enter your email and password.'); 
      return; 
    }
    
    setError('');
    setLoading(true);

    try {
      // 2. Make live API request to your Express server
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Fallback to error message provided straight from backend controller
        throw new Error(data.message || 'Invalid login details.');
      }

      // 3. Save the JWT authentication state 
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setLoading(false);
      setSuccess(true);

      // 4. Redirect safely depending on user permission levels
      setTimeout(() => {
        const userRole = data.user.role; // 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'
        if (userRole === 'STUDENT') {
          navigate('/student/dashboard');
        } else if (userRole === 'TEACHER') {
          navigate('/staff/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }, 1000);

    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f9ff' }}>
      {/* Left panel */}
      <LoginLeftPanel />

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm animate-fade-up">

          {/* Mobile logo */}
          <Link to="/" className="flex md:hidden items-center gap-2 no-underline mb-8">
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#3525cd,#39b8fd)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>school</span>
            </div>
            <span className="font-headline font-extrabold text-lg" style={{ color: '#3525cd' }}>Zubi Dubi</span>
          </Link>

          <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-1">Welcome back</h1>
          <p className="text-on-surface-variant text-sm mb-8">Sign in to your Zubi Dubi account</p>

          {/* Role selector */}
          <RoleSelector selected={role} onChange={setRole} />

          {/* Email */}
          <div className="mb-4">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#777587', fontSize: 18 }}>mail</span>
              <input
                type="email"
                placeholder="admin@sunriseschool.in"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#777587', fontSize: 18 }}>lock</span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                className="form-input"
                style={{ paddingRight: 44 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <span className="material-symbols-outlined" style={{ color: '#777587', fontSize: 18 }}>
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <button style={{ fontSize: 12, color: '#3525cd', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Forgot password?
            </button>
          </div>

          {/* Error Display (dynamically renders messages from database auth feedback) */}
          {error && (
            <div style={{ background: '#ffdad6', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#93000a', textAlign: 'center', marginBottom: 12 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>error</span>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ background: '#e1f5ee', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#005338', textAlign: 'center', marginBottom: 12 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>check_circle</span>
              Signed in successfully! Redirecting...
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleLogin}
            disabled={loading || success}
            className="btn-primary w-full justify-center mb-4"
            style={{ padding: '14px', opacity: loading || success ? 0.85 : 1 }}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18, marginRight: 6 }}>autorenew</span>
                Signing In…
              </>
            ) : success ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>check_circle</span>
                Signed In!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>login</span>
                Sign In
              </>
            )}
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#777587' }}>Don't have an account? Contact your school admin or</p>
            <Link to="/contact" style={{ fontSize: 12, color: '#3525cd', fontWeight: 700, textDecoration: 'none' }}>
              Request a Free Trial →
            </Link>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5eeff' }} />
            <span style={{ fontSize: 11, color: '#777587', fontWeight: 600 }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: '#e5eeff' }} />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1.5px solid #c7c4d8', borderRadius: 10, padding: 10, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0b1c30', fontFamily: 'Inter,sans-serif', transition: 'border 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#3525cd'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#c7c4d8'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1.5px solid #c7c4d8', borderRadius: 10, padding: 10, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0b1c30', fontFamily: 'Inter,sans-serif', transition: 'border 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#3525cd'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#c7c4d8'}
            >
              <span className="material-symbols-outlined" style={{ color: '#25d366', fontSize: 18 }}>chat</span>
              WhatsApp
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}