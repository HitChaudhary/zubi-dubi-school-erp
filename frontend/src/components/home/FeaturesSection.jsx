import SectionBadge from '../common/SectionBadge';

const FEATURES = [
  {
    icon: 'school',
    iconBg: '#e2dfff',
    iconColor: '#3525cd',
    title: 'Academic Management',
    desc: 'Manage students, teachers, classes, sections and subjects — all from a single panel.',
    items: [
      'Student enrollment & profiles',
      'Teacher assignment by subject',
      'Class & section management',
    ],
  },
  {
    icon: 'video_call',
    iconBg: '#c9e6ff',
    iconColor: '#006591',
    title: 'Learning Management',
    desc: 'Conduct live classes, manage assignments, upload study materials and track exam results.',
    items: [
      'HD live online classes',
      'Assignment submission & grading',
      'Exams, results & report cards',
    ],
  },
  {
    icon: 'analytics',
    iconBg: 'rgba(111,251,190,0.18)',
    iconColor: '#005338',
    title: 'Administration',
    desc: 'Streamline school operations with attendance tracking, announcements, and deep analytics.',
    items: [
      'Daily attendance tracking',
      'School-wide announcements',
      'Reports & performance analytics',
    ],
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6" style={{ background: '#f8f9ff' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-4"><SectionBadge>Everything You Need</SectionBadge></div>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-4">
            Powerful Features for{' '}
            <span style={{ color: '#3525cd' }}>Modern Schools</span>
          </h2>
          <p className="text-on-surface-variant text-base max-w-lg mx-auto" style={{ lineHeight: 1.8 }}>
            Everything your school needs — from admissions to analytics — in one seamless
            subscription platform.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, iconBg, iconColor, title, desc, items }) => (
            <div key={title} className="card p-6">
              <div
                className="feature-icon-wrap mb-4"
                style={{ background: iconBg }}
              >
                <span className="material-symbols-outlined" style={{ color: iconColor }}>{icon}</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">{title}</h3>
              <p className="text-on-surface-variant text-sm mb-4" style={{ lineHeight: 1.7 }}>{desc}</p>
              <ul className="space-y-2 list-none p-0 m-0">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#4edea3' }}>check</span>
                    {item}
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
