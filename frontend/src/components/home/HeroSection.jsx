import { useNavigate } from 'react-router-dom';
import SectionBadge from '../common/SectionBadge';
import SplitText from '../effects/SplitText';

const BARS = [
  { label: 'Active Students',        value: '2,840', pct: 84, color: '#c3c0ff' },
  { label: 'Classes Today',           value: '47',    pct: 62, color: '#89ceff' },
  { label: 'Assignments Submitted',   value: '128',   pct: 45, color: '#4edea3' },
  { label: 'Attendance Rate',         value: '94.2%', pct: 94, color: '#fbbf24' },
];

const TRUST_BADGES = [
  { icon: 'check_circle', label: '100+ Schools'      },
  { icon: 'check_circle', label: '10,000+ Students'  },
  { icon: 'check_circle', label: 'No Credit Card'    },
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      className="hero-bg min-h-screen flex items-center pt-20 relative overflow-hidden"
    >
      {/* Blobs */}
      <div className="blob" style={{ top: '-10%', right: '-5%',  width: 600, height: 600, background: 'rgba(53,37,205,0.2)' }} />
      <div className="blob" style={{ bottom: '-10%', left: '-5%', width: 500, height: 500, background: 'rgba(57,184,253,0.15)', animationDelay: '-4s', animationDuration: '15s' }} />

      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* ── Left copy ───────────────────── */}
          <div className="flex-1 min-w-0 animate-fade-up">
            <div className="mb-6">
              <SectionBadge light>✨ Smart School ERP &amp; Online Learning Platform</SectionBadge>
            </div>

            <h1
              className="font-headline font-extrabold leading-tight text-white mb-6"
              style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}
            >
              <SplitText text="Manage Your Entire" tag="span" />
              <br />
              <span
                className="animate-fade-up"
                style={{
                  display: 'inline-block',
                  animationDelay: '0.9s',
                  background: 'linear-gradient(135deg,#c3c0ff,#89ceff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                School with Zubi Dubi
              </span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 500, marginBottom: '2.5rem' }}>
              One platform for Students, Teachers, Administrators, Online Classes, Attendance,
              Assignments, and full Academic Management — all in one place.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <button
                className="btn-primary"
                style={{ boxShadow: '0 8px 32px rgba(53,37,205,0.45)' }}
                onClick={() => navigate('/login')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
                Start Free Trial
              </button>
              <button
                className="btn-outline"
                style={{ color: '#c3c0ff', borderColor: 'rgba(195,192,255,0.5)' }}
                onClick={() => navigate('/contact')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
                Request Demo
              </button>
            </div>

            <div className="flex flex-wrap gap-6">
              {TRUST_BADGES.map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#4edea3' }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right dashboard mockup ───────── */}
          <div className="animate-float lg:w-[420px] w-full max-w-sm mx-auto lg:mx-0">
            <div
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20,
                padding: 24,
                backdropFilter: 'blur(20px)',
                position: 'relative',
              }}
            >
              {/* Header row */}
              <div className="flex justify-between items-center mb-5">
                <span className="font-headline font-bold text-white text-sm">📊 School Dashboard</span>
                <span className="tag" style={{ background: '#006e4b', color: '#67f4b7' }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 animate-pulse-dot" style={{ background: '#67f4b7', verticalAlign: 'middle' }} />
                  LIVE
                </span>
              </div>

              {/* Stat bars */}
              <div className="space-y-4">
                {BARS.map(({ label, value, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span>{label}</span>
                      <span className="font-bold text-white">{value}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 10 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating badge top-right */}
              <div style={{
                position: 'absolute', top: -18, right: -20,
                background: 'linear-gradient(135deg,#3525cd,#4f46e5)',
                borderRadius: 14, padding: '10px 16px',
                boxShadow: '0 8px 32px rgba(53,37,205,0.5)',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Live Class</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>🎥 In Progress</div>
              </div>

              {/* Floating badge bottom-left */}
              <div style={{
                position: 'absolute', bottom: -18, left: -20,
                background: 'linear-gradient(135deg,#005338,#006e4b)',
                borderRadius: 14, padding: '10px 16px',
                boxShadow: '0 8px 32px rgba(0,110,75,0.5)',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>New Submission</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>📝 +34 Today</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
