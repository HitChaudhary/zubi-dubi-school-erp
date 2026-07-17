import { useEffect, useState, useCallback } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import {
  StatCard, Card, Badge, EmptyState, Spinner, ErrorBanner, SuccessBanner,
  Modal, PrimaryButton, FormField, inputStyle,
} from '../../components/dashboard/Widgets';
import { api } from '../../utils/api';

const NAV_ITEMS = [
  { id: 'overview',    icon: 'dashboard',   label: 'Overview'        },
  { id: 'users',       icon: 'group',       label: 'Staff & Students'},
  { id: 'attendance',  icon: 'fact_check',  label: 'Attendance'      },
  { id: 'meetings',    icon: 'video_call',  label: 'Meetings'        },
  { id: 'assignments', icon: 'assignment',  label: 'Assignments'     },
  { id: 'settings',    icon: 'settings',    label: 'School Settings' },
];

const smallBtn = {
  padding: '7px 14px', borderRadius: 8, border: 'none',
  cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
};

const TODAY = new Date().toISOString().split('T')[0];

export default function AdminDashboard() {
  const [activeTab,   setActiveTab]   = useState('overview');
  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [userFilter,  setUserFilter]  = useState('TEACHER');
  const [userStandardFilter, setUserStandardFilter] = useState(''); // class filter, STUDENT view only loads on demand
  const [meetings,    setMeetings]    = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [school,      setSchool]      = useState(null);
  const [schoolForm,  setSchoolForm]  = useState({ name: '', domain: '' });
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  // User modal — now includes rollNo and standard for students
  const [userModal, setUserModal] = useState(null);

  // Meeting modal
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: '', meetingLink: '', startTime: '', standard: '' });

  // Assignment modal
  const [showAssignmentModal, setShowAssignmentModal]   = useState(false);
  const [assignmentForm, setAssignmentForm]             = useState({ title: '', description: '', fileUrl: '', dueDate: '' });
  const [gradingAssignment, setGradingAssignment]       = useState(null);
  const [submissions, setSubmissions]                   = useState([]);
  const [submissionsLoading, setSubmissionsLoading]     = useState(false);
  const [gradeDrafts, setGradeDrafts]                   = useState({});

  // Attendance oversight
  const [attStandard, setAttStandard]   = useState('');
  const [attDate,     setAttDate]       = useState(TODAY);
  const [attRecords,  setAttRecords]    = useState([]);
  const [attLoading,  setAttLoading]    = useState(false);
  const [teacherAtt,        setTeacherAtt]        = useState([]);
  const [teacherAttLoading, setTeacherAttLoading] = useState(false);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const load = useCallback(async (tab, filter) => {
    setLoading(true); setError('');
    try {
      if (tab === 'overview')    setStats(await api.get('/admin/stats'));
      if (tab === 'users') {
        if (filter === 'STUDENT') {
          // Class-wise lazy load: students are only fetched when the admin
          // explicitly loads a class (via loadStudentsByClass), not here.
          setUsers([]);
        } else {
          setUsers((await api.get(`/admin/users?role=${filter}`)).users);
        }
      }
      if (tab === 'meetings')    setMeetings((await api.get('/admin/meetings')).meetings);
      if (tab === 'assignments') setAssignments((await api.get('/admin/assignments')).assignments);
      if (tab === 'settings') {
        const data = await api.get('/admin/school');
        setSchool(data.school);
        setSchoolForm({ name: data.school.name, domain: data.school.domain || '' });
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(activeTab, userFilter); }, [activeTab, userFilter, load]);

  // Fetch students for one class, only when the admin explicitly asks.
  const loadStudentsByClass = async () => {
    if (!userStandardFilter) return;
    setLoading(true); setError('');
    try {
      const { users: list } = await api.get(`/admin/users?role=STUDENT&standard=${encodeURIComponent(userStandardFilter)}`);
      setUsers(list);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Attendance oversight ─────────────────────────────────
  const loadAttendance = async () => {
    setAttLoading(true); setError('');
    try {
      const params = new URLSearchParams({ date: attDate });
      if (attStandard) params.append('standard', attStandard);
      const { records } = await api.get(`/admin/attendance?${params}`);
      setAttRecords(records);
    } catch (err) { setError(err.message); }
    finally { setAttLoading(false); }
  };

  // Which teachers checked themselves in for a given date — resets naturally
  // each day since it's just querying that day's rows.
  const loadTeacherAttendance = async () => {
    setTeacherAttLoading(true); setError('');
    try {
      const { teacherAttendance } = await api.get(`/admin/teacher-attendance?date=${attDate}`);
      setTeacherAtt(teacherAttendance);
    } catch (err) { setError(err.message); }
    finally { setTeacherAttLoading(false); }
  };

  // Refresh whatever the users tab is currently showing. For STUDENT view this
  // re-runs the class-scoped fetch (if a class is selected) instead of the
  // generic load(), which would otherwise reset the list back to empty.
  const refreshUsers = () => {
    if (userFilter === 'STUDENT') {
      if (userStandardFilter) loadStudentsByClass();
    } else {
      load('users', userFilter);
    }
  };

  // ── Users ────────────────────────────────────────────────
  const handleSaveUser = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      if (userModal.mode === 'create') {
        await api.post('/admin/users', userModal.data);
        flash(`${userModal.data.role === 'TEACHER' ? 'Teacher' : 'Student'} added.`);
      } else {
        const payload = { name: userModal.data.name, email: userModal.data.email,
          rollNo: userModal.data.rollNo || null, standard: userModal.data.standard || null };
        if (userModal.data.password) payload.password = userModal.data.password;
        await api.put(`/admin/users/${userModal.data.id}`, payload);
        flash('User updated.');
      }
      setUserModal(null);
      refreshUsers();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Remove this user from your school?')) return;
    try { await api.del(`/admin/users/${id}`); flash('User removed.'); refreshUsers(); }
    catch (err) { setError(err.message); }
  };

  // ── Meetings ─────────────────────────────────────────────
  const handleCreateMeeting = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await api.post('/admin/meetings', meetingForm);
      setShowMeetingModal(false);
      setMeetingForm({ title: '', meetingLink: '', startTime: '', standard: '' });
      flash('Meeting scheduled.'); load('meetings');
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const updateMeetingStatus = async (id, status) => {
    try { await api.put(`/admin/meetings/${id}`, { status }); flash('Meeting updated.'); load('meetings'); }
    catch (err) { setError(err.message); }
  };

  const deleteMeeting = async (id) => {
    if (!confirm('Delete this meeting?')) return;
    try { await api.del(`/admin/meetings/${id}`); flash('Meeting deleted.'); load('meetings'); }
    catch (err) { setError(err.message); }
  };

  // ── Assignments ──────────────────────────────────────────
  const handleCreateAssignment = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await api.post('/admin/assignments', assignmentForm);
      setShowAssignmentModal(false);
      setAssignmentForm({ title: '', description: '', fileUrl: '', dueDate: '' });
      flash('Assignment created.'); load('assignments');
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const deleteAssignment = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try { await api.del(`/admin/assignments/${id}`); flash('Assignment deleted.'); load('assignments'); }
    catch (err) { setError(err.message); }
  };

  const openSubmissions = async (assignment) => {
    setGradingAssignment(assignment); setSubmissionsLoading(true); setError('');
    try {
      const data = await api.get(`/admin/assignments/${assignment.id}/submissions`);
      setSubmissions(data.submissions);
      const drafts = {};
      data.submissions.forEach((s) => { drafts[s.id] = s.grade || ''; });
      setGradeDrafts(drafts);
    } catch (err) { setError(err.message); }
    finally { setSubmissionsLoading(false); }
  };

  const saveGrade = async (submissionId) => {
    try { await api.put(`/admin/submissions/${submissionId}/grade`, { grade: gradeDrafts[submissionId] }); flash('Grade saved.'); }
    catch (err) { setError(err.message); }
  };

  // ── School settings ──────────────────────────────────────
  const handleSaveSchool = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try { await api.put('/admin/school', schoolForm); flash('School profile updated.'); load('settings'); }
    catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const attStatusColor = {
    PRESENT: ['#005338', '#d1fae5'],
    ABSENT:  ['#ba1a1a', '#ffdad6'],
    LATE:    ['#7a5b00', '#fff3cd'],
  };

  return (
    <DashboardShell brandLabel="School Admin" navItems={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {/* ── Overview ─────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Control Center</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Full control over your school's staff, students, classes, and assignments.</p>
          </div>
          {loading || !stats ? <Spinner /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <StatCard icon="person_book"  color="#3525cd" label="Teachers"           value={stats.teacherCount}    />
              <StatCard icon="school"       color="#39b8fd" label="Students"           value={stats.studentCount}    />
              <StatCard icon="video_call"   color="#7b61ff" label="Meetings Scheduled" value={stats.meetingCount}    />
              <StatCard icon="assignment"   color="#ff9800" label="Assignments Issued" value={stats.assignmentCount} />
            </div>
          )}
        </>
      )}

      {/* ── Staff & Students ─────────────────── */}
      {activeTab === 'users' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 10px 0' }}>Staff & Students</h1>
              <div style={{ display: 'flex', gap: 8 }}>
                {['TEACHER', 'STUDENT'].map((r) => (
                  <button key={r} onClick={() => setUserFilter(r)} style={{
                    padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                    background: userFilter === r ? '#3525cd' : '#e5eeff',
                    color:      userFilter === r ? '#fff'    : '#464555',
                  }}>
                    {r === 'TEACHER' ? 'Teachers' : 'Students'}
                  </button>
                ))}
              </div>
            </div>
            <PrimaryButton onClick={() => setUserModal({
              mode: 'create',
              data: { name: '', email: '', password: '', role: userFilter, rollNo: '', standard: '' },
            })}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Add {userFilter === 'TEACHER' ? 'Teacher' : 'Student'}
            </PrimaryButton>
          </div>

          {/* Class-wise filter — students only load once a class is picked, so we
              never pull the whole school's student roster into memory at once. */}
          {userFilter === 'STUDENT' && (
            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#464555', marginBottom: 6 }}>Class / Standard *</label>
                  <input style={inputStyle} placeholder="e.g. 10A" value={userStandardFilter}
                    onChange={(e) => setUserStandardFilter(e.target.value)} />
                </div>
                <PrimaryButton onClick={loadStudentsByClass} disabled={!userStandardFilter || loading}>
                  {loading ? 'Loading…' : 'Load Class'}
                </PrimaryButton>
              </div>
            </Card>
          )}

          {loading ? <Spinner /> : users.length === 0
            ? <EmptyState icon="group" message={
                userFilter === 'STUDENT'
                  ? (userStandardFilter ? `No students found in class "${userStandardFilter}".` : 'Pick a class above and click "Load Class" to see its students.')
                  : 'No teachers yet.'
              } />
            : (
              <Card>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#777587', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '10px 12px' }}>Name</th>
                        <th style={{ padding: '10px 12px' }}>Email</th>
                        {userFilter === 'STUDENT' && <>
                          <th style={{ padding: '10px 12px' }}>Roll No</th>
                          <th style={{ padding: '10px 12px' }}>Standard</th>
                        </>}
                        <th style={{ padding: '10px 12px' }}>Joined</th>
                        <th style={{ padding: '10px 12px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} style={{ borderTop: '1px solid #f0f2fb' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#0b1c30' }}>{u.name}</td>
                          <td style={{ padding: '12px', color: '#777587' }}>{u.email}</td>
                          {userFilter === 'STUDENT' && <>
                            <td style={{ padding: '12px', color: '#0b1c30', fontWeight: 600 }}>{u.rollNo || '—'}</td>
                            <td style={{ padding: '12px' }}>
                              {u.standard
                                ? <span style={{ background: '#e2dfff', color: '#3525cd', borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: 11 }}>{u.standard}</span>
                                : <span style={{ color: '#ccc' }}>—</span>
                              }
                            </td>
                          </>}
                          <td style={{ padding: '12px', color: '#464555' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setUserModal({
                                  mode: 'edit',
                                  data: { id: u.id, name: u.name, email: u.email, password: '', role: u.role, rollNo: u.rollNo || '', standard: u.standard || '' },
                                })}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3525cd' }} title="Edit"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                              </button>
                              <button onClick={() => handleDeleteUser(u.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ba1a1a' }} title="Remove">
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

          {/* User Modal */}
          <Modal
            open={Boolean(userModal)}
            title={userModal?.mode === 'create'
              ? `Add ${userModal.data.role === 'TEACHER' ? 'Teacher' : 'Student'}`
              : `Edit ${userModal?.data?.role === 'TEACHER' ? 'Teacher' : 'Student'}`}
            onClose={() => setUserModal(null)}
          >
            {userModal && (
              <form onSubmit={handleSaveUser}>
                {userModal.mode === 'create' && (
                  <FormField label="Role">
                    <select style={inputStyle} value={userModal.data.role}
                      onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, role: e.target.value } })}>
                      <option value="TEACHER">Teacher</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  </FormField>
                )}

                <FormField label="Full Name">
                  <input style={inputStyle} required value={userModal.data.name}
                    onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, name: e.target.value } })} />
                </FormField>

                <FormField label="Email Address">
                  <input type="email" style={inputStyle} required value={userModal.data.email}
                    onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, email: e.target.value } })} />
                </FormField>

                <FormField label={userModal.mode === 'create' ? 'Temporary Password' : 'New Password (blank = keep current)'}>
                  <input type="password" style={inputStyle} required={userModal.mode === 'create'}
                    value={userModal.data.password}
                    onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, password: e.target.value } })} />
                </FormField>

                {/* Student-only fields */}
                {(userModal.data.role === 'STUDENT') && (
                  <>
                    <div style={{ margin: '16px 0 8px', padding: '10px 14px', background: '#f0f4ff', borderRadius: 8, fontSize: 12, color: '#3525cd', fontWeight: 600 }}>
                      📚 Student Details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <FormField label="Roll Number">
                        <input style={inputStyle} placeholder="e.g. 23"
                          value={userModal.data.rollNo}
                          onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, rollNo: e.target.value } })} />
                      </FormField>
                      <FormField label="Standard / Class">
                        <input style={inputStyle} placeholder="e.g. 10A"
                          value={userModal.data.standard}
                          onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, standard: e.target.value } })} />
                      </FormField>
                    </div>
                    <p style={{ fontSize: 11.5, color: '#777587', marginTop: 6 }}>
                      ⚠️ Standard must match exactly what teachers type when scheduling meetings (e.g. "10A").
                    </p>
                  </>
                )}

                <PrimaryButton type="submit" disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                  {submitting ? 'Saving…' : userModal.mode === 'create' ? 'Add User' : 'Save Changes'}
                </PrimaryButton>
              </form>
            )}
          </Modal>
        </>
      )}

      {/* ── Attendance Oversight ─────────────── */}
      {activeTab === 'attendance' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Attendance Overview</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>
              View attendance records marked by teachers. Filter by class and date.
            </p>
          </div>

          {/* Filter controls */}
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#464555', marginBottom: 6 }}>
                  Class / Standard (optional)
                </label>
                <input style={inputStyle} placeholder="e.g. 10A  —  leave blank for all"
                  value={attStandard} onChange={e => setAttStandard(e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#464555', marginBottom: 6 }}>Date</label>
                <input type="date" style={inputStyle} value={attDate} onChange={e => setAttDate(e.target.value)} />
              </div>
              <PrimaryButton onClick={() => { loadAttendance(); loadTeacherAttendance(); }} disabled={attLoading || teacherAttLoading}>
                {(attLoading || teacherAttLoading) ? 'Loading…' : 'View Attendance'}
              </PrimaryButton>
            </div>
          </Card>

          {/* Summary badges */}
          {attRecords.length > 0 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              {['PRESENT', 'ABSENT', 'LATE'].map(s => {
                const count = attRecords.filter(r => r.status === s).length;
                const [tc, bg] = attStatusColor[s];
                return (
                  <div key={s} style={{ background: bg, color: tc, borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 14 }}>
                    {s}: {count}
                  </div>
                );
              })}
              <div style={{ background: '#e2dfff', color: '#3525cd', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 14 }}>
                TOTAL: {attRecords.length}
              </div>
            </div>
          )}

          {/* Records table */}
          {attLoading ? <Spinner /> : attRecords.length === 0 ? (
            <EmptyState icon="fact_check" message="No attendance records found. Click 'View Attendance' to load." />
          ) : (
            <Card>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8f9ff', textAlign: 'left' }}>
                      {['Roll No', 'Student', 'Standard', 'Status', 'Marked By', 'Date'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', color: '#777587', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5eeff' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attRecords.map((r, i) => {
                      const [tc, bg] = attStatusColor[r.status] || ['#464555', '#f0f4ff'];
                      return (
                        <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafbff', borderBottom: '1px solid #f0f4ff' }}>
                          <td style={{ padding: '11px 14px', color: '#777587', fontWeight: 600 }}>{r.student?.rollNo || '—'}</td>
                          <td style={{ padding: '11px 14px', fontWeight: 700, color: '#0b1c30' }}>{r.student?.name}</td>
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{ background: '#e2dfff', color: '#3525cd', borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: 11 }}>
                              {r.student?.standard || r.standard}
                            </span>
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{ background: bg, color: tc, borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: 11 }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '11px 14px', color: '#464555' }}>{r.teacher?.name}</td>
                          <td style={{ padding: '11px 14px', color: '#777587' }}>
                            {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Teacher self-attendance for the selected date */}
          <div style={{ marginTop: 28, marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, color: '#0b1c30', fontWeight: 800, margin: '0 0 4px 0' }}>Teacher Attendance</h2>
            <p style={{ color: '#777587', margin: 0, fontSize: 13 }}>
              Who checked themselves in on {new Date(attDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}. Resets automatically each day.
            </p>
          </div>

          {teacherAttLoading ? <Spinner /> : teacherAtt.length === 0 ? (
            <EmptyState icon="badge" message="Click 'View Attendance' above to load teacher check-ins for this date." />
          ) : (
            <Card>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8f9ff', textAlign: 'left' }}>
                      {['Teacher', 'Email', 'Status', 'Checked In At'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', color: '#777587', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5eeff' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teacherAtt.map((row, i) => (
                      <tr key={row.teacher.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafbff', borderBottom: '1px solid #f0f4ff' }}>
                        <td style={{ padding: '11px 14px', fontWeight: 700, color: '#0b1c30' }}>{row.teacher.name}</td>
                        <td style={{ padding: '11px 14px', color: '#777587' }}>{row.teacher.email}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            background: row.present ? '#d1fae5' : '#ffdad6',
                            color: row.present ? '#005338' : '#93000a',
                            borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: 11,
                          }}>
                            {row.present ? 'PRESENT' : 'NOT MARKED'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', color: '#464555' }}>
                          {row.checkedInAt ? new Date(row.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── Meetings ─────────────────────────── */}
      {activeTab === 'meetings' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Meetings</h1>
              <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>All class sessions across your school.</p>
            </div>
            <PrimaryButton onClick={() => setShowMeetingModal(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Schedule Meeting
            </PrimaryButton>
          </div>

          {loading ? <Spinner /> : meetings.length === 0 ? <EmptyState icon="video_call" message="No meetings scheduled yet." /> : (
            <div style={{ display: 'grid', gap: 12 }}>
              {meetings.map((m) => (
                <Card key={m.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>{m.title}</h3>
                        <Badge tone={m.status === 'ONGOING' ? 'success' : m.status === 'ENDED' ? 'neutral' : 'info'}>{m.status}</Badge>
                        {m.standard && <Badge tone="primary">Class: {m.standard}</Badge>}
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#777587' }}>Hosted by {m.host?.name}</p>
                      <a href={m.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#3525cd', fontWeight: 600 }}>{m.meetingLink}</a>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {m.status === 'SCHEDULED' && <button onClick={() => updateMeetingStatus(m.id, 'ONGOING')} style={{ ...smallBtn, background: '#e1f5ee', color: '#005338' }}>Start</button>}
                      {m.status === 'ONGOING'   && <button onClick={() => updateMeetingStatus(m.id, 'ENDED')}   style={{ ...smallBtn, background: '#ffdad6', color: '#93000a' }}>End</button>}
                      <button onClick={() => deleteMeeting(m.id)} style={{ ...smallBtn, background: '#f0f2fb', color: '#464555' }}>Delete</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Modal open={showMeetingModal} title="Schedule Meeting" onClose={() => setShowMeetingModal(false)}>
            <form onSubmit={handleCreateMeeting}>
              <FormField label="Title">
                <input style={inputStyle} required value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} />
              </FormField>
              <FormField label="Meeting Link">
                <input style={inputStyle} required placeholder="https://meet.jit.si/room" value={meetingForm.meetingLink} onChange={(e) => setMeetingForm({ ...meetingForm, meetingLink: e.target.value })} />
              </FormField>
              <FormField label="For Class / Standard (optional)">
                <input style={inputStyle} placeholder="e.g. 10A — leave blank for all students" value={meetingForm.standard} onChange={(e) => setMeetingForm({ ...meetingForm, standard: e.target.value })} />
              </FormField>
              <FormField label="Start Time (optional)">
                <input type="datetime-local" style={inputStyle} value={meetingForm.startTime} onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })} />
              </FormField>
              <PrimaryButton type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {submitting ? 'Scheduling…' : 'Schedule Meeting'}
              </PrimaryButton>
            </form>
          </Modal>
        </>
      )}

      {/* ── Assignments ──────────────────────── */}
      {activeTab === 'assignments' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Assignments</h1>
              <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Every assignment across your school.</p>
            </div>
            <PrimaryButton onClick={() => setShowAssignmentModal(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              New Assignment
            </PrimaryButton>
          </div>

          {loading ? <Spinner /> : assignments.length === 0 ? <EmptyState icon="assignment" message="No assignments issued yet." /> : (
            <div style={{ display: 'grid', gap: 12 }}>
              {assignments.map((a) => (
                <Card key={a.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>{a.title}</h3>
                      <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#777587' }}>{a.description}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#464555' }}>
                        By {a.teacher?.name} · Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'no due date'} · {a._count?.submissions ?? 0} submission(s)
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openSubmissions(a)} style={{ ...smallBtn, background: '#e2dfff', color: '#3525cd' }}>Submissions</button>
                      <button onClick={() => deleteAssignment(a.id)} style={{ ...smallBtn, background: '#f0f2fb', color: '#464555' }}>Delete</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Modal open={showAssignmentModal} title="New Assignment" onClose={() => setShowAssignmentModal(false)}>
            <form onSubmit={handleCreateAssignment}>
              <FormField label="Title"><input style={inputStyle} required value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} /></FormField>
              <FormField label="Description"><textarea style={{ ...inputStyle, minHeight: 80 }} required value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} /></FormField>
              <FormField label="File URL (optional)"><input style={inputStyle} placeholder="https://…" value={assignmentForm.fileUrl} onChange={(e) => setAssignmentForm({ ...assignmentForm, fileUrl: e.target.value })} /></FormField>
              <FormField label="Due Date (optional)"><input type="date" style={inputStyle} value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} /></FormField>
              <PrimaryButton type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {submitting ? 'Creating…' : 'Create Assignment'}
              </PrimaryButton>
            </form>
          </Modal>

          <Modal open={Boolean(gradingAssignment)} title={`Submissions — ${gradingAssignment?.title || ''}`} onClose={() => setGradingAssignment(null)}>
            {submissionsLoading ? <Spinner /> : submissions.length === 0 ? <EmptyState icon="upload_file" message="No submissions yet." /> : (
              <div style={{ display: 'grid', gap: 12 }}>
                {submissions.map((s) => (
                  <div key={s.id} style={{ border: '1px solid #e5eeff', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: '#0b1c30' }}>{s.student?.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#777587' }}>
                          {s.student?.rollNo && `Roll: ${s.student.rollNo}`}
                          {s.student?.standard && ` · Class: ${s.student.standard}`}
                        </p>
                      </div>
                      <span style={{ fontSize: 11.5, color: '#777587' }}>{new Date(s.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <a href={s.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#3525cd', fontWeight: 600, display: 'block', marginBottom: 10 }}>View submitted file →</a>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input style={{ ...inputStyle, flex: 1 }} placeholder="Grade / feedback"
                        value={gradeDrafts[s.id] || ''} onChange={(e) => setGradeDrafts({ ...gradeDrafts, [s.id]: e.target.value })} />
                      <PrimaryButton type="button" onClick={() => saveGrade(s.id)}>Save</PrimaryButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        </>
      )}

      {/* ── Settings ─────────────────────────── */}
      {activeTab === 'settings' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>School Settings</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Your school's profile and subscription.</p>
          </div>
          {loading || !school ? <Spinner /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>
              <Card title="School Profile">
                <form onSubmit={handleSaveSchool}>
                  <FormField label="School Name">
                    <input style={inputStyle} required value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} />
                  </FormField>
                  <FormField label="Domain (optional)">
                    <input style={inputStyle} placeholder="myschool.edu" value={schoolForm.domain} onChange={(e) => setSchoolForm({ ...schoolForm, domain: e.target.value })} />
                  </FormField>
                  <PrimaryButton type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                    {submitting ? 'Saving…' : 'Save Changes'}
                  </PrimaryButton>
                </form>
              </Card>
              <Card title="Subscription">
                {school.subscription ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <Badge tone={school.subscription.status === 'ACTIVE' ? 'success' : 'danger'}>{school.subscription.status}</Badge>
                      <span style={{ fontWeight: 700, color: '#0b1c30', fontSize: 14 }}>{school.subscription.planName} Plan</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: '#777587' }}>Ends: {new Date(school.subscription.endDate).toLocaleDateString()}</p>
                  </>
                ) : (
                  <EmptyState icon="credit_card" message="No active subscription. Contact Zubi Dubi support." />
                )}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f2fb' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: 12.5, color: '#464555' }}>Total users: <strong>{school.userCount}</strong></p>
                  <p style={{ margin: '0 0 6px 0', fontSize: 12.5, color: '#464555' }}>Total meetings: <strong>{school.meetingCount}</strong></p>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#464555' }}>Total assignments: <strong>{school.assignmentCount}</strong></p>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
