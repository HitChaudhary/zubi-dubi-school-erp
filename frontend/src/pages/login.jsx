import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [activeRole, setActiveRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  const roles = [
    { id: 'admin', label: 'School Admin', icon: 'admin_panel_settings' },
    { id: 'teacher', label: 'Teacher', icon: 'person_book' },
    { id: 'student', label: 'Student', icon: 'school' },
    { id: 'superadmin', label: 'Super Admin', icon: 'manage_accounts' }
  ];

  return (
    <div className="min-h-screen flex bg-[#f8f9ff] fade-in">
      {/* Visual Identity Sidepanel Context */}
      <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden w-[480px] shrink-0" style={{ background: 'linear-gradient(160deg,#0f0a2e 0%,#1e1470 60%,#0c3b68 100%)' }}>
        <div>
          <Link to="/" className="flex items-center gap-2 mb-16">
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#3525cd,#39b8fd)', borderRadius: '10px' }} className="flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>school</span>
            </div>
            <span className="font-headline font-extrabold text-xl text-[#c3c0ff]">Zubi Dubi</span>
          </Link>
          <h2 className="font-headline font-extrabold text-white text-3xl mb-4 leading-tight">Your school,<br/>fully digital.</h2>
        </div>
        <p className="text-white/20 text-xs">© 2024 Zubi Dubi. Cloud Engine Integration.</p>
      </div>

      {/* Authentication Action Forms Content Wrapper */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px]">
          <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-1">Welcome back</h1>
          <p className="text-on-surface-variant text-sm mb-8">Sign in into your structural ecosystem layer.</p>

          {/* Grid Selector Mapping Context */}
          <div className="mb-6">
            <label className="form-label mb-3">Sign in as</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => {
                const isSelected = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    className="flex items-center justify-center gap-1.5 p-2.5 text-xs font-bold rounded-xl border-2 transition-all duration-200"
                    style={{
                      borderColor: isSelected ? '#3525cd' : '#c7c4d8',
                      backgroundColor: isSelected ? '#e2dfff' : '#fff',
                      color: isSelected ? '#3525cd' : '#464555'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{role.icon}</span>
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Context</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input w-full" placeholder="admin@sunriseschool.in" />
            </div>

            <div>
              <label className="form-label">Password Key</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="form-input w-full pr-12" placeholder="••••••••" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {status === 'error' && (
              <div className="bg-red-50 text-red-900 text-xs rounded-lg p-3">
                Authentication fields missing target input attributes.
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary w-full justify-center py-3.5"
              disabled={status === 'submitting' || status === 'success'}
              style={{ backgroundColor: status === 'success' ? '#005338' : '' }}
            >
              {status === 'idle' && <>Sign In</>}
              {status === 'submitting' && <>Verifying Credentials...</>}
              {status === 'success' && <>Success Protocol Active</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}