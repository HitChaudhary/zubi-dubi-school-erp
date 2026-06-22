import SectionBadge from '../common/SectionBadge';

const ROLES = [
  {
    emoji: '👑',
    title: 'Super Admin',
    borderColor: '#3525cd',
    chevronColor: '#3525cd',
    perks: ['Manage all schools', 'Subscription plans', 'Platform analytics'],
  },
  {
    emoji: '🏫',
    title: 'School Admin',
    borderColor: '#006591',
    chevronColor: '#006591',
    perks: ['Manage teachers', 'Manage students', 'School operations'],
  },
  {
    emoji: '👨‍🏫',
    title: 'Teacher',
    borderColor: '#005338',
    chevronColor: '#005338',
    perks: ['Conduct live classes', 'Upload assignments', 'Mark attendance'],
  },
  {
    emoji: '🎓',
    title: 'Student',
    borderColor: '#006591',
    chevronColor: '#006591',
    perks: ['Join live classes', 'Submit assignments', 'View results'],
  },
];

export default function UserRolesSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <div className="mb-4"><SectionBadge>For Every Role</SectionBadge></div>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">
            Designed for{' '}
            <span style={{ color: '#3525cd' }}>Everyone</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {ROLES.map(({ emoji, title, borderColor, chevronColor, perks }) => (
            <div
              key={title}
              className="card p-6"
              style={{ borderTop: `3px solid ${borderColor}` }}
            >
              <div
                className="feature-icon-wrap mb-4"
                style={{ background: '#e2dfff', fontSize: 24 }}
              >
                {emoji}
              </div>
              <h4 className="font-headline font-bold text-base text-on-surface mb-3">{title}</h4>
              <ul className="space-y-2 list-none p-0 m-0">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-1 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: chevronColor }}>
                      chevron_right
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
