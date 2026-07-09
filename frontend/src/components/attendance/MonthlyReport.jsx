// src/components/attendance/MonthlyReport.jsx
import { useState } from 'react';
import { api } from '../../utils/api';

const STATUS_COLOR = {
  PRESENT: '#166534',
  ABSENT:  '#dc2626',
  LATE:    '#ca8a04',
  LEAVE:   '#1d4ed8',
};
const STATUS_BG = {
  PRESENT: '#dcfce7',
  ABSENT:  '#fee2e2',
  LATE:    '#fef9c3',
  LEAVE:   '#dbeafe',
};

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

export default function MonthlyReport() {
  const now = new Date();
  const [standard,  setStandard]  = useState('');
  const [year,      setYear]      = useState(now.getFullYear());
  const [month,     setMonth]     = useState(now.getMonth() + 1);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const load = async () => {
    if (!standard.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await api.get(`/teacher/attendance/monthly?standard=${encodeURIComponent(standard)}&year=${year}&month=${month}`);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalDays = data ? daysInMonth(year, month) : 0;
  const days = data ? Array.from({ length: totalDays }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    return `${year}-${String(month).padStart(2, '0')}-${d}`;
  }) : [];

  return (
    <div>
      {/* Controls */}
      <div style={{ background: '#fff', border: '1px solid #e5eeff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>
          📅 Monthly Attendance Report
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={labelStyle}>Class</label>
            <input style={inputStyle} placeholder="e.g. 10A" value={standard} onChange={e => setStandard(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <label style={labelStyle}>Month</label>
            <select style={inputStyle} value={month} onChange={e => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 90 }}>
            <label style={labelStyle}>Year</label>
            <input type="number" style={inputStyle} value={year} min={2020} max={2030}
              onChange={e => setYear(Number(e.target.value))} />
          </div>
          <button onClick={load} disabled={!standard || loading} style={primaryBtn}>
            {loading ? 'Loading…' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0b1c30' }}>
              Class {data.standard} — {MONTHS[data.month - 1]} {data.year}
            </h3>
            <span style={{ fontSize: 13, color: '#777587' }}>{data.students.length} students · {totalDays} days</span>
          </div>

          {data.students.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#777587', border: '1px solid #e5eeff' }}>
              No attendance records found for this class and month.
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5eeff', borderRadius: 12, overflow: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 12, whiteSpace: 'nowrap', width: '100%' }}>
                <thead>
                  {/* Day numbers row */}
                  <tr style={{ background: '#f8f9ff' }}>
                    <th style={{ ...th, minWidth: 140, textAlign: 'left', position: 'sticky', left: 0, background: '#f8f9ff', zIndex: 2 }}>Student</th>
                    {days.map((d, i) => (
                      <th key={d} style={{ ...th, minWidth: 28, fontWeight: 700, color: '#3525cd' }}>{i + 1}</th>
                    ))}
                    <th style={{ ...th, minWidth: 50, color: '#166534' }}>P</th>
                    <th style={{ ...th, minWidth: 50, color: '#dc2626' }}>A</th>
                    <th style={{ ...th, minWidth: 50, color: '#ca8a04' }}>L</th>
                    <th style={{ ...th, minWidth: 50, color: '#1d4ed8' }}>Lv</th>
                    <th style={{ ...th, minWidth: 60 }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((row, ri) => (
                    <tr key={row.student.id} style={{ borderTop: '1px solid #f0f4ff', background: ri % 2 === 0 ? '#fff' : '#fafbff' }}>
                      {/* Student name — sticky */}
                      <td style={{ ...td, position: 'sticky', left: 0, background: ri % 2 === 0 ? '#fff' : '#fafbff', zIndex: 1, fontWeight: 700, color: '#0b1c30' }}>
                        <span style={{ fontSize: 11, color: '#777587', marginRight: 6 }}>
                          {row.student.rollNo || '—'}
                        </span>
                        {row.student.name}
                      </td>

                      {/* Day cells */}
                      {days.map(d => {
                        const s = row.days[d];
                        const letter = s ? s[0] : '';
                        return (
                          <td key={d} style={{ ...td, textAlign: 'center' }} title={s || 'No record'}>
                            {s ? (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 20, height: 20, borderRadius: 4,
                                background: STATUS_BG[s], color: STATUS_COLOR[s],
                                fontWeight: 800, fontSize: 10,
                              }}>
                                {letter}
                              </span>
                            ) : (
                              <span style={{ color: '#d1d5db', fontSize: 10 }}>·</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Totals */}
                      <td style={{ ...td, textAlign: 'center', color: '#166534', fontWeight: 700 }}>{row.present}</td>
                      <td style={{ ...td, textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>{row.absent}</td>
                      <td style={{ ...td, textAlign: 'center', color: '#ca8a04', fontWeight: 700 }}>{row.late}</td>
                      <td style={{ ...td, textAlign: 'center', color: '#1d4ed8', fontWeight: 700 }}>{row.leave}</td>
                      <td style={{ ...td, textAlign: 'center' }}>
                        {(() => {
                          const total = row.present + row.absent + row.late + row.leave;
                          const pct = total > 0 ? Math.round(((row.present + row.late) / total) * 100) : null;
                          return pct !== null ? (
                            <span style={{
                              background: pct >= 75 ? '#dcfce7' : '#fee2e2',
                              color:      pct >= 75 ? '#166534' : '#dc2626',
                              borderRadius: 99, padding: '2px 8px', fontWeight: 700, fontSize: 11,
                            }}>
                              {pct}%
                            </span>
                          ) : '—';
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12, color: '#777587' }}>
            {[['P','PRESENT','#dcfce7','#166534'],['A','ABSENT','#fee2e2','#dc2626'],['L','LATE','#fef9c3','#854d0e'],['Lv','LEAVE','#dbeafe','#1e40af']].map(([l, s, bg, c]) => (
              <span key={s}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 3, background: bg, color: c, fontWeight: 800, fontSize: 9, marginRight: 4 }}>{l}</span>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#464555', marginBottom: 6 };
const inputStyle = { width: '100%', border: '1px solid #c7c4d8', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };
const primaryBtn = { background: '#3525cd', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 13.5, fontFamily: "'Plus Jakarta Sans', sans-serif" };
const th = { padding: '10px 6px', color: '#777587', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e5eeff' };
const td = { padding: '9px 6px' };
