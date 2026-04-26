import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
   getLast7Days, getLast30Days, getLast90Days, getDailyCompletionData,
   getHabitCompletionData, calculateCurrentStreak, calculateLongestStreak,
   getTotalCompletions, getCompletionRate, getToday, addDays,
} from '../utils/streakCalculator';
import { getRankForXP } from '../utils/rankSystem';
import {
   LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
   ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { TrendingUp, Trophy, Flame, Target, Zap } from 'lucide-react';
import HeatmapCalendar from '../components/HeatmapCalendar';
import WeeklyReport from '../components/WeeklyReport';
import './Analytics.css';

const RANGES = [
   { key: '7d', label: '7 Days', fn: getLast7Days },
   { key: '30d', label: '30 Days', fn: getLast30Days },
   { key: '90d', label: '90 Days', fn: getLast90Days },
];

export default function Analytics() {
   const { state } = useApp();
   const { habits, completions, user, journal } = state;
   const [range, setRange] = useState('30d');

   const rangeObj = RANGES.find(r => r.key === range);
   const dateRange = rangeObj.fn();

   const dailyData = getDailyCompletionData(completions, habits, dateRange);
   const habitData = getHabitCompletionData(completions, habits, dateRange);
   const currentStreak = calculateCurrentStreak(completions, habits);
   const longestStreak = calculateLongestStreak(completions, habits);
   const totalCompletions = getTotalCompletions(completions);
   const periodRate = getCompletionRate(completions, habits, dateRange);
   const rank = getRankForXP(user.xp);

   // Heatmap data (last 90 days) - in weekly grid
   const heatmapDays = getLast90Days();
   const today = getToday();

   return (
      <div className="analytics-page animate-fade-in">
         <div className="page-header">
            <h1>📊 Analytics</h1>
            <p>Track your progress with hard numbers.</p>
         </div>

         {/* Overview Stats */}
         <div className="stats-grid">
            <div className="stat-card">
               <Zap size={20} className="stat-icon" />
               <span className="stat-label">Total XP</span>
               <span className="stat-value">{user.xp}</span>
            </div>
            <div className="stat-card">
               <Target size={20} className="stat-icon" />
               <span className="stat-label">Completions</span>
               <span className="stat-value">{totalCompletions}</span>
            </div>
            <div className="stat-card">
               <Flame size={20} className="stat-icon" />
               <span className="stat-label">Current Streak</span>
               <span className="stat-value">{currentStreak}</span>
            </div>
            <div className="stat-card">
               <Trophy size={20} className="stat-icon" />
               <span className="stat-label">Longest Streak</span>
               <span className="stat-value">{longestStreak}</span>
            </div>
         </div>

         <WeeklyReport completions={completions} habits={habits} journal={journal} user={user} />

         {/* Range Selector */}
         <div className="range-selector">
            {RANGES.map(r => (
               <button
                  key={r.key}
                  className={`range-btn ${range === r.key ? 'active' : ''}`}
                  onClick={() => setRange(r.key)}
               >
                  {r.label}
               </button>
            ))}
         </div>

         {/* Completion Rate Over Time */}
         <div className="analytics-chart glass-card">
            <div className="chart-header">
               <h3><TrendingUp size={18} /> Completion Rate</h3>
               <span className="badge badge-accent">{periodRate}% average</span>
            </div>
            <div className="chart-container">
               <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dailyData}>
                     <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                           <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                     <XAxis
                        dataKey="date"
                        tickFormatter={d => d.slice(5)}
                        stroke="var(--text-muted)"
                        fontSize={11}
                        interval="preserveStartEnd"
                     />
                     <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                     <Tooltip
                        contentStyle={{
                           background: 'var(--bg-secondary)',
                           border: '1px solid var(--border-color)',
                           borderRadius: '8px',
                           color: 'var(--text-primary)',
                        }}
                        formatter={(v) => [`${v}%`, 'Rate']}
                        labelFormatter={(l) => l}
                     />
                     <Area type="monotone" dataKey="rate" stroke="#8b5cf6" fill="url(#areaGrad)" strokeWidth={2} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Per-Habit Comparison */}
         {habitData.length > 0 && (
            <div className="analytics-chart glass-card">
               <div className="chart-header">
                  <h3>📊 Habit Comparison</h3>
               </div>
               <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                     <BarChart data={habitData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} />
                        <YAxis dataKey="name" type="category" width={90} stroke="var(--text-muted)" fontSize={11} />
                        <Tooltip
                           contentStyle={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              color: 'var(--text-primary)',
                           }}
                           formatter={(v) => [`${v}%`, 'Completion Rate']}
                        />
                        <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                           {habitData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         )}

         {/* Heatmap Calendar */}
         <div className="analytics-chart glass-card">
            <div className="chart-header">
               <h3>🗓️ 365-Day Contribution Heatmap</h3>
            </div>
            <HeatmapCalendar completions={completions} habits={habits} />
         </div>
      </div>
   );
}
