import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features',  to: '/#features' },
    { label: 'Pricing',   to: '/#pricing'  },
    { label: 'Changelog', to: '#'          },
  ],
  Company: [
    { label: 'About',   to: '/about'   },
    { label: 'Contact', to: '/contact' },
    { label: 'Careers', to: '#'        },
  ],
  Legal: [
    { label: 'Privacy Policy',   to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: '#0b1c30', padding: '3rem 1.5rem 2rem' }}>
      <div className="max-w-7xl mx-auto">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 no-underline mb-4">
              <div
                className="flex items-center justify-center"
                style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#3525cd,#39b8fd)', borderRadius: 8 }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>school</span>
              </div>
              <span className="font-headline font-extrabold text-lg" style={{ color: '#c3c0ff' }}>Zubi Dubi</span>
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Simplifying Education Through Technology.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                {title}
              </p>
              <ul className="space-y-2 list-none p-0 m-0">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="no-underline transition-colors duration-200 hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem' }}>
            © 2024 Zubi Dubi — Simplifying Education Through Technology. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
