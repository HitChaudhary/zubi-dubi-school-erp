import { useEffect, useState, useCallback } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import {
  StatCard, Card, Badge, EmptyState, Spinner, ErrorBanner, SuccessBanner,
  Modal, PrimaryButton, FormField, inputStyle,
} from '../../components/dashboard/Widgets';
import { api } from '../../utils/api';
import { safeHref } from '../../utils/url';

const NAV_ITEMS = [
  { id: 'overview',    icon: 'dashboard',    label: 'Overview'       },
  { id: 'meetings',    icon: 'video_call',   label: 'My Meetings'    },
  { id: 'assignments', icon: 'assignment',   label: 'My Assignments' },
  { id: 'students',    icon: 'group',        label: 'Students'       },
  { id: 'attendance',  icon: 'fact_check',   label: 'Attendance'     },
];

const TODAY = new Date().toISOString().split('T')[0];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats,       setStats]       = useState(null);
  const [meetings,    setMeetings]    = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');

  // Meeting modal — now includes standard field
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: '', meetingLink: '', startTime: '', standard: '' });

  // Assignment modal
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', fileUrl: '', dueDate: '' });
  const [gradingAssignment, setGradingAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradeDrafts, setGradeDrafts] = useState({});

  // Attendance state
  const [attStandard, setAttStandard]   = useState('');
  const [attDate,     setAttDate]       = useState(TODAY);
  const [attStudents, setAttStudents]   = useState([]);   // list from /attendance/students
  const [attRecords,  setAttRecords]    = useState({});   // { studentId: 'PRESENT'|'ABSENT'|'LATE' }
  const [attLoading,  setAttLoading]    = useState(false);
  const [attSaving,   setAttSaving]     = useState(false);
  const [attReport,   setAttReport]     = useState([]);
  const [showReport,  setShowReport]    = useState(false);

  // Students state
  const [students,        setStudents]        = useState([]);
  const [studentsFilter,  setStudentsFilter]  = useState('');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', rollNo: '', standard: '' });

  const [submitting, setSubmitting] = useState(false);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const load = useCallback(async (tab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'overview')    setStats((await api.get('/teacher/stats')));
      if (tab === 'meetings')    setMeetings((await api.get('/teacher/meetings')).meetings);
      if (tab === 'assignments') setAssignments((await api.get('/teacher/assignments')).assignments);
      if (tab === 'students')    setStudents((await api.get('/teacher/students')).students);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  // ---- Meetings ----
  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/teacher/meetings', meetingForm);
      setShowMeetingModal(false);
      setMeetingForm({ title: '', meetingLink: '', startTime: '', standard: '' });
      flash('Meeting scheduled.');
      load('meetings');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateMeetingStatus = async (id, status) => {
    try {
      await api.put(`/teacher/meetings/${id}`, { status });
      flash(status === 'ONGOING' ? 'Meeting started.' : 'Meeting ended.');
      load('meetings');
    } catch (err) { setError(err.message); }
  };

  const deleteMeeting = async (id) => {
    if (!confirm('Delete this meeting?')) return;
    try {
      await api.del(`/teacher/meetings/${id}`);
      flash('Meeting deleted.');
      load('meetings');
    } catch (err) { setError(err.message); }
  };

  // ---- Assignments ----
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/teacher/assignments', assignmentForm);
      setShowAssignmentModal(false);
      setAssignmentForm({ title: '', description: '', fileUrl: '', dueDate: '' });
      flash('Assignment created.');
      load('assignments');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAssignment = async (id) => {
    if (!confirm('Delete this assignment and all its submissions?')) return;
    try {
      await api.del(`/teacher/assignments/${id}`);
      flash('Assignment deleted.');
      load('assignments');
    } catch (err) { setError(err.message); }
  };

  const openSubmissions = async (assignment) => {
    setGradingAssignment(assignment);
    setSubmissionsLoading(true);
    setError('');
    try {
      const data = await api.get(`/teacher/assignments/${assignment.id}/submissions`);
      setSubmissions(data.submissions);
      const drafts = {};
      data.submissions.forEach((s) => { drafts[s.id] = s.grade || ''; });
      setGradeDrafts(drafts);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const saveGrade = async (submissionId) => {
    try {
      await api.put(`/teacher/submissions/${submissionId}/grade`, { grade: gradeDrafts[submissionId] });
      flash('Grade saved.');
    } catch (err) { setError(err.message); }
  };

  // ---- Students ----
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/teacher/students', studentForm);
      setShowStudentModal(false);
      setStudentForm({ name: '', email: '', password: '', rollNo: '', standard: '' });
      flash(`Student ${studentForm.name} enrolled in Class ${studentForm.standard}.`);
      load('students');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = studentsFilter
    ? students.filter(s => s.standard === studentsFilter)
    : students;

  // ---- Attendance ----
  const loadAttendanceStudents = async () => {
    if (!attStandard) return;
    setAttLoading(true);
    setError('');
    try {
      // Load students of this standard
      const { students } = await api.get(`/teacher/attendance/students?standard=${encodeURIComponent(attStandard)}`);
      setAttStudents(students);

      // Load existing records for this date (if any)
      const { records } = await api.get(
        `/teacher/attendance?standard=${encodeURIComponent(attStandard)}&date=${attDate}`
      );

      // Pre-fill status map: default PRESENT, override with saved
      const map = {};
      students.forEach(s => { map[s.id] = 'PRESENT'; });
      records.forEach(r => { map[r.student.id] = r.status; });
      setAttRecords(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setAttLoading(false);
    }
  };

  const saveAttendance = async () => {
    if (!attStudents.length) return;
    setAttSaving(true);
    setError('');
    try {
      const records = Object.entries(attRecords).map(([studentId, status]) => ({
        studentId: Number(studentId),
        status,
      }));
      await api.post('/teacher/attendance', { standard: attStandard, date: attDate, records });
      flash(`Attendance saved for ${records.length} students in ${attStandard}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAttSaving(false);
    }
  };

  const loadReport = async () => {
    if (!attStandard) return;
    setAttLoading(true);
    try {
      const { report } = await api.get(`/teacher/attendance/report?standard=${encodeURIComponent(attStandard)}`);
      setAttReport(report);
      setShowReport(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setAttLoading(false);
    }
  };

  const statusColor = { PRESENT: ['#005338', '#d1fae5'], ABSENT: ['#ba1a1a', '#ffdad6'], LATE: ['#7a5b00', '#fff3cd'] };

  return (
    <DashboardShell brandLabel="Teacher" navItems={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {/* ── Overview ────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Welcome back</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Here's what's happening with your classes.</p>
          </div>
          {loading || !stats ? <Spinner /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <StatCard icon="video_call"   color="#3525cd"  label="Meetings Hosted"      value={stats.meetingCount}    />
              <StatCard icon="assignment"   color="#ff9800"  label="Assignments Issued"   value={stats.assignmentCount} />
              <StatCard icon="upload_file"  color="#25d366"  label="Submissions Received" value={stats.submissionCount} />
              <StatCard icon="school"       color="#39b8fd"  label="Students in School"   value={stats.studentCount}    />
            </div>
          )}
        </>
      )}

      {/* ── Meetings ────────────────────────── */}
      {activeTab === 'meetings' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>My Meetings</h1>
              <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Schedule live classes — each is linked to one class/standard so only those students see it.</p>
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
                        {m.standard && (
                          <Badge tone="primary">Class: {m.standard}</Badge>
                        )}
                      </div>
                      <a href={safeHref(m.meetingLink)} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#3525cd', fontWeight: 600 }}>{m.meetingLink}</a>
                      {m.startTime && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#777587' }}>{new Date(m.startTime).toLocaleString()}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {m.status === 'SCHEDULED' && (
                        <button onClick={() => updateMeetingStatus(m.id, 'ONGOING')} style={{ ...smallBtn, background: '#d1fae5', color: '#005338' }}>Start</button>
                      )}
                      {m.status === 'ONGOING' && (
                        <button onClick={() => updateMeetingStatus(m.id, 'ENDED')} style={{ ...smallBtn, background: '#ffdad6', color: '#93000a' }}>End</button>
                      )}
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
                <input style={inputStyle} required value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} />
              </FormField>
              <FormField label="Meeting Link">
                <input style={inputStyle} required placeholder="https://meet.jit.si/your-room"
                  value={meetingForm.meetingLink}
                  onChange={(e) => setMeetingForm({ ...meetingForm, meetingLink: e.target.value })} />
              </FormField>
              <FormField label="For Class / Standard *">
                <input style={inputStyle} required placeholder="e.g. 10A  or  9B"
                  value={meetingForm.standard}
                  onChange={(e) => setMeetingForm({ ...meetingForm, standard: e.target.value })} />
              </FormField>
              <FormField label="Start Time (optional)">
                <input type="datetime-local" style={inputStyle} value={meetingForm.startTime}
                  onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })} />
              </FormField>
              <PrimaryButton type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {submitting ? 'Scheduling…' : 'Schedule Meeting'}
              </PrimaryButton>
            </form>
          </Modal>
        </>
      )}

      {/* ── Assignments ─────────────────────── */}
      {activeTab === 'assignments' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>My Assignments</h1>
              <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Issue work and grade what comes back.</p>
            </div>
            <PrimaryButton onClick={() => setShowAssignmentModal(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              New Assignment
            </PrimaryButton>
          </div>

          {loading ? <Spinner /> : assignments.length === 0 ? <EmptyState icon="assignment" message="No assignments yet." /> : (
            <div style={{ display: 'grid', gap: 12 }}>
              {assignments.map((a) => (
                <Card key={a.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>{a.title}</h3>
                      <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#777587' }}>{a.description}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#464555' }}>
                        Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No due date'} · {a._count?.submissions ?? 0} submission(s)
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openSubmissions(a)} style={{ ...smallBtn, background: '#e2dfff', color: '#3525cd' }}>View Submissions</button>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: '#0b1c30' }}>
                        {s.student?.name}
                        {s.student?.rollNo && <span style={{ fontSize: 11, color: '#777587', marginLeft: 6 }}>Roll: {s.student.rollNo}</span>}
                        {s.student?.standard && <span style={{ fontSize: 11, color: '#3525cd', marginLeft: 6 }}>Std: {s.student.standard}</span>}
                      </p>
                      <span style={{ fontSize: 11.5, color: '#777587' }}>{new Date(s.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <a href={safeHref(s.fileUrl)} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#3525cd', fontWeight: 600, display: 'block', marginBottom: 10 }}>View submitted file →</a>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input style={{ ...inputStyle, flex: 1 }} placeholder="Grade / feedback" value={gradeDrafts[s.id] || ''}
                        onChange={(e) => setGradeDrafts({ ...gradeDrafts, [s.id]: e.target.value })} />
                      <PrimaryButton type="button" onClick={() => saveGrade(s.id)}>Save</PrimaryButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        </>
      )}

      {/* ── Students ─────────────────────────── */}
      {activeTab === 'students' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Students</h1>
              <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Enroll new students directly into your school.</p>
            </div>
            <PrimaryButton onClick={() => setShowStudentModal(true)}>+ Add Student</PrimaryButton>
          </div>

          <div style={{ marginBottom: 16, maxWidth: 220 }}>
            <input
              style={inputStyle}
              placeholder="Filter by class (e.g. 10A)"
              value={studentsFilter}
              onChange={(e) => setStudentsFilter(e.target.value)}
            />
          </div>

          {loading ? <Spinner /> : filteredStudents.length === 0 ? (
            <EmptyState icon="group" message="No students found. Click 'Add Student' to enroll one." />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filteredStudents.map((s) => (
                <Card key={s.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h3 style={{ margin: '0 0 3px 0', fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>{s.name}</h3>
                      <p style={{ margin: 0, fontSize: 12.5, color: '#777587' }}>{s.email}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {s.standard && <Badge tone="primary">Class {s.standard}</Badge>}
                      {s.rollNo && <Badge tone="neutral">Roll No {s.rollNo}</Badge>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Modal open={showStudentModal} title="Add Student" onClose={() => setShowStudentModal(false)}>
            <form onSubmit={handleCreateStudent}>
              <FormField label="Full name">
                <input style={inputStyle} required value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
              </FormField>
              <FormField label="Email">
                <input style={inputStyle} type="email" required value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
              </FormField>
              <FormField label="Temporary password">
                <input style={inputStyle} type="password" required value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} />
              </FormField>
              <FormField label="Class / standard (e.g. 10A)">
                <input style={inputStyle} required value={studentForm.standard}
                  onChange={(e) => setStudentForm({ ...studentForm, standard: e.target.value })} />
              </FormField>
              <FormField label="Roll number (optional)">
                <input style={inputStyle} value={studentForm.rollNo}
                  onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })} />
              </FormField>
              <PrimaryButton type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {submitting ? 'Enrolling…' : 'Enroll Student'}
              </PrimaryButton>
            </form>
          </Modal>
        </>
      )}

      {/* ── Attendance ──────────────────────── */}
      {activeTab === 'attendance' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Attendance</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Select a class and date, then mark each student Present / Absent / Late.</p>
          </div>

          {/* Controls */}
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#464555', marginBottom: 6 }}>Class / Standard *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. 10A"
                  value={attStandard}
                  onChange={e => setAttStandard(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#464555', marginBottom: 6 }}>Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={attDate}
                  onChange={e => setAttDate(e.target.value)}
                />
              </div>
              <PrimaryButton onClick={loadAttendanceStudents} disabled={!attStandard || attLoading}>
                {attLoading ? 'Loading…' : 'Load Students'}
              </PrimaryButton>
              <button
                onClick={loadReport}
                disabled={!attStandard || attLoading}
                style={{ ...smallBtn, background: '#e2dfff', color: '#3525cd', padding: '10px 16px' }}
              >
                30-Day Report
              </button>
            </div>
          </Card>

          {/* Student list */}
          {attStudents.length > 0 && (
            <>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0b1c30' }}>
                    Class {attStandard} — {new Date(attDate).toLocaleDateString()} ({attStudents.length} students)
                  </h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { const m = {}; attStudents.forEach(s => { m[s.id] = 'PRESENT'; }); setAttRecords(m); }}
                      style={{ ...smallBtn, background: '#d1fae5', color: '#005338' }}>All Present</button>
                    <button onClick={() => { const m = {}; attStudents.forEach(s => { m[s.id] = 'ABSENT'; }); setAttRecords(m); }}
                      style={{ ...smallBtn, background: '#ffdad6', color: '#93000a' }}>All Absent</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  {attStudents.map(student => {
                    const status = attRecords[student.id] || 'PRESENT';
                    const [tc, bg] = statusColor[status] || ['#464555', '#e5eeff'];
                    return (
                      <div key={student.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        border: '1px solid #e5eeff', borderRadius: 10, padding: '12px 16px',
                        background: status === 'ABSENT' ? '#fffafa' : status === 'LATE' ? '#fffef5' : '#f9fffe',
                        flexWrap: 'wrap', gap: 10,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2dfff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#3525cd' }}>
                            {student.rollNo || '?'}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0b1c30' }}>{student.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#777587' }}>{student.email}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {['PRESENT', 'LATE', 'ABSENT'].map(s => (
                            <button
                              key={s}
                              onClick={() => setAttRecords(prev => ({ ...prev, [student.id]: s }))}
                              style={{
                                ...smallBtn,
                                background: status === s ? (s === 'PRESENT' ? '#005338' : s === 'ABSENT' ? '#ba1a1a' : '#7a5b00') : '#f0f2fb',
                                color: status === s ? '#fff' : '#464555',
                                padding: '6px 12px',
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary row */}
                <div style={{ marginTop: 16, padding: '12px 16px', background: '#f8f9ff', borderRadius: 8, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {['PRESENT', 'LATE', 'ABSENT'].map(s => {
                    const count = Object.values(attRecords).filter(v => v === s).length;
                    const [tc, bg] = statusColor[s];
                    return (
                      <span key={s} style={{ fontSize: 13, fontWeight: 700 }}>
                        <span style={{ color: tc }}>{s}: {count}</span>
                      </span>
                    );
                  })}
                </div>
              </Card>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryButton onClick={saveAttendance} disabled={attSaving}>
                  {attSaving ? 'Saving…' : 'Save Attendance'}
                </PrimaryButton>
              </div>
            </>
          )}

          {attStudents.length === 0 && !attLoading && attStandard && (
            <EmptyState icon="fact_check" message={`No students found in class "${attStandard}". Check the standard name or add students via School Admin.`} />
          )}

          {/* 30-Day Report Modal */}
          <Modal open={showReport} title={`30-Day Attendance Report — Class ${attStandard}`} onClose={() => setShowReport(false)}>
            {attReport.length === 0 ? <EmptyState icon="bar_chart" message="No attendance data in the last 30 days." /> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8f9ff' }}>
                      {['Roll', 'Name', 'Total Days', 'Present', 'Absent', 'Late', '% Present'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#777587', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5eeff' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attReport.map((row, i) => (
                      <tr key={row.student.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafbff', borderBottom: '1px solid #f0f4ff' }}>
                        <td style={{ padding: '10px 12px', color: '#777587' }}>{row.student.rollNo || '—'}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0b1c30' }}>{row.student.name}</td>
                        <td style={{ padding: '10px 12px', color: '#0b1c30' }}>{row.total}</td>
                        <td style={{ padding: '10px 12px', color: '#005338', fontWeight: 700 }}>{row.present}</td>
                        <td style={{ padding: '10px 12px', color: '#ba1a1a', fontWeight: 700 }}>{row.absent}</td>
                        <td style={{ padding: '10px 12px', color: '#7a5b00', fontWeight: 700 }}>{row.late}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            background: row.total ? (row.present / row.total >= 0.75 ? '#d1fae5' : '#ffdad6') : '#f0f4ff',
                            color: row.total ? (row.present / row.total >= 0.75 ? '#005338' : '#ba1a1a') : '#777587',
                            borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: 12,
                          }}>
                            {row.total ? Math.round((row.present / row.total) * 100) + '%' : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Modal>
        </>
      )}
    </DashboardShell>
  );
}

const smallBtn = {
  padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
};
