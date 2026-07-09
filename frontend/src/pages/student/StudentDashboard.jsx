import { useEffect, useState, useCallback } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import AttendanceHeatmap from '../../components/dashboard/AttendanceHeatmap';
import {
  StatCard, Card, Badge, EmptyState, Spinner, ErrorBanner, SuccessBanner,
  Modal, PrimaryButton, FormField, inputStyle,
} from '../../components/dashboard/Widgets';
import { api } from '../../utils/api';
import { getCurrentUser } from '../../utils/auth';

const NAV_ITEMS = [
  { id: 'overview',    icon: 'dashboard',   label: 'Overview'    },
  { id: 'meetings',    icon: 'video_call',  label: 'Classroom'   },
  { id: 'assignments', icon: 'assignment',  label: 'Assignments' },
  { id: 'attendance',  icon: 'fact_check',  label: 'My Attendance' },
];

export default function StudentDashboard() {
  const me = getCurrentUser();

  const [activeTab,    setActiveTab]    = useState('overview');
  const [stats,        setStats]        = useState(null);
  const [meetings,     setMeetings]     = useState([]);
  const [myStandard,   setMyStandard]   = useState('');
  const [assignments,  setAssignments]  = useState([]);
  const [attData,      setAttData]      = useState(null);  // { records, summary }
  const [heatmapRecords, setHeatmapRecords] = useState([]); // wider-window records for the calendar heatmap
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');

  const [submittingFor, setSubmittingFor] = useState(null);
  const [fileUrl,       setFileUrl]       = useState('');
  const [submitting,    setSubmitting]    = useState(false);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const load = useCallback(async (tab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'overview')    setStats(await api.get('/student/stats'));
      if (tab === 'meetings') {
        const res = await api.get('/student/meetings');
        setMeetings(res.meetings);
        setMyStandard(res.myStandard || '');
      }
      if (tab === 'assignments') setAssignments((await api.get('/student/assignments')).assignments);
      if (tab === 'attendance') {
        const [recent, heatmap] = await Promise.all([
          api.get('/student/attendance'),           // last 30 days — summary + list
          api.get('/student/attendance?days=120'),   // wider window — heatmap grid
        ]);
        setAttData(recent);
        setHeatmapRecords(heatmap.records);
      }
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

  const statusColor = { PRESENT: ['#005338', '#d1fae5'], ABSENT: ['#ba1a1a', '#ffdad6'], LATE: ['#7a5b00', '#fff3cd'] };

  return (
    <DashboardShell brandLabel="Student" navItems={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Your Classroom</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>
              Stay on top of your classes and assignments.
              {me?.standard && <span style={{ marginLeft: 8, background: '#e2dfff', color: '#3525cd', borderRadius: 20, padding: '2px 10px', fontWeight: 700, fontSize: 12 }}>Class: {me.standard}</span>}
              {me?.rollNo && <span style={{ marginLeft: 6, background: '#f0f4ff', color: '#464555', borderRadius: 20, padding: '2px 10px', fontWeight: 700, fontSize: 12 }}>Roll No: {me.rollNo}</span>}
            </p>
          </div>
          {loading || !stats ? <Spinner /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <StatCard icon="video_call" color="#3525cd" label="Meetings (My Class)" value={stats.meetingCount}    />
              <StatCard icon="assignment" color="#ff9800" label="Assignments"          value={stats.assignmentCount} />
              <StatCard icon="upload_file" color="#39b8fd" label="Submitted"           value={stats.submissionCount} />
              <StatCard icon="grade"      color="#25d366" label="Graded"              value={stats.gradedCount}     />
            </div>
          )}
        </>
      )}

      {/* ── Classroom / Meetings ── */}
      {activeTab === 'meetings' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>Classroom</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>
              Live sessions for your class only.
              {myStandard && (
                <span style={{ marginLeft: 8, background: '#e2dfff', color: '#3525cd', borderRadius: 20, padding: '2px 10px', fontWeight: 700, fontSize: 12 }}>
                  Showing meetings for: Class {myStandard}
                </span>
              )}
            </p>
          </div>
          {loading ? <Spinner /> : meetings.length === 0
            ? <EmptyState icon="video_call" message={`No classes scheduled for Class ${myStandard || 'your standard'} yet.`} />
            : (
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
                        <p style={{ margin: 0, fontSize: 12.5, color: '#777587' }}>Hosted by {m.host?.name}</p>
                        {m.startTime && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#777587' }}>{new Date(m.startTime).toLocaleString()}</p>}
                      </div>
                      {m.status !== 'ENDED' ? (
                        <a href={m.meetingLink} target="_blank" rel="noreferrer"
                          style={{ textDecoration: 'none', padding: '8px 18px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, background: '#3525cd', color: '#fff' }}>
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

      {/* ── Assignments ── */}
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

      {/* ── My Attendance ── */}
      {activeTab === 'attendance' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, color: '#0b1c30', fontWeight: 800, margin: '0 0 6px 0' }}>My Attendance</h1>
            <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Your attendance record for the last 30 days.</p>
          </div>

          {loading ? <Spinner /> : !attData ? null : (
            <>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard icon="check_circle"  color="#005338" label="Present" value={attData.summary.present} />
                <StatCard icon="cancel"        color="#ba1a1a" label="Absent"  value={attData.summary.absent}  />
                <StatCard icon="schedule"      color="#7a5b00" label="Late"    value={attData.summary.late}    />
                <StatCard icon="percent"       color="#3525cd" label="% Present"
                  value={attData.summary.pct !== null ? `${attData.summary.pct}%` : '—'} />
              </div>

              {/* Calendar heatmap */}
              <div style={{ marginBottom: 20 }}>
                <Card title="Attendance Heatmap (last 120 days)">
                  <AttendanceHeatmap records={heatmapRecords} days={120} />
                </Card>
              </div>

              {/* Attendance % bar */}
              {attData.summary.pct !== null && (
                <Card style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0b1c30' }}>Overall Attendance</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: attData.summary.pct >= 75 ? '#005338' : '#ba1a1a' }}>
                      {attData.summary.pct}%
                      {attData.summary.pct < 75 && ' ⚠️ Below 75%'}
                    </span>
                  </div>
                  <div style={{ height: 10, background: '#f0f4ff', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${attData.summary.pct}%`, background: attData.summary.pct >= 75 ? '#005338' : '#ba1a1a', borderRadius: 99, transition: 'width 0.6s' }} />
                  </div>
                </Card>
              )}

              {/* Daily records */}
              {attData.records.length === 0
                ? <EmptyState icon="fact_check" message="No attendance records in the last 30 days." />
                : (
                  <Card title="Daily Records">
                    <div style={{ display: 'grid', gap: 8 }}>
                      {attData.records.map((r, i) => {
                        const [tc, bg] = statusColor[r.status] || ['#464555', '#f0f4ff'];
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: bg, border: `1px solid ${bg}` }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0b1c30' }}>
                              {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: tc, background: '#fff', borderRadius: 20, padding: '3px 10px' }}>
                              {r.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
            </>
          )}
        </>
      )}
    </DashboardShell>
  );
}
