// src/pages/student/StudentAttendancePage.jsx
import { useEffect, useState } from 'react';
import AttendanceHeatmap from '../../components/attendance/AttendanceHeatmap';
import { api } from '../../utils/api';

const STATUS_COLOR = { PRESENT: '#166534', ABSENT: '#dc2626', LATE: '#ca8a04', LEAVE: '#1d4ed8' };
const STATUS_BG    = { PRESENT: '#dcfce7', ABSENT: '#fee2e2', LATE: '#fef9c3', LEAVE: '#dbeafe' };

export default function StudentAttendancePage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('ALL');  // ALL | PRESENT | ABSENT | LATE | LEAVE

  useEffect(() => {
    api.get('/student/attendance')
      .then(res => setData(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredRecent = data?.recent?.filter(r => filter === 'ALL' || r.status === filter) ?? [];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div style={{ textAlign: 'center', color: '#777587' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>fact_check</span>
        Loading your attendance…
      </div>
    </div>
  );

  if (error) return (
    <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 10, padding: 20, fontSize: 14 }}>
      ❌ {error}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0b1c30', margin: '0 0 6px 0' }}>My Attendance</h1>
        <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>Your full attendance history and calendar.</p>
      </div>

      {/* ── Heatmap card ── */}
      <div style={{ background: '#fff', border: '1px solid #e5eeff', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#0b1c30' }}>
          📅 Attendance Calendar
        </h2>
        <AttendanceHeatmap
          heatmap={data?.heatmap ?? {}}
          summary={data?.summary ?? {}}
        />
      </div>

      {/* ── Attendance % bar ── */}
      {data?.summary?.pct !== null && data?.summary?.pct !== undefined && (
        <div style={{ background: '#fff', border: '1px solid #e5eeff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0b1c30' }}>Overall Attendance</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: data.summary.pct >= 75 ? '#166534' : '#dc2626' }}>
              {data.summary.pct}%
              {data.summary.pct < 75 && (
                <span style={{ marginLeft: 8, fontSize: 12, background: '#fee2e2', color: '#dc2626', borderRadius: 20, padding: '2px 10px' }}>
                  ⚠️ Below 75% — at risk
                </span>
              )}
            </span>
          </div>
          <div style={{ height: 12, background: '#f0f4ff', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${data.summary.pct}%`,
              background: data.summary.pct >= 75
                ? 'linear-gradient(90deg,#16a34a,#2da44e)'
                : 'linear-gradient(90deg,#dc2626,#ef4444)',
              borderRadius: 99,
              transition: 'width 0.8s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#777587' }}>
            <span>0%</span>
            <span style={{ color: data.summary.pct >= 75 ? '#166534' : '#dc2626', fontWeight: 700 }}>75% required</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* ── Recent 30 days ── */}
      <div style={{ background: '#fff', border: '1px solid #e5eeff', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header + filter */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5eeff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>
            Last 30 Days
            <span style={{ marginLeft: 8, fontSize: 12, color: '#777587', fontWeight: 400 }}>
              ({filteredRecent.length} records)
            </span>
          </h2>
          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  border: 'none', borderRadius: 99, padding: '5px 12px', fontSize: 11.5, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  background: filter === f
                    ? (f === 'ALL' ? '#3525cd' : STATUS_BG[f])
                    : '#f0f2fb',
                  color: filter === f
                    ? (f === 'ALL' ? '#fff' : STATUS_COLOR[f])
                    : '#777587',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredRecent.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#777587' }}>
            No {filter === 'ALL' ? '' : filter.toLowerCase() + ' '}records in the last 30 days.
          </div>
        ) : (
          <div>
            {filteredRecent.map((r, i) => {
              const dateStr = new Date(r.date).toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px', flexWrap: 'wrap', gap: 8,
                  background: i % 2 === 0 ? '#fff' : '#fafbff',
                  borderTop: i === 0 ? 'none' : '1px solid #f5f6ff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Color dot */}
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: STATUS_COLOR[r.status] || '#d1d5db', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13.5, color: '#0b1c30', fontWeight: 600 }}>{dateStr}</span>
                  </div>
                  <span style={{
                    background: STATUS_BG[r.status] || '#f0f4ff',
                    color: STATUS_COLOR[r.status] || '#464555',
                    borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: 12,
                  }}>
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
