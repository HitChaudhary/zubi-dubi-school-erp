import SectionBadge from '../common/SectionBadge';

const TEAM = [
  { initials: 'AR', name: 'Arjun Rathod',  role: 'CEO & Co-Founder',    tagLabel: 'Product',     avatarFrom: '#e2dfff', avatarTo: '#c3c0ff', textColor: '#3525cd', tagBg: '#e2dfff', tagColor: '#3525cd' },
  { initials: 'PS', name: 'Priya Shah',    role: 'CTO & Co-Founder',    tagLabel: 'Engineering', avatarFrom: '#c9e6ff', avatarTo: '#89ceff', textColor: '#006591', tagBg: '#c9e6ff', tagColor: '#006591' },
  { initials: 'MK', name: 'Meera Kumar',   role: 'Head of Design',      tagLabel: 'Design',      avatarFrom: 'rgba(111,251,190,0.25)', avatarTo: 'rgba(78,222,163,0.37)', textColor: '#005338', tagBg: 'rgba(111,251,190,0.18)', tagColor: '#005338' },
  { initials: 'RV', name: 'Rohan Verma',   role: 'Head of Growth',      tagLabel: 'Growth',      avatarFrom: '#ffdad6', avatarTo: '#ffb4ab', textColor: '#ba1a1a', tagBg: '#ffdad6', tagColor: '#ba1a1a' },
];

export default function TeamSection() {
  return (
    <section className="py-24 px-6" style={{ background: '#f8f9ff' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="mb-4"><SectionBadge>The Team</SectionBadge></div>
          <h2 className="font-headline font-extrabold text-3xl text-on-surface">
            People behind <span style={{ color: '#3525cd' }}>Zubi Dubi</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map(({ initials, name, role, tagLabel, avatarFrom, avatarTo, textColor, tagBg, tagColor }) => (
            <div key={name} className="card p-6 text-center">
              <div
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: `linear-gradient(135deg,${avatarFrom},${avatarTo})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '1.5rem', fontWeight: 800,
                  color: textColor,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                {initials}
              </div>
              <h4 className="font-headline font-bold text-base text-on-surface">{name}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{role}</p>
              <div className="flex justify-center mt-3">
                <span className="tag" style={{ background: tagBg, color: tagColor }}>{tagLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
