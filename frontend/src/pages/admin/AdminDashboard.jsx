import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Retrieve user details stored during login
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Admin', role: 'ADMIN' };

  const handleLogout = () => {
    localStorage.clear(); // Wipe tokens
    navigate('/login');   // Bounce back to login page
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8f9ff', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1.5px solid #e5eeff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#3525cd,#39b8fd)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>school</span>
          </div>
          <span className="font-extrabold text-lg" style={{ color: '#3525cd', fontWeight: 800 }}>Zubi Dubi Admin</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: '#0b1c30', fontWeight: 600 }}>Welcome, {user.name} ({user.role})</span>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 16px', background: '#ffdad6', color: '#93000a', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ padding: '40px max(4%, 20px)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, color: '#0b1c30', fontWeight: 800, margin: '0 0 8px 0' }}>Control Center</h1>
          <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Manage school parameters, registrations, and engine performance metrics.</p>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
          <div style={{ background: '#fff', border: '1.5px solid #e5eeff', borderRadius: 12, padding: 24 }}>
            <span className="material-symbols-outlined" style={{ color: '#3525cd', marginBottom: 12 }}>hub</span>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#777587' }}>Total Institutions</h3>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#0b1c30' }}>12</p>
          </div>
          
          <div style={{ background: '#fff', border: '1.5px solid #e5eeff', borderRadius: 12, padding: 24 }}>
            <span className="material-symbols-outlined" style={{ color: '#25d366', marginBottom: 12 }}>credit_card</span>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#777587' }}>Active Premium Plans</h3>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#0b1c30' }}>9</p>
          </div>

          <div style={{ background: '#fff', border: '1.5px solid #e5eeff', borderRadius: 12, padding: 24 }}>
            <span className="material-symbols-outlined" style={{ color: '#39b8fd', marginBottom: 12 }}>group</span>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#777587' }}>System Users</h3>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#0b1c30' }}>1,420</p>
          </div>
        </div>

        {/* Placeholder Table for Management */}
        <div style={{ background: '#fff', border: '1.5px solid #e5eeff', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, color: '#0b1c30', marginBottom: 16, fontWeight: 700 }}>Registered Entities</h2>
          <div style={{ color: '#777587', padding: '40px 0', textAlign: 'center', border: '2px dashed #e5eeff', borderRadius: 8, fontSize: 14 }}>
            School administration and system metrics display data arrays here.
          </div>
        </div>
      </main>
    </div>
  );
}