const STATS = [
  { value: '100+',  label: 'Partner Schools'   },
  { value: '₹4Cr+', label: 'Saved by Schools'  },
  { value: '98%',   label: 'Retention Rate'    },
  { value: '4.9★',  label: 'Avg School Rating' },
];

export default function AboutStatsSection() {
  return (
    <section
      className="py-20 px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#0f0a2e,#1e1470,#0c3b68)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {STATS.map(({ value, label }) => (
            <div key={label} className="stat-card">
              <div className="font-headline font-extrabold text-3xl text-white mb-1">{value}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
