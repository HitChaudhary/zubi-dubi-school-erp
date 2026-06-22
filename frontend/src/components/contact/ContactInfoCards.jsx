const INFO = [
  {
    icon: 'mail',
    iconBg: '#e2dfff',
    iconColor: '#3525cd',
    label: 'Email',
    value: 'hello@zubidubi.in',
  },
  {
    icon: 'phone',
    iconBg: '#c9e6ff',
    iconColor: '#006591',
    label: 'Phone / WhatsApp',
    value: '+91 98765 43210',
  },
  {
    icon: 'location_on',
    iconBg: 'rgba(111,251,190,0.18)',
    iconColor: '#005338',
    label: 'Office',
    value: 'Ahmedabad, Gujarat, India',
  },
];

export default function ContactInfoCards({ onBookDemo }) {
  return (
    <div>
      <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">
        Contact Information
      </h2>
      <p className="text-on-surface-variant mb-8 text-sm" style={{ lineHeight: 1.7 }}>
        Our team typically responds within 2 hours on working days (Mon–Sat, 9 am–6 pm IST).
      </p>

      <div className="space-y-4 mb-10">
        {INFO.map(({ icon, iconBg, iconColor, label, value }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className="feature-icon-wrap" style={{ background: iconBg }}>
              <span className="material-symbols-outlined" style={{ color: iconColor }}>{icon}</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-sm font-bold text-on-surface">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Demo card */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0f0a2e,#1e1470)',
          borderRadius: 16, padding: 24,
        }}
      >
        <h4 className="font-headline font-bold text-white mb-3">Need a quick demo?</h4>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.7 }}>
          Book a 30-minute video call and we'll walk you through the entire platform live.
        </p>
        <button
          onClick={onBookDemo}
          style={{
            background: '#c3c0ff', color: '#0f0069',
            border: 'none', borderRadius: 9999,
            padding: '10px 22px', fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: 13,
          }}
        >
          Book Free Demo →
        </button>
      </div>
    </div>
  );
}
