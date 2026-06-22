import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';

/**
 * Shared chrome for every dashboard: branded top bar with the signed-in user
 * + logout, and a left sidebar of tabs. Each dashboard page supplies its own
 * `navItems` (icon/label/id) and renders tab content as `children`.
 */
export default function DashboardShell({ brandLabel, navItems, activeTab, onTabChange, children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null') || { name: 'User', role: '' };

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f9ff', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col"
        style={{ width: 240, flexShrink: 0, background: '#fff', borderRight: '1.5px solid #e5eeff', minHeight: '100vh' }}
      >
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg,#3525cd,#39b8fd)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>school</span>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#3525cd', lineHeight: 1.2 }}>Zubi Dubi</p>
            <p style={{ margin: 0, fontSize: 11, color: '#777587' }}>{brandLabel}</p>
          </div>
        </div>

        <nav style={{ padding: '12px', flex: 1 }}>
          {navItems.map(({ id, icon, label }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', marginBottom: 4, borderRadius: 10, border: 'none',
                  cursor: 'pointer', fontSize: 13.5, fontWeight: 600, textAlign: 'left',
                  background: active ? '#e2dfff' : 'transparent',
                  color: active ? '#3525cd' : '#464555',
                  transition: 'background 0.15s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
                {label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: 16, borderTop: '1.5px solid #e5eeff' }}>
          <button
            onClick={() => logout(navigate)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, background: '#ffdad6', color: '#93000a',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            background: '#fff', borderBottom: '1.5px solid #e5eeff', padding: '14px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          }}
        >
          <div className="flex md:hidden items-center gap-2">
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#3525cd,#39b8fd)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>school</span>
            </div>
            <span style={{ fontWeight: 800, color: '#3525cd', fontSize: 14 }}>Zubi Dubi</span>
          </div>
          <span style={{ fontSize: 14, color: '#0b1c30', fontWeight: 700 }} className="hidden md:inline">
            {navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%', background: '#e2dfff', color: '#3525cd',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13,
              }}
            >
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: '#0b1c30', fontWeight: 600 }} className="hidden sm:inline">
              {user.name}
            </span>
          </div>
        </header>

        {/* Mobile tab strip */}
        <div className="flex md:hidden" style={{ overflowX: 'auto', background: '#fff', borderBottom: '1.5px solid #e5eeff', padding: '8px 12px', gap: 8 }}>
          {navItems.map(({ id, icon, label }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontSize: 12.5, fontWeight: 700,
                  background: active ? '#e2dfff' : '#f8f9ff',
                  color: active ? '#3525cd' : '#464555',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                {label}
              </button>
            );
          })}
        </div>

        <main style={{ padding: '28px max(4%, 16px)', maxWidth: 1280, margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
