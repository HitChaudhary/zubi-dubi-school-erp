// src/components/attendance/MarkAttendance.jsx
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'];

const STATUS_STYLE = {
  PRESENT: { active: { background: '#166534', color: '#fff' }, base: { background: '#dcfce7', color: '#166534' } },
  LATE:    { active: { background: '#ca8a04', color: '#fff' }, base: { background: '#fef9c3', color: '#854d0e' } },
  LEAVE:   { active: { background: '#1d4ed8', color: '#fff' }, base: { background: '#dbeafe', color: '#1e40af' } },
  ABSENT:  { active: { background: '#dc2626', color: '#fff' }, base: { background: '#fee2e2', color: '#991b1b' } },
};

const TODAY = new Date().toISOString().split('T')[0];

export default function MarkAttendance() {
  const [standard,  setStandard]  = useState('');
  const [date,      setDate]      = useState(TODAY);
  const [students,  setStudents]  = useState([]);
  const [records,   setRecords]   = useState({});   // { studentId: 'PRESENT' }
  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState('');
  const [msgType,   setMsgType]   = useState('');   // 'success' | 'error'

  const flash = (text, type = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const loadStudents = async () => {
    if (!standard.trim()) return;
    setLoading(true); setMsg(''); setStudents([]); setRecords({});
    try {
      const { students: list }  = await api.get(`/teacher/attendance/students?standard=${encodeURIComponent(standard)}`);
      const { records: saved }  = await api.get(`/teacher/attendance?standard=${encodeURIComponent(standard)}&date=${date}`);

      setStudents(list);

      // Default everyone to PRESENT, then override with saved
      const map = {};
      list.forEach(s => { map[s.id] = 'PRESENT'; });
      saved.forEach(r => { map[r.student.id] = r.status; });
      setRecords(map);

      if (list.length === 0) flash(`No students found in class "${standard}". Check the class name.`, 'error');
    } catch (err) {
      flash(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const setAll = (status) => {
    const map = {};
    students.forEach(s => { map[s.id] = status; });
    setRecords(map);
  };

  const setOne = (id, status) => setRecords(prev => ({ ...prev, [id]: status }));

  const save = async () => {
    if (students.length === 0) return;
    setSaving(true); setMsg('');
    try {
      const payload = Object.entries(records).map(([studentId, status]) => ({
        studentId: Number(studentId), status,
      }));
      await api.post('/teacher/attendance', { standard, date, records: payload });
      flash(`✅ Attendance saved for ${payload.length} students in Class ${standard}.`);
    } catch (err) {
      flash(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Counts
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = Object.values(records).filter(v => v === s).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Controls */}
      <div style={{ background: '#fff', border: '1px solid #e5eeff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>
          📋 Mark Attendance
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={labelStyle}>Class / Standard</label>
            <input
              style={inputStyle}
              placeholder="e.g. 10A"
              value={standard}
              onChange={e => setStandard(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadStudents()}
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={labelStyle}>Date</label>
            <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <button onClick={loadStudents} disabled={!standard || loading} style={primaryBtn}>
            {loading ? 'Loading…' : 'Load Students'}
          </button>
        </div>
      </div>

      {/* Alert */}
      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13.5, fontWeight: 600,
          background: msgType === 'error' ? '#fee2e2' : '#dcfce7',
          color:      msgType === 'error' ? '#991b1b' : '#166534',
        }}>
          {msg}
        </div>
      )}

      {/* Student list */}
      {students.length > 0 && (
        <>
          {/* Summary + bulk actions */}
          <div style={{ background: '#fff', border: '1px solid #e5eeff', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              {/* Counts */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <div key={s} style={{ ...STATUS_STYLE[s].base, borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 13 }}>
                    {s}: {counts[s]}
                  </div>
                ))}
                <div style={{ background: '#f0f4ff', color: '#3525cd', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 13 }}>
                  Total: {students.length}
                </div>
              </div>

              {/* Bulk buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#777587', alignSelf: 'center' }}>Mark all:</span>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setAll(s)}
                    style={{ ...STATUS_STYLE[s].base, border: 'none', borderRadius: 7, padding: '6px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Per-student rows */}
          <div style={{ background: '#fff', border: '1px solid #e5eeff', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0b1c30' }}>
                Class {standard} — {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span style={{ fontSize: 12, color: '#777587' }}>{students.length} students</span>
            </div>

            {students.map((student, i) => {
              const status = records[student.id] || 'PRESENT';
              return (
                <div key={student.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 18px', flexWrap: 'wrap', gap: 10,
                  background: i % 2 === 0 ? '#fff' : '#fafbff',
                  borderTop: i === 0 ? 'none' : '1px solid #f5f6ff',
                }}>
                  {/* Student info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#e2dfff,#c3c0ff)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 13, color: '#3525cd', flexShrink: 0,
                    }}>
                      {student.rollNo || i + 1}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0b1c30' }}>{student.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#777587' }}>{student.email}</p>
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => setOne(student.id, s)}
                        style={{
                          border: 'none', borderRadius: 8, padding: '7px 14px',
                          fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.15s',
                          ...(status === s ? STATUS_STYLE[s].active : STATUS_STYLE[s].base),
                        }}
                      >
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button onClick={save} disabled={saving} style={{ ...primaryBtn, padding: '12px 32px', fontSize: 14 }}>
              {saving ? 'Saving…' : `💾 Save Attendance (${students.length} students)`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#464555', marginBottom: 6 };
const inputStyle = {
  width: '100%', border: '1px solid #c7c4d8', borderRadius: 8,
  padding: '10px 14px', fontSize: 14, outline: 'none',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
};
const primaryBtn = {
  background: '#3525cd', color: '#fff', border: 'none', borderRadius: 8,
  padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};
