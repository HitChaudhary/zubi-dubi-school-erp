import { useEffect, useState, useCallback } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import {
  StatCard, Card, Badge, EmptyState, Spinner, ErrorBanner, SuccessBanner,
  Modal, PrimaryButton, FormField, inputStyle,
} from '../../components/dashboard/Widgets';
import { api } from '../../utils/api';

const NAV_ITEMS = [
  { id: 'overview', icon: 'dashboard', label: 'Overview' },
  { id: 'meetings', icon: 'video_call', label: 'My Meetings' },
  { id: 'assignments', icon: 'assignment', label: 'My Assignments' },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: '', meetingLink: '', startTime: '' });

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', fileUrl: '', dueDate: '' });

  const [gradingAssignment, setGradingAssignment] = useState(null); // assignment object whose submissions are open
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradeDrafts, setGradeDrafts] = useState({});

  const [submitting, setSubmitting] = useState(false);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const load = useCallback(async (tab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'overview') setStats((await api.get('/teacher/stats')));
      if (tab === 'meetings') setMeetings((await api.get('/teacher/meetings')).meetings);
      if (tab === 'assignments') setAssignments((await api.get('/teacher/assignments')).assignments);
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
      setMeetingForm({ title: '', meetingLink: '', startTime: '' });
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
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteMeeting = async (id) => {
    if (!confirm('Delete this meeting?')) return;
    try {
      await api.del(`/teacher/meetings/${id}`);
      flash('Meeting deleted.');
      load('meetings');
    } catch (err) {
      setError(err.message);
    }
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
    } catch (err) {
      setError(err.message);
    }
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
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardShell brandLabel="Teacher" navItems={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {activeTab === 'overview' && (
        <>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Welcome back</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Here's what's happening with your classes.</p>
          </div>
          {loading || !stats ? <Spinner /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <StatCard icon="video_call" color="#3525cd" label="Meetings Hosted" value={stats.meetingCount} />
              <StatCard icon="assignment" color="#ff9800" label="Assignments Issued" value={stats.assignmentCount} />
              <StatCard icon="upload_file" color="#25d366" label="Submissions Received" value={stats.submissionCount} />
              <StatCard icon="school" color="#39b8fd" label="Students in School" value={stats.studentCount} />
            </div>
          )}
        </>
      )}

      {activeTab === 'meetings' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>My Meetings</h1>
              <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Schedule and run your live classes.</p>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>{m.title}</h3>
                        <Badge tone={m.status === 'ONGOING' ? 'success' : m.status === 'ENDED' ? 'neutral' : 'info'}>{m.status}</Badge>
                      </div>
                      <a href={m.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#3525cd', fontWeight: 600 }}>{m.meetingLink}</a>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {m.status === 'SCHEDULED' && (
                        <button onClick={() => updateMeetingStatus(m.id, 'ONGOING')} style={{ ...smallBtn, background: '#e1f5ee', color: '#005338' }}>Start</button>
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
                <input style={inputStyle} required value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} />
              </FormField>
              <FormField label="Meeting Link">
                <input style={inputStyle} required placeholder="https://meet.jit.si/your-room" value={meetingForm.meetingLink} onChange={(e) => setMeetingForm({ ...meetingForm, meetingLink: e.target.value })} />
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
              <FormField label="Title">
                <input style={inputStyle} required value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} />
              </FormField>
              <FormField label="Description">
                <textarea style={{ ...inputStyle, minHeight: 80 }} required value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} />
              </FormField>
              <FormField label="File URL (optional)">
                <input style={inputStyle} placeholder="https://…" value={assignmentForm.fileUrl} onChange={(e) => setAssignmentForm({ ...assignmentForm, fileUrl: e.target.value })} />
              </FormField>
              <FormField label="Due Date (optional)">
                <input type="date" style={inputStyle} value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} />
              </FormField>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: '#0b1c30' }}>{s.student?.name}</p>
                      <span style={{ fontSize: 11.5, color: '#777587' }}>{new Date(s.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <a href={s.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#3525cd', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                      View submitted file →
                    </a>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="Grade / feedback"
                        value={gradeDrafts[s.id] || ''}
                        onChange={(e) => setGradeDrafts({ ...gradeDrafts, [s.id]: e.target.value })}
                      />
                      <PrimaryButton type="button" onClick={() => saveGrade(s.id)}>Save</PrimaryButton>
                    </div>
                  </div>
                ))}
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
