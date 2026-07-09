import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import LoginLeftPanel from '../../components/login/LoginLeftPanel';
import { api } from '../../utils/api';

const STATUS_META = {
  PENDING: { color: '#7a5b00', bg: '#fff3cd', icon: 'hourglass_top', label: 'Pending Review' },
  APPROVED: { color: '#005338', bg: '#e1f5ee', icon: 'check_circle', label: 'Approved' },
  REJECTED: { color: '#93000a', bg: '#ffdad6', icon: 'cancel', label: 'Not Approved' },
};

export default function RegistrationStatusPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const checkStatus = async (e) => {
    e?.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.get(`/register/status?email=${encodeURIComponent(email)}`);
      setResult(data.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // Auto-check if an email arrived via the URL (e.g. from the "Request submitted" page)
  useEffect(() => {
    if (searchParams.get('email')) checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = result ? STATUS_META[result.status] : null;

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

          <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-1">Check request status</h1>
          <p className="text-on-surface-variant text-sm mb-8">Enter the email you registered your school with.</p>

          <form onSubmit={checkStatus}>
            <div className="mb-4">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#777587', fontSize: 18 }}>mail</span>
                <input type="email" className="form-input" placeholder="admin@sunriseschool.in" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mb-4" style={{ padding: '14px', opacity: loading ? 0.85 : 1 }}>
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18, marginRight: 6 }}>autorenew</span>
                  Checking…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>search</span>
                  Check Status
                </>
              )}
            </button>
          </form>

          {error && (
            <div style={{ background: '#ffdad6', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#93000a', textAlign: 'center', marginBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>error</span>
              {error}
            </div>
          )}

          {result && meta && (
            <div style={{ background: meta.bg, borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="material-symbols-outlined" style={{ color: meta.color, fontSize: 22 }}>{meta.icon}</span>
                <span style={{ color: meta.color, fontWeight: 800, fontSize: 14 }}>{meta.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#464555' }}>
                <strong>{result.schoolName}</strong> · submitted {new Date(result.createdAt).toLocaleDateString()}
              </p>
              {result.status === 'REJECTED' && result.rejectionReason && (
                <p style={{ margin: '8px 0 0 0', fontSize: 12.5, color: '#93000a' }}>Reason: {result.rejectionReason}</p>
              )}
              {result.status === 'APPROVED' && (
                <Link to="/login" style={{ display: 'inline-block', marginTop: 10, fontSize: 12.5, color: '#005338', fontWeight: 700, textDecoration: 'none' }}>
                  Go to Sign In →
                </Link>
              )}
            </div>
          )}

          {searched && !result && !error && !loading && (
            <p style={{ fontSize: 13, color: '#777587', textAlign: 'center' }}>No request found for that email.</p>
          )}

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Link to="/register" style={{ fontSize: 12, color: '#3525cd', fontWeight: 700, textDecoration: 'none' }}>
              ← Register a different school
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
