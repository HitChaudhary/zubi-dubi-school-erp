// src/components/attendance/AttendanceHeatmap.jsx
// GitHub-style contribution heatmap for student attendance

const STATUS_COLOR = {
  PRESENT: { bg: '#2da44e', label: 'Present'  },   // strong green
  LATE:    { bg: '#96d6a0', label: 'Late'      },   // light green
  LEAVE:   { bg: '#a8c5da', label: 'Leave'     },   // blue
  ABSENT:  { bg: '#ef4444', label: 'Absent'    },   // red
  null:    { bg: '#ebedf0', label: 'No record' },   // github grey
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Build a 52-week grid starting from today - 364 days
function buildGrid(heatmap) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from Sunday 52 weeks ago
  const start = new Date(today);
  start.setDate(today.getDate() - 364);
  // Roll back to previous Sunday
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  let current = new Date(start);

  while (current <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key = current.toISOString().split('T')[0];
      const isFuture = current > today;
      week.push({
        date:    key,
        status:  isFuture ? 'FUTURE' : (heatmap[key] || null),
        day:     current.getDay(),
        month:   current.getMonth(),
        dateObj: new Date(current),
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

// Build month label positions
function buildMonthLabels(weeks) {
  const labels = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = week.find(d => d.status !== 'FUTURE');
    if (firstDay && firstDay.month !== lastMonth) {
      labels.push({ month: firstDay.month, weekIndex: i });
      lastMonth = firstDay.month;
    }
  });
  return labels;
}

export default function AttendanceHeatmap({ heatmap = {}, summary = {} }) {
  const weeks       = buildGrid(heatmap);
  const monthLabels = buildMonthLabels(weeks);

  const CELL  = 13;
  const GAP   = 3;
  const STEP  = CELL + GAP;
  const LEFT  = 32; // space for day labels

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>

      {/* Summary badges */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { key: 'present', label: 'Present', color: '#2da44e', bg: '#dcfce7' },
          { key: 'late',    label: 'Late',    color: '#16a34a', bg: '#d1fae5' },
          { key: 'absent',  label: 'Absent',  color: '#dc2626', bg: '#fee2e2' },
          { key: 'leave',   label: 'Leave',   color: '#2563eb', bg: '#dbeafe' },
        ].map(({ key, label, color, bg }) => (
          <div key={key} style={{ background: bg, borderRadius: 10, padding: '10px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color }}>{summary[key] ?? 0}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color, opacity: 0.8, marginTop: 2 }}>{label}</span>
          </div>
        ))}
        {summary.pct !== null && summary.pct !== undefined && (
          <div style={{
            background: summary.pct >= 75 ? '#dcfce7' : '#fee2e2',
            borderRadius: 10, padding: '10px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80,
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: summary.pct >= 75 ? '#166534' : '#dc2626' }}>{summary.pct}%</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: summary.pct >= 75 ? '#166534' : '#dc2626', opacity: 0.8, marginTop: 2 }}>
              {summary.pct >= 75 ? 'Good' : '⚠ Low'}
            </span>
          </div>
        )}
      </div>

      {/* Heatmap grid */}
      <svg
        width={LEFT + weeks.length * STEP + 10}
        height={50 + 7 * STEP}
        style={{ display: 'block' }}
      >
        {/* Month labels */}
        {monthLabels.map(({ month, weekIndex }) => (
          <text
            key={`m-${month}-${weekIndex}`}
            x={LEFT + weekIndex * STEP}
            y={14}
            fontSize={10}
            fill="#57606a"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {MONTHS[month]}
          </text>
        ))}

        {/* Weekday labels — only Mon, Wed, Fri to match GitHub style */}
        {[1, 3, 5].map(d => (
          <text
            key={`wd-${d}`}
            x={0}
            y={20 + d * STEP + CELL * 0.75}
            fontSize={9}
            fill="#57606a"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {WEEKDAYS[d]}
          </text>
        ))}

        {/* Cells */}
        {weeks.map((week, wi) =>
          week.map((cell, di) => {
            if (cell.status === 'FUTURE') return null;
            const color = cell.status === null
              ? STATUS_COLOR[null].bg
              : (STATUS_COLOR[cell.status]?.bg || STATUS_COLOR[null].bg);
            return (
              <g key={`${wi}-${di}`}>
                <rect
                  x={LEFT + wi * STEP}
                  y={20 + di * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  ry={2}
                  fill={color}
                >
                  <title>{cell.date}: {cell.status ? STATUS_COLOR[cell.status]?.label : 'No record'}</title>
                </rect>
              </g>
            );
          })
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: '#57606a' }}>
        <span>Less</span>
        {[null, 'LATE', 'PRESENT', 'LEAVE', 'ABSENT'].map((s, i) => (
          <div
            key={i}
            title={STATUS_COLOR[s]?.label}
            style={{
              width: CELL, height: CELL, borderRadius: 2,
              background: STATUS_COLOR[s]?.bg || STATUS_COLOR[null].bg,
            }}
          />
        ))}
        <span>More</span>
        <span style={{ marginLeft: 12 }}>
          {Object.entries({ '': 'No record', PRESENT: 'Present', LATE: 'Late', ABSENT: 'Absent', LEAVE: 'Leave' })
            .map(([k, v]) => (
              <span key={k} style={{ marginRight: 10 }}>
                <span style={{
                  display: 'inline-block', width: 9, height: 9, borderRadius: 2,
                  background: STATUS_COLOR[k || null]?.bg, marginRight: 3, verticalAlign: 'middle',
                }} />
                {v}
              </span>
            ))
          }
        </span>
      </div>
    </div>
  );
}
