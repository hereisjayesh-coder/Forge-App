import { useMemo } from 'react';
import './HeatmapCalendar.css';

export default function HeatmapCalendar({ completions, habits }) {
   const data = useMemo(() => {
      // Generate last 365 days
      const today = new Date();
      const days = [];

      for (let i = 364; i >= 0; i--) {
         const d = new Date(today);
         d.setDate(d.getDate() - i);
         const dateStr = d.toISOString().split('T')[0];
         const dayCompletions = completions[dateStr] || {};
         const completedCount = Object.keys(dayCompletions).length;

         days.push({
            date: dateStr,
            count: completedCount,
            dayOfWeek: d.getDay(),
            month: d.getMonth(),
         });
      }

      // Group into weeks (columns)
      const weeks = [];
      let currentWeek = [];
      for (const day of days) {
         if (day.dayOfWeek === 0 && currentWeek.length > 0) {
            weeks.push(currentWeek);
            currentWeek = [];
         }
         currentWeek.push(day);
      }
      if (currentWeek.length) weeks.push(currentWeek);

      // Month labels
      const months = [];
      let lastMonth = -1;
      weeks.forEach((week, i) => {
         const firstDay = week[0];
         if (firstDay.month !== lastMonth) {
            months.push({ month: firstDay.month, weekIndex: i });
            lastMonth = firstDay.month;
         }
      });

      return { weeks, months, maxCount: Math.max(...days.map(d => d.count), 1) };
   }, [completions]);

   const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
   const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

   const getLevel = (count) => {
      if (count === 0) return 0;
      const pct = count / data.maxCount;
      if (pct <= 0.25) return 1;
      if (pct <= 0.5) return 2;
      if (pct <= 0.75) return 3;
      return 4;
   };

   return (
      <div className="heatmap-calendar">
         <div className="heatmap-scroll">
            <div className="heatmap-grid">
               {/* Day labels */}
               <div className="heatmap-day-labels">
                  {dayLabels.map((label, i) => (
                     <span key={i} className="heatmap-day-label">{label}</span>
                  ))}
               </div>
               <div className="heatmap-weeks-area">
                  {/* Month labels */}
                  <div className="heatmap-month-labels">
                     {data.months.map((m, i) => (
                        <span
                           key={i}
                           className="heatmap-month-label"
                           style={{ gridColumn: m.weekIndex + 1 }}
                        >
                           {monthNames[m.month]}
                        </span>
                     ))}
                  </div>
                  {/* Cells */}
                  <div className="heatmap-weeks">
                     {data.weeks.map((week, wi) => (
                        <div key={wi} className="heatmap-week">
                           {/* Pad empty cells for partial first week */}
                           {wi === 0 && Array.from({ length: week[0].dayOfWeek }, (_, i) => (
                              <div key={`pad-${i}`} className="heatmap-cell-wrap" />
                           ))}
                           {week.map(day => (
                              <div
                                 key={day.date}
                                 className={`heatmap-cell-wrap`}
                                 title={`${day.date}: ${day.count} habit${day.count !== 1 ? 's' : ''} completed`}
                              >
                                 <div className={`hm-cell level-${getLevel(day.count)}`} />
                              </div>
                           ))}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
         <div className="heatmap-legend">
            <span>Less</span>
            <div className="hm-cell level-0" />
            <div className="hm-cell level-1" />
            <div className="hm-cell level-2" />
            <div className="hm-cell level-3" />
            <div className="hm-cell level-4" />
            <span>More</span>
         </div>
      </div>
   );
}
