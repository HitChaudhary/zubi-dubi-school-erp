import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginLeftPanel from '../../components/login/LoginLeftPanel';
import { api } from '../../utils/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ schoolName: '', domain: '', adminName: '', adminEmail: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.schoolName || !form.adminName || !form.adminEmail || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/register', {
        schoolName: form.schoolName,
        domain: form.domain || undefined,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex" style={{ background: '#f8f9ff' }}>
        <LoginLeftPanel />
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-sm text-center animate-fade-up">
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e1f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#005338' }}>mark_email_read</span>
            </div>
            <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-2">Request submitted!</h1>
            <p className="text-on-surface-variant text-sm mb-8">
              We've received your request for <strong>{form.schoolName}</strong>. A Zubi Dubi super admin will review it and you'll get an email at <strong>{form.adminEmail}</strong> once it's approved.
            </p>
            <Link to={`/register/status?email=${encodeURIComponent(form.adminEmail)}`} className="btn-primary w-full justify-center mb-3" style={{ padding: '14px', textDecoration: 'none' }}>
              Check Request Status
            </Link>
            <Link to="/login" style={{ fontSize: 13, color: '#3525cd', fontWeight: 700, textDecoration: 'none' }}>
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f9ff' }}>
      <LoginLeftPanel />

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm animate-fade-up">

          <Link to="/" className="flex md:hidden items-center gap-2 no-underline mb-8">
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#3525cd,#39b8fd)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>school</span>
            </div>
            <span className="font-headline font-extrabold text-lg" style={{ color: '#3525cd' }}>Zubi Dubi</span>
          </Link>

          <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-1">Register your school</h1>
          <p className="text-on-surface-variant text-sm mb-8">Submit your details — a super admin will review and approve your school.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">School Name</label>
              <input className="form-input" placeholder="Sunrise School" value={form.schoolName} onChange={set('schoolName')} />
            </div>

            <div className="mb-4">
              <label className="form-label">School Domain (optional)</label>
              <input className="form-input" placeholder="sunriseschool.in" value={form.domain} onChange={set('domain')} />
            </div>

            <div className="mb-4">
              <label className="form-label">Your Full Name</label>
              <input className="form-input" placeholder="Jane Doe" value={form.adminName} onChange={set('adminName')} />
            </div>

            <div className="mb-4">
              <label className="form-label">Your Email Address</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#777587', fontSize: 18 }}>mail</span>
                <input type="email" className="form-input" placeholder="admin@sunriseschool.in" value={form.adminEmail} onChange={set('adminEmail')} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#777587', fontSize: 18 }}>lock</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: 44 }}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={set('password')}
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <span className="material-symbols-outlined" style={{ color: '#777587', fontSize: 18 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="form-label">Confirm Password</label>
              <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            </div>

            {error && (
              <div style={{ background: '#ffdad6', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#93000a', textAlign: 'center', marginBottom: 16 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>error</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mb-4" style={{ padding: '14px', opacity: loading ? 0.85 : 1 }}>
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18, marginRight: 6 }}>autorenew</span>
                  Submitting…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>send</span>
                  Submit Request
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#777587' }}>Already approved?</p>
            <Link to="/login" style={{ fontSize: 12, color: '#3525cd', fontWeight: 700, textDecoration: 'none' }}>
              Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
