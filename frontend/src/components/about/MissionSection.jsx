import SectionBadge from '../common/SectionBadge';

const VALUES = [
  {
    icon: 'visibility',
    iconBg: '#e2dfff',
    iconColor: '#3525cd',
    title: 'Our Vision',
    desc: 'A future where every school in India operates with the efficiency of a Fortune 500 company — without the complexity or cost.',
  },
  {
    icon: 'favorite',
    iconBg: '#c9e6ff',
    iconColor: '#006591',
    title: 'Our Values',
    desc: 'Simplicity first. Build for real users, not demos. Be affordable. Ship fast. Listen to teachers and students constantly.',
  },
  {
    icon: 'groups',
    iconBg: 'rgba(111,251,190,0.18)',
    iconColor: '#005338',
    title: 'Our Commitment',
    desc: '24/7 support in Hindi and English. Every school gets a dedicated onboarding. No hidden charges, ever.',
  },
];

export default function MissionSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Left copy */}
          <div>
            <div className="mb-5"><SectionBadge>Our Mission</SectionBadge></div>
            <h2 className="font-headline font-extrabold text-3xl text-on-surface mb-5">
              Making quality school software{' '}
              <span style={{ color: '#3525cd' }}>accessible to every school</span>
            </h2>
            <p className="text-on-surface-variant mb-5" style={{ lineHeight: 1.85 }}>
              We believe every school — whether it's a 50-student rural school or a
              5,000-student urban institution — deserves world-class digital infrastructure.
            </p>
            <p className="text-on-surface-variant mb-8" style={{ lineHeight: 1.85 }}>
              Zubi Dubi is built mobile-first, works on slow internet, supports WhatsApp
              notifications, and is priced for the Indian market. We don't just build
              software — we build tools that actually get used.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div style={{ background: '#e2dfff', borderRadius: 12, padding: 20 }}>
                <div className="font-headline font-extrabold text-2xl" style={{ color: '#3525cd' }}>2023</div>
                <div className="text-sm text-on-surface-variant">Founded</div>
              </div>
              <div style={{ background: '#c9e6ff', borderRadius: 12, padding: 20 }}>
                <div className="font-headline font-extrabold text-2xl" style={{ color: '#006591' }}>India</div>
                <div className="text-sm text-on-surface-variant">Headquartered</div>
              </div>
            </div>
          </div>

          {/* Right value cards */}
          <div className="space-y-5">
            {VALUES.map(({ icon, iconBg, iconColor, title, desc }) => (
              <div key={title} className="card p-6 flex items-start gap-4">
                <div className="feature-icon-wrap flex-shrink-0" style={{ background: iconBg }}>
                  <span className="material-symbols-outlined" style={{ color: iconColor }}>{icon}</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-surface mb-1">{title}</h4>
                  <p className="text-sm text-on-surface-variant" style={{ lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
