const ROLES = [
  { id: 'admin',      icon: 'admin_panel_settings', label: 'School Admin' },
  { id: 'teacher',    icon: 'person_book',           label: 'Teacher'      },
  { id: 'student',    icon: 'school',                label: 'Student'      },
  { id: 'superadmin', icon: 'manage_accounts',       label: 'Super Admin'  },
];

export default function RoleSelector({ selected, onChange }) {
  return (
    <div className="mb-6">
      <label className="form-label mb-3 block">Sign in as</label>
      <div className="grid grid-cols-2 gap-2">
        {ROLES.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`role-btn${selected === id ? ' active-role' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
