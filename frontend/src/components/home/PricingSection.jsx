import { useNavigate } from 'react-router-dom';
import SectionBadge from '../common/SectionBadge';

const PLANS = [
  {
    name: 'Starter',
    price: '₹999',
    sub: 'Up to 200 students',
    highlight: false,
    features: [
      { text: 'Student & teacher management', active: true  },
      { text: 'Live online classes',           active: true  },
      { text: 'Attendance tracking',           active: true  },
      { text: 'Advanced analytics',            active: false },
    ],
  },
  {
    name: 'Growth',
    price: '₹2,499',
    sub: 'Up to 1,000 students',
    highlight: true,
    badge: '⭐ Most Popular',
    features: [
      { text: 'Everything in Starter',   active: true },
      { text: 'Advanced analytics',       active: true },
      { text: 'WhatsApp notifications',   active: true },
      { text: 'PDF report cards',         active: true },
    ],
  },
  {
    name: 'Unlimited',
    price: '₹4,999',
    sub: 'No limits',
    highlight: false,
    features: [
      { text: 'Everything in Growth',    active: true },
      { text: 'Unlimited students',      active: true },
      { text: 'Priority support',        active: true },
      { text: 'Custom integrations',     active: true },
    ],
  },
];

export default function PricingSection() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 px-6" style={{ background: '#f8f9ff' }}>
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <div className="mb-4"><SectionBadge>Simple Pricing</SectionBadge></div>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-3">
            One Subscription,{' '}
            <span style={{ color: '#3525cd' }}>Full Access</span>
          </h2>
          <p className="text-on-surface-variant max-w-md mx-auto text-base" style={{ lineHeight: 1.7 }}>
            Schools subscribe and unlock access for all their staff and students. No per-user fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(({ name, price, sub, highlight, badge, features }) =>
            highlight ? (
              /* Highlighted Growth card */
              <div
                key={name}
                className="flex flex-col p-7 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg,#3525cd,#4f46e5)',
                  borderRadius: 16,
                  boxShadow: '0 20px 60px rgba(53,37,205,0.35)',
                }}
              >
                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
                {badge && (
                  <span className="tag mb-3 self-start" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    {badge}
                  </span>
                )}
                <div className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{name}</div>
                <div className="font-headline font-extrabold text-4xl text-white mb-1">
                  {price}<span className="text-base font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>/mo</span>
                </div>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>{sub}</p>
                <ul className="space-y-3 flex-1 mb-7 list-none p-0 m-0">
                  {features.map(({ text }) => (
                    <li key={text} className="flex items-center gap-2 text-sm text-white">
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#4edea3' }}>check_circle</span>
                      {text}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/login')}
                  style={{ background: '#fff', color: '#3525cd', border: 'none', borderRadius: 9999, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", width: '100%' }}
                >
                  Get Started →
                </button>
              </div>
            ) : (
              /* Standard card */
              <div key={name} className="card p-7 flex flex-col">
                <div className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">{name}</div>
                <div className="font-headline font-extrabold text-4xl text-on-surface mb-1">
                  {price}<span className="text-base text-on-surface-variant font-normal">/mo</span>
                </div>
                <p className="text-on-surface-variant text-sm mb-6">{sub}</p>
                <ul className="space-y-3 flex-1 mb-7 list-none p-0 m-0">
                  {features.map(({ text, active }) => (
                    <li key={text} className="flex items-center gap-2 text-sm">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16, color: active ? '#005338' : '#c7c4d8' }}
                      >
                        {active ? 'check_circle' : 'cancel'}
                      </span>
                      <span style={{ color: active ? '#0b1c30' : '#777587' }}>{text}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/login')} className="btn-outline w-full justify-center">
                  Get Started
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
