import { useEffect, useState, useCallback } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import {
  StatCard, Card, Badge, EmptyState, Spinner, ErrorBanner, SuccessBanner,
  Modal, PrimaryButton, FormField, inputStyle,
} from '../../components/dashboard/Widgets';
import { api } from '../../utils/api';

const NAV_ITEMS = [
  { id: 'overview', icon: 'dashboard', label: 'Overview' },
  { id: 'meetings', icon: 'video_call', label: 'Classroom' },
  { id: 'assignments', icon: 'assignment', label: 'Assignments' },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [submittingFor, setSubmittingFor] = useState(null); // assignment being submitted
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const load = useCallback(async (tab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'overview') setStats((await api.get('/student/stats')));
      if (tab === 'meetings') setMeetings((await api.get('/student/meetings')).meetings);
      if (tab === 'assignments') setAssignments((await api.get('/student/assignments')).assignments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/student/assignments/${submittingFor.id}/submit`, { fileUrl });
      setSubmittingFor(null);
      setFileUrl('');
      flash('Submitted! Your teacher will review it soon.');
      load('assignments');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell brandLabel="Student" navItems={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {activeTab === 'overview' && (
        <>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Your Classroom</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Stay on top of your classes and assignments.</p>
          </div>
          {loading || !stats ? <Spinner /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <StatCard icon="video_call" color="#3525cd" label="Meetings Available" value={stats.meetingCount} />
              <StatCard icon="assignment" color="#ff9800" label="Assignments" value={stats.assignmentCount} />
              <StatCard icon="upload_file" color="#39b8fd" label="Submitted" value={stats.submissionCount} />
              <StatCard icon="grade" color="#25d366" label="Graded" value={stats.gradedCount} />
            </div>
          )}
        </>
      )}

      {activeTab === 'meetings' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Classroom</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Join live sessions hosted by your teachers.</p>
          </div>
          {loading ? <Spinner /> : meetings.length === 0 ? <EmptyState icon="video_call" message="No classes scheduled yet." /> : (
            <div style={{ display: 'grid', gap: 12 }}>
              {meetings.map((m) => (
                <Card key={m.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>{m.title}</h3>
                        <Badge tone={m.status === 'ONGOING' ? 'success' : m.status === 'ENDED' ? 'neutral' : 'info'}>{m.status}</Badge>
                      </div>
                      <p style={{ margin: 0, fontSize: 12.5, color: '#777587' }}>Hosted by {m.host?.name}</p>
                    </div>
                    {m.status !== 'ENDED' ? (
                      <a
                        href={m.meetingLink} target="_blank" rel="noreferrer"
                        style={{
                          textDecoration: 'none', padding: '8px 18px', borderRadius: 999, fontSize: 12.5, fontWeight: 700,
                          background: '#3525cd', color: '#fff',
                        }}
                      >
                        Join Class
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: '#777587', fontWeight: 600 }}>Class ended</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'assignments' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Assignments</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Submit your work and track your grades.</p>
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
                        By {a.teacher?.name} · Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'no due date'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {a.mySubmission ? (
                        <>
                          <Badge tone={a.mySubmission.grade ? 'success' : 'info'}>
                            {a.mySubmission.grade ? `Graded: ${a.mySubmission.grade}` : 'Submitted'}
                          </Badge>
                          <p style={{ margin: '6px 0 0 0', fontSize: 11.5, color: '#777587' }}>
                            on {new Date(a.mySubmission.submittedAt).toLocaleDateString()}
                          </p>
                        </>
                      ) : (
                        <PrimaryButton onClick={() => { setSubmittingFor(a); setFileUrl(''); }}>Submit Work</PrimaryButton>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Modal open={Boolean(submittingFor)} title={`Submit — ${submittingFor?.title || ''}`} onClose={() => setSubmittingFor(null)}>
            <form onSubmit={handleSubmit}>
              <FormField label="Link to your completed work">
                <input style={inputStyle} required placeholder="https://drive.google.com/…" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
              </FormField>
              <PrimaryButton type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {submitting ? 'Submitting…' : 'Submit'}
              </PrimaryButton>
            </form>
          </Modal>
        </>
      )}
    </DashboardShell>
  );
}
