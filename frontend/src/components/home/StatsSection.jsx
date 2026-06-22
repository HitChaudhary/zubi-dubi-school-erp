const STATS = [
  { value: '100+', label: 'Schools'           },
  { value: '10K+', label: 'Students'          },
  { value: '500+', label: 'Teachers'          },
  { value: '50K+', label: 'Classes Conducted' },
];

export default function StatsSection() {
  return (
    <section
      className="py-24 px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#0f0a2e 0%,#1e1470 50%,#0c3b68 100%)' }}
    >
      {/* Decorative blob */}
      <div
        className="blob"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 600, height: 600,
          background: 'rgba(79,70,229,0.1)',
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="font-headline font-extrabold text-3xl text-white mb-3">
            Trusted by Schools Across India
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
            Join thousands of educators already transforming education with Zubi Dubi
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {STATS.map(({ value, label }) => (
            <div key={label} className="stat-card">
              <div
                className="font-headline font-extrabold text-4xl text-white mb-1"
              >
                {value}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
