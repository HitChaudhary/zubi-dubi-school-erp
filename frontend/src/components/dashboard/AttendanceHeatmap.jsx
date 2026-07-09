// GitHub-style calendar heatmap for attendance records.
// records: [{ date, status }]  status: 'PRESENT' | 'ABSENT' | 'LATE'
// Renders `days` worth of history (default 120) as a week-column grid.

const STATUS_COLOR = {
  PRESENT: '#005338',
  LATE:    '#fbbf24',
  ABSENT:  '#ba1a1a',
  NONE:    '#eef0f6', // no record for that day
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function toDayKey(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export default function AttendanceHeatmap({ records = [], days = 120 }) {
  const byDay = new Map();
  for (const r of records) byDay.set(toDayKey(r.date), r.status);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a flat list of `days` calendar days ending today, oldest first,
  // padded at the start so the grid begins on a Sunday.
  const rangeStart = new Date(today);
  rangeStart.setDate(rangeStart.getDate() - (days - 1));

  const start = new Date(rangeStart);
  while (start.getDay() !== 0) start.setDate(start.getDate() - 1);

  const cells = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const key = toDayKey(cursor);
    const inRange = cursor >= rangeStart && cursor <= today;
    cells.push({
      date: new Date(cursor),
      status: inRange ? (byDay.get(key) || 'NONE') : null,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Group into week columns
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // Month labels: mark the week where a new month starts
  const monthLabels = weeks.map((week) => {
    const firstOfWeek = week[0]?.date;
    if (!firstOfWeek) return '';
    return firstOfWeek.getDate() <= 7 ? MONTH_LABELS[firstOfWeek.getMonth()] : '';
  });

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ display: 'inline-flex', gap: 3, marginLeft: 28 }}>
        {weeks.map((_, wi) => (
          <div key={wi} style={{ width: 12, fontSize: 10, color: '#9a98ab', textAlign: 'left' }}>
            {monthLabels[wi]}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 12px)', gap: 3, marginRight: 6 }}>
          {DAY_LABELS.map((d, i) => (
            <div key={d} style={{ fontSize: 9, color: '#9a98ab', height: 12, lineHeight: '12px' }}>
              {i % 2 === 1 ? d.slice(0, 1) : ''}
            </div>
          ))}
        </div>
        <div style={{ display: 'inline-flex', gap: 3 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateRows: 'repeat(7, 12px)', gap: 3 }}>
              {week.map((cell, di) => {
                const color = cell.status ? STATUS_COLOR[cell.status] : 'transparent';
                const title = cell.status
                  ? `${cell.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} — ${cell.status}`
                  : '';
                return (
                  <div
                    key={di}
                    title={title}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: color,
                      border: cell.status ? 'none' : (color === 'transparent' ? 'none' : '1px solid #e2e2ec'),
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, marginLeft: 28, fontSize: 11, color: '#777587' }}>
        <span>Less</span>
        {['NONE', 'LATE', 'ABSENT', 'PRESENT'].map((s) => (
          <div key={s} style={{ width: 12, height: 12, borderRadius: 3, background: STATUS_COLOR[s], border: s === 'NONE' ? '1px solid #e2e2ec' : 'none' }} />
        ))}
        <span>More</span>
        <span style={{ marginLeft: 12, display: 'flex', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLOR.PRESENT, display: 'inline-block' }} />Present</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLOR.LATE, display: 'inline-block' }} />Late</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLOR.ABSENT, display: 'inline-block' }} />Absent</span>
        </span>
      </div>
    </div>
  );
}
