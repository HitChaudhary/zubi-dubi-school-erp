// src/pages/teacher/TeacherAttendancePage.jsx
import { useState, useEffect } from 'react';
import MarkAttendance from '../../components/attendance/MarkAttendance';
import MonthlyReport  from '../../components/attendance/MonthlyReport';
import { api } from '../../utils/api';

const TABS = [
  { id: 'mark',    label: '✏️ Mark Attendance',  icon: 'fact_check'   },
  { id: 'daily',   label: '📊 Daily Report',      icon: 'today'        },
  { id: 'monthly', label: '📅 Monthly Report',    icon: 'calendar_month'},
];

const STATUS_COLOR = { PRESENT: '#166534', ABSENT: '#dc2626', LATE: '#ca8a04', LEAVE: '#1d4ed8' };
const STATUS_BG    = { PRESENT: '#dcfce7', ABSENT: '#fee2e2', LATE: '#fef9c3', LEAVE: '#dbeafe' };
const TODAY = new Date().toISOString().split('T')[0];

export default function TeacherAttendancePage() {
  const [tab,          setTab]          = useState('mark');
  const [dailyDate,    setDailyDate]    = useState(TODAY);
  const [dailyData,    setDailyData]    = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError,   setDailyError]   = useState('');

  const loadDaily = async (date) => {
    setDailyLoading(true); setDailyError(''); setDailyData(null);
    try {
      const res = await api.get(`/teacher/attendance/daily?date=${date}`);
      setDailyData(res);
    } catch (err) {
      setDailyError(err.message);
    } finally {
      setDailyLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'daily') loadDaily(dailyDate);
  }, [tab]);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0b1c30', margin: '0 0 6px 0' }}>Attendance</h1>
        <p style={{ color: '#777587', margin: 0, fontSize: 14 }}>
          Mark, review, and report student attendance for your classes.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: '#f0f2fb', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              border: 'none', borderRadius: 9, padding: '9px 20px',
              fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.15s',
              background: tab === t.id ? '#fff' : 'transparent',
              color:      tab === t.id ? '#3525cd' : '#777587',
              boxShadow:  tab === t.id ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Mark Attendance ── */}
      {tab === 'mark' && <MarkAttendance />}

      {/* ── Daily Report ── */}
      {tab === 'daily' && (
        <div>
          <div style={{ background: '#fff', border: '1px solid #e5eeff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0b1c30' }}>
              📊 Daily Report — All Classes
            </h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={dailyDate}
                  onChange={e => setDailyDate(e.target.value)}
                />
              </div>
              <button onClick={() => loadDaily(dailyDate)} disabled={dailyLoading}
                style={primaryBtn}>
                {dailyLoading ? 'Loading…' : 'View Report'}
              </button>
            </div>
          </div>

          {dailyError && (
            <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>{dailyError}</div>
          )}

          {dailyData && (
            <>
              {/* School-wide totals */}
              {(() => {
                const all = dailyData.classes.reduce((acc, c) => {
                  acc.present += c.present; acc.absent += c.absent;
                  acc.late    += c.late;    acc.leave  += c.leave;
                  acc.total   += c.total;
                  return acc;
                }, { present: 0, absent: 0, late: 0, leave: 0, total: 0 });
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 20 }}>
                    {[['present','Present','#dcfce7','#166534'],['absent','Absent','#fee2e2','#dc2626'],['late','Late','#fef9c3','#854d0e'],['leave','Leave','#dbeafe','#1e40af'],['total','Total','#e2dfff','#3525cd']].map(([k,l,bg,c]) => (
                      <div key={k} style={{ background: bg, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: c }}>{all[k]}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 600, color: c, opacity: 0.8 }}>{l}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Per-class breakdown */}
              {dailyData.classes.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#777587', border: '1px solid #e5eeff' }}>
                  No attendance records found for this date.
                </div>
              ) : (
                dailyData.classes.map(cls => (
                  <div key={cls.standard} style={{ background: '#fff', border: '1px solid #e5eeff', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                    {/* Class header */}
                    <div style={{ padding: '12px 18px', background: '#f8f9ff', borderBottom: '1px solid #e5eeff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#3525cd', fontSize: 14 }}>Class {cls.standard}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {[['present','P','#dcfce7','#166534'],['absent','A','#fee2e2','#dc2626'],['late','L','#fef9c3','#854d0e'],['leave','Lv','#dbeafe','#1e40af']].map(([k,l,bg,c]) => (
                          <span key={k} style={{ background: bg, color: c, borderRadius: 8, padding: '3px 10px', fontWeight: 700, fontSize: 12 }}>
                            {l}: {cls[k]}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Student rows */}
                    <div>
                      {cls.records.map((r, i) => (
                        <div key={r.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 18px', flexWrap: 'wrap', gap: 8,
                          background: i % 2 === 0 ? '#fff' : '#fafbff',
                          borderTop: '1px solid #f5f6ff',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 24, fontSize: 11, color: '#777587', fontWeight: 700 }}>
                              {r.student.rollNo || i + 1}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: 13.5, color: '#0b1c30' }}>{r.student.name}</span>
                          </div>
                          <span style={{
                            background: STATUS_BG[r.status], color: STATUS_COLOR[r.status],
                            borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: 12,
                          }}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}

      {/* ── Monthly Report ── */}
      {tab === 'monthly' && <MonthlyReport />}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#464555', marginBottom: 6 };
const inputStyle = { border: '1px solid #c7c4d8', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };
const primaryBtn = { background: '#3525cd', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 13.5, fontFamily: "'Plus Jakarta Sans', sans-serif" };
