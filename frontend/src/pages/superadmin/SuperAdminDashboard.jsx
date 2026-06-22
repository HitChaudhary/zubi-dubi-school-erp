import { useEffect, useState, useCallback } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import {
  StatCard, Card, Badge, EmptyState, Spinner, ErrorBanner, SuccessBanner,
  Modal, PrimaryButton, FormField, inputStyle,
} from '../../components/dashboard/Widgets';
import { api } from '../../utils/api';

const NAV_ITEMS = [
  { id: 'overview', icon: 'dashboard', label: 'Overview' },
  { id: 'schools', icon: 'hub', label: 'Schools' },
  { id: 'subscriptions', icon: 'credit_card', label: 'Subscriptions' },
  { id: 'users', icon: 'group', label: 'All Users' },
];

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [schoolForm, setSchoolForm] = useState({ name: '', domain: '', adminName: '', adminEmail: '', adminPassword: '' });
  const [subForm, setSubForm] = useState({ schoolId: '', planName: 'Basic', status: 'ACTIVE', endDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const load = useCallback(async (tab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'overview') setStats((await api.get('/superadmin/stats')));
      if (tab === 'schools') setSchools((await api.get('/superadmin/schools')).schools);
      if (tab === 'subscriptions') setSubscriptions((await api.get('/superadmin/subscriptions')).subscriptions);
      if (tab === 'users') setUsers((await api.get('/superadmin/users')).users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/superadmin/schools', schoolForm);
      setShowSchoolModal(false);
      setSchoolForm({ name: '', domain: '', adminName: '', adminEmail: '', adminPassword: '' });
      flash('School created successfully.');
      load('schools');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchool = async (id) => {
    if (!confirm('Delete this school and all of its data? This cannot be undone.')) return;
    try {
      await api.del(`/superadmin/schools/${id}`);
      flash('School deleted.');
      load('schools');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/superadmin/subscriptions', subForm);
      setShowSubModal(false);
      setSubForm({ schoolId: '', planName: 'Basic', status: 'ACTIVE', endDate: '' });
      flash('Subscription created.');
      load('subscriptions');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSubStatus = async (sub) => {
    const next = sub.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE';
    try {
      await api.put(`/superadmin/subscriptions/${sub.id}`, { status: next });
      flash(`Subscription marked ${next}.`);
      load('subscriptions');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardShell brandLabel="Super Admin" navItems={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {activeTab === 'overview' && (
        <>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>System Overview</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Platform-wide metrics across every school on Zubi Dubi.</p>
          </div>
          {loading || !stats ? <Spinner /> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 24 }}>
                <StatCard icon="hub" color="#3525cd" label="Total Schools" value={stats.totalSchools} />
                <StatCard icon="credit_card" color="#25d366" label="Active Subscriptions" value={stats.activeSubscriptions} />
                <StatCard icon="group" color="#39b8fd" label="Total Users" value={stats.totalUsers} />
                <StatCard icon="video_call" color="#7b61ff" label="Total Meetings" value={stats.totalMeetings} />
                <StatCard icon="assignment" color="#ff9800" label="Total Assignments" value={stats.totalAssignments} />
              </div>
              <Card title="Users by Role">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                  {Object.entries(stats.roleCounts || {}).map(([role, count]) => (
                    <div key={role} style={{ padding: 16, background: '#f8f9ff', borderRadius: 10, textAlign: 'center' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: 24, fontWeight: 800, color: '#3525cd' }}>{count}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#777587', fontWeight: 600 }}>{role.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {activeTab === 'schools' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Schools</h1>
              <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Onboard schools and manage their tenancy.</p>
            </div>
            <PrimaryButton onClick={() => setShowSchoolModal(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              New School
            </PrimaryButton>
          </div>

          {loading ? <Spinner /> : schools.length === 0 ? <EmptyState icon="hub" message="No schools yet. Create the first one." /> : (
            <Card>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#777587', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '10px 12px' }}>School</th>
                      <th style={{ padding: '10px 12px' }}>Domain</th>
                      <th style={{ padding: '10px 12px' }}>Users</th>
                      <th style={{ padding: '10px 12px' }}>Subscription</th>
                      <th style={{ padding: '10px 12px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((s) => (
                      <tr key={s.id} style={{ borderTop: '1px solid #f0f2fb' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#0b1c30' }}>{s.name}</td>
                        <td style={{ padding: '12px', color: '#777587' }}>{s.domain || '—'}</td>
                        <td style={{ padding: '12px', color: '#464555' }}>{s.userCount}</td>
                        <td style={{ padding: '12px' }}>
                          {s.latestSubscription ? (
                            <Badge tone={s.latestSubscription.status === 'ACTIVE' ? 'success' : 'danger'}>
                              {s.latestSubscription.planName} · {s.latestSubscription.status}
                            </Badge>
                          ) : <Badge tone="neutral">No plan</Badge>}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteSchool(s.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ba1a1a' }}
                            title="Delete school"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Modal open={showSchoolModal} title="Create School" onClose={() => setShowSchoolModal(false)}>
            <form onSubmit={handleCreateSchool}>
              <FormField label="School Name">
                <input style={inputStyle} required value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} />
              </FormField>
              <FormField label="Domain (optional)">
                <input style={inputStyle} placeholder="myschool.edu" value={schoolForm.domain} onChange={(e) => setSchoolForm({ ...schoolForm, domain: e.target.value })} />
              </FormField>
              <p style={{ fontSize: 12, color: '#777587', fontWeight: 600, margin: '20px 0 10px' }}>OPTIONAL — CREATE THEIR FIRST ADMIN</p>
              <FormField label="Admin Name">
                <input style={inputStyle} value={schoolForm.adminName} onChange={(e) => setSchoolForm({ ...schoolForm, adminName: e.target.value })} />
              </FormField>
              <FormField label="Admin Email">
                <input type="email" style={inputStyle} value={schoolForm.adminEmail} onChange={(e) => setSchoolForm({ ...schoolForm, adminEmail: e.target.value })} />
              </FormField>
              <FormField label="Admin Password">
                <input type="password" style={inputStyle} value={schoolForm.adminPassword} onChange={(e) => setSchoolForm({ ...schoolForm, adminPassword: e.target.value })} />
              </FormField>
              <PrimaryButton type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {submitting ? 'Creating…' : 'Create School'}
              </PrimaryButton>
            </form>
          </Modal>
        </>
      )}

      {activeTab === 'subscriptions' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Subscriptions</h1>
              <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Track plans and billing status per school.</p>
            </div>
            <PrimaryButton onClick={() => setShowSubModal(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              New Subscription
            </PrimaryButton>
          </div>

          {loading ? <Spinner /> : subscriptions.length === 0 ? <EmptyState icon="credit_card" message="No subscriptions yet." /> : (
            <Card>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#777587', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '10px 12px' }}>School</th>
                      <th style={{ padding: '10px 12px' }}>Plan</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Ends</th>
                      <th style={{ padding: '10px 12px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((s) => (
                      <tr key={s.id} style={{ borderTop: '1px solid #f0f2fb' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#0b1c30' }}>{s.school?.name}</td>
                        <td style={{ padding: '12px', color: '#464555' }}>{s.planName}</td>
                        <td style={{ padding: '12px' }}>
                          <Badge tone={s.status === 'ACTIVE' ? 'success' : s.status === 'EXPIRED' ? 'warning' : 'danger'}>{s.status}</Badge>
                        </td>
                        <td style={{ padding: '12px', color: '#777587' }}>{new Date(s.endDate).toLocaleDateString()}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleToggleSubStatus(s)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3525cd', fontSize: 12, fontWeight: 700 }}
                          >
                            {s.status === 'ACTIVE' ? 'Cancel' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Modal open={showSubModal} title="New Subscription" onClose={() => setShowSubModal(false)}>
            <form onSubmit={handleCreateSubscription}>
              <FormField label="School">
                <select style={inputStyle} required value={subForm.schoolId} onChange={(e) => setSubForm({ ...subForm, schoolId: e.target.value })}>
                  <option value="" disabled>Select a school…</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </FormField>
              <FormField label="Plan Name">
                <select style={inputStyle} value={subForm.planName} onChange={(e) => setSubForm({ ...subForm, planName: e.target.value })}>
                  <option>Basic</option>
                  <option>Pro</option>
                  <option>Enterprise</option>
                </select>
              </FormField>
              <FormField label="Ends On">
                <input type="date" style={inputStyle} required value={subForm.endDate} onChange={(e) => setSubForm({ ...subForm, endDate: e.target.value })} />
              </FormField>
              <PrimaryButton type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {submitting ? 'Saving…' : 'Create Subscription'}
              </PrimaryButton>
            </form>
          </Modal>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>All Users</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Every account across every school on the platform.</p>
          </div>
          {loading ? <Spinner /> : users.length === 0 ? <EmptyState icon="group" message="No users found." /> : (
            <Card>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#777587', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '10px 12px' }}>Name</th>
                      <th style={{ padding: '10px 12px' }}>Email</th>
                      <th style={{ padding: '10px 12px' }}>Role</th>
                      <th style={{ padding: '10px 12px' }}>School</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderTop: '1px solid #f0f2fb' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#0b1c30' }}>{u.name}</td>
                        <td style={{ padding: '12px', color: '#777587' }}>{u.email}</td>
                        <td style={{ padding: '12px' }}><Badge tone="primary">{u.role.replace('_', ' ')}</Badge></td>
                        <td style={{ padding: '12px', color: '#464555' }}>{u.school?.name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </DashboardShell>
  );
}
