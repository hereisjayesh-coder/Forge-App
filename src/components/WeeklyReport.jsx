import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, CheckSquare, Zap, Smile } from 'lucide-react';
import { getToday, addDays, getHabitCompletionData, getCompletionRate, getTotalCompletions } from '../utils/streakCalculator';
import { MOODS } from '../utils/constants';
import './WeeklyReport.css';

export default function WeeklyReport({ completions, habits, journal, user }) {
   const today = getToday();

   // This Week vs Last Week
   const thisWeekDays = Array.from({ length: 7 }, (_, i) => addDays(today, -i));
   const lastWeekDays = Array.from({ length: 7 }, (_, i) => addDays(today, -(i + 7)));

   // Stats for this week
   const thisWeekRate = getCompletionRate(completions, habits, thisWeekDays);
   const thisWeekCompletions = thisWeekDays.reduce((acc, date) => acc + Object.keys(completions[date] || {}).length, 0);

   // Stats for last week
   const lastWeekRate = getCompletionRate(completions, habits, lastWeekDays);
   const lastWeekCompletions = lastWeekDays.reduce((acc, date) => acc + Object.keys(completions[date] || {}).length, 0);

   // Deltas
   const rateDelta = thisWeekRate - lastWeekRate;
   const compDelta = thisWeekCompletions - lastWeekCompletions;

   // Best day this week
   const bestDay = useMemo(() => {
      let max = 0;
      let day = '';
      thisWeekDays.forEach(d => {
         const count = Object.keys(completions[d] || {}).length;
         if (count > max) { max = count; day = d; }
      });
      if (!max) return null;
      const dateObj = new Date(day + 'T00:00:00');
      return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
   }, [completions, thisWeekDays]);

   // Average mood this week
   const avgMood = useMemo(() => {
      const weekEntries = journal.filter(j => thisWeekDays.includes(j.date));
      if (!weekEntries.length) return null;

      const moodScores = { 'rad': 5, 'good': 4, 'meh': 3, 'bad': 2, 'awful': 1 };
      const total = weekEntries.reduce((acc, j) => acc + (moodScores[j.mood] || 3), 0);
      const avgScore = Math.round(total / weekEntries.length);

      const valueToMood = { 5: 'rad', 4: 'good', 3: 'meh', 2: 'bad', 1: 'awful' };
      const finalMoodValue = valueToMood[avgScore];
      return MOODS.find(m => m.value === finalMoodValue);
   }, [journal, thisWeekDays]);

   return (
      <div className="weekly-report glass-card">
         <div className="report-header">
            <h3>Weekly Summary</h3>
            <span className="report-date-range">Last 7 Days</span>
         </div>

         <div className="report-grid">
            <div className="report-metric">
               <div className="metric-header">
                  <CheckSquare size={16} className="metric-icon" />
                  <span>Completions</span>
               </div>
               <div className="metric-value">{thisWeekCompletions}</div>
               <div className={`metric-delta ${compDelta > 0 ? 'positive' : compDelta < 0 ? 'negative' : 'neutral'}`}>
                  {compDelta > 0 ? <TrendingUp size={14} /> : compDelta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                  <span>{Math.abs(compDelta)} vs last week</span>
               </div>
            </div>

            <div className="report-metric">
               <div className="metric-header">
                  <TrendingUp size={16} className="metric-icon" />
                  <span>Hit Rate</span>
               </div>
               <div className="metric-value">{thisWeekRate}%</div>
               <div className={`metric-delta ${rateDelta > 0 ? 'positive' : rateDelta < 0 ? 'negative' : 'neutral'}`}>
                  {rateDelta > 0 ? <TrendingUp size={14} /> : rateDelta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                  <span>{Math.abs(rateDelta)}% vs last week</span>
               </div>
            </div>

            <div className="report-metric">
               <div className="metric-header">
                  <Calendar size={16} className="metric-icon" />
                  <span>Best Day</span>
               </div>
               <div className="metric-value text-capitalize">{bestDay || '-'}</div>
               <div className="metric-delta neutral">
                  <span>Most habits completed</span>
               </div>
            </div>

            <div className="report-metric">
               <div className="metric-header">
                  <Smile size={16} className="metric-icon" />
                  <span>Avg Mood</span>
               </div>
               <div className="metric-value">
                  {avgMood ? (
                     <span style={{ color: avgMood.color }}>{avgMood.emoji} {avgMood.label}</span>
                  ) : '-'}
               </div>
               <div className="metric-delta neutral">
                  <span>Based on journal entries</span>
               </div>
            </div>
         </div>
      </div>
   );
}
