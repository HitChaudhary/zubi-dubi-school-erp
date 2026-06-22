export default function SectionBadge({ children, light = false }) {
  return (
    <span
      className="section-badge"
      style={
        light
          ? { background: 'rgba(195,192,255,0.15)', color: '#c3c0ff' }
          : {}
      }
    >
      {children}
    </span>
  );
}
