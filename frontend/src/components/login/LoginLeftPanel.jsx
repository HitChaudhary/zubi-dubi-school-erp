import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: 'video_call',  iconColor: '#c3c0ff', bg: 'rgba(195,192,255,0.15)', title: 'Live Online Classes',  sub: 'HD video with screen sharing'  },
  { icon: 'fact_check',  iconColor: '#89ceff', bg: 'rgba(137,206,255,0.15)', title: 'Smart Attendance',     sub: 'One tap mark, auto reports'     },
  { icon: 'analytics',   iconColor: '#4edea3', bg: 'rgba(78,222,163,0.15)',  title: 'Real-time Analytics',  sub: 'Instant insights for admins'    },
];

export default function LoginLeftPanel() {
  return (
    <div
      className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden"
      style={{ width: 480, flexShrink: 0, background: 'linear-gradient(160deg,#0f0a2e 0%,#1e1470 60%,#0c3b68 100%)' }}
    >
      {/* Blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, background: 'rgba(53,37,205,0.2)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 350, height: 350, background: 'rgba(57,184,253,0.1)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline mb-16">
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#3525cd,#39b8fd)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>school</span>
          </div>
          <span className="font-headline font-extrabold text-xl" style={{ color: '#c3c0ff' }}>Zubi Dubi</span>
        </Link>

        <h2 className="font-headline font-extrabold text-white mb-4" style={{ fontSize: '1.8rem', lineHeight: 1.3 }}>
          Your school,<br />fully digital.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.95rem' }}>
          Manage classes, attendance, assignments and live sessions — all in one place.
        </p>

        <div className="mt-12 space-y-4">
          {FEATURES.map(({ icon, iconColor, bg, title, sub }) => (
            <div
              key={title}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: 16,
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ width: 40, height: 40, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: 20 }}>{icon}</span>
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>{title}</p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', position: 'relative' }}>
        © 2024 Zubi Dubi. All rights reserved.
      </p>
    </div>
  );
}
