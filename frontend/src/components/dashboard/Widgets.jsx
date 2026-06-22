// A handful of tiny, reusable presentational pieces shared by every dashboard.

export function StatCard({ icon, color, label, value }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e5eeff', borderRadius: 12, padding: 24 }}>
      <span className="material-symbols-outlined" style={{ color, marginBottom: 12, fontSize: 24 }}>{icon}</span>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 13, color: '#777587', fontWeight: 600 }}>{label}</h3>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#0b1c30' }}>{value}</p>
    </div>
  );
}

export function Card({ title, action, children }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e5eeff', borderRadius: 12, padding: 24 }}>
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          {title && <h2 style={{ fontSize: 17, color: '#0b1c30', fontWeight: 700, margin: 0 }}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: { bg: '#e5eeff', color: '#464555' },
    primary: { bg: '#e2dfff', color: '#3525cd' },
    success: { bg: '#e1f5ee', color: '#005338' },
    warning: { bg: '#fff3cd', color: '#7a5b00' },
    danger: { bg: '#ffdad6', color: '#93000a' },
    info: { bg: '#d9f1ff', color: '#004666' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '4px 10px',
        borderRadius: 999, background: t.bg, color: t.color, whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

export function EmptyState({ icon = 'inbox', message = 'Nothing here yet.' }) {
  return (
    <div style={{ color: '#777587', padding: '40px 0', textAlign: 'center', border: '2px dashed #e5eeff', borderRadius: 8, fontSize: 14 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 28, display: 'block', marginBottom: 8, color: '#c7c4d8' }}>{icon}</span>
      {message}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '40px 0', color: '#777587', fontSize: 13 }}>
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>autorenew</span>
      {label}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ background: '#ffdad6', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#93000a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
      {message}
    </div>
  );
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ background: '#e1f5ee', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#005338', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
      {message}
    </div>
  );
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(11,28,48,0.45)', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0b1c30' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#777587', display: 'flex' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13.5,
        borderRadius: 999, background: '#3525cd', color: '#fff', border: 'none', cursor: 'pointer',
        padding: '10px 20px', opacity: props.disabled ? 0.6 : 1, ...props.style,
      }}
    >
      {children}
    </button>
  );
}

export function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#464555', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width: '100%', border: '1px solid #c7c4d8', borderRadius: 8, padding: '10px 12px',
  fontSize: 14, fontFamily: 'Inter, sans-serif', background: '#fff', color: '#0b1c30', outline: 'none',
};
