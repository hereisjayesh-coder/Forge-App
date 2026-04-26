import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getRankForXP, getXPProgress, getNextRank } from '../utils/rankSystem';
import {
   getToday, getScheduledHabits, calculateCurrentStreak,
   calculateLongestStreak, getLast7Days, getCompletionRate, daysBetween,
} from '../utils/streakCalculator';
import { formatTarget, formatLog, isJournalComplete } from '../utils/progressionEngine';
import { getDailyChallenge, checkChallengeCompletion } from '../utils/dailyChallenges';
import { useToast } from '../components/AchievementToast';
import LevelUpCelebration from '../components/LevelUpCelebration';
import { Flame, Trophy, Target, Zap, CheckCircle2, Circle, Undo2, BookOpen, Star, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HabitLogModal from '../components/HabitLogModal';
import './Dashboard.css';

export default function Dashboard() {
   const { state, dispatch } = useApp();
   const { habits, completions, user, forgeMode, journal, settings } = state;
   const today = getToday();
   const [selectedDate, setSelectedDate] = useState(today);
   const currentCompletions = completions[selectedDate] || {};
   const navigate = useNavigate();
   const [logModalHabit, setLogModalHabit] = useState(null);
   const { addToast } = useToast();

   // Level-up celebration state
   const [levelUpData, setLevelUpData] = useState(null);

   // Refs to track previous values for milestone detection
   const prevXPRef = useRef(user.xp);
   const prevStreakRef = useRef(null);
   const prevCompletionsRef = useRef(user.totalCompletions);

   // Check completion — journal habits auto-check from journal entries
   const isHabitComplete = (habit) => {
      if (habit.trackingType === 'journal') {
         return isJournalComplete(journal, selectedDate);
      }
      return !!currentCompletions[habit.id];
   };

   const scheduledToday = getScheduledHabits(habits, selectedDate);
   const completedToday = scheduledToday.filter(h => isHabitComplete(h)).length;
   const todayRate = scheduledToday.length ? Math.round((completedToday / scheduledToday.length) * 100) : 0;

   // Daily Challenge
   const dailyChallenge = getDailyChallenge();
   const challengeCompleted = user.dailyChallengeCompleted === today || checkChallengeCompletion(dailyChallenge, state, today);

   // Rank
   const rank = getRankForXP(user.xp);
   const xpProgress = getXPProgress(user.xp);
   const nextRank = getNextRank(rank);

   // Streaks
   const currentStreak = calculateCurrentStreak(completions, habits);
   const longestStreak = calculateLongestStreak(completions, habits);
   const weeklyRate = getCompletionRate(completions, habits, getLast7Days());

   // === MILESTONE DETECTION ===
   useEffect(() => {
      const prevXP = prevXPRef.current;
      const prevCompletions = prevCompletionsRef.current;

      // Only trigger on actual changes (not initial load)
      if (prevXP === user.xp) return;

      // Rank-up detection
      const oldRank = getRankForXP(prevXP);
      const newRank = getRankForXP(user.xp);
      if (newRank.level > oldRank.level) {
         setLevelUpData({ oldRank, newRank });
      }

      // XP / Combo toast
      const xpGained = user.xp - prevXP;
      if (xpGained === 15 && !levelUpData) {
         // Base 10 + 5 Combo
         addToast({ title: 'Combo Strike! ⚡', message: '+15 XP', variant: 'xp' });
      }

      // Daily Challenge completion
      if (challengeCompleted && user.dailyChallengeCompleted !== today) {
         dispatch({ type: 'COMPLETE_CHALLENGE', payload: { date: today, xpReward: dailyChallenge.xpReward } });
         addToast({
            title: `Challenge Complete!`,
            message: `${dailyChallenge.title} (+${dailyChallenge.xpReward} XP)`,
            icon: dailyChallenge.icon,
            variant: 'perfect',
         });
      }

      // First habit completion
      if (prevCompletions === 0 && user.totalCompletions === 1) {
         addToast({
            title: 'First Strike! 🔨',
            message: 'You completed your first habit. The forge is heating up!',
            icon: '🔨',
            variant: 'milestone',
         });
      }

      // Perfect day (all habits done today)
      if (scheduledToday.length > 0 && completedToday === scheduledToday.length && completedToday > 1) {
         const prevCompleted = Object.keys(completions[today] || {}).length;
         // Only fire when we just hit 100%  
         if (user.totalCompletions > prevCompletions) {
            addToast({
               title: 'Perfect Day! ⭐',
               message: `All ${scheduledToday.length} habits crushed. You're unstoppable!`,
               icon: '⭐',
               variant: 'perfect',
            });
         }
      }

      prevXPRef.current = user.xp;
      prevCompletionsRef.current = user.totalCompletions;
   }, [user.xp, user.totalCompletions]);

   // Streak milestone detection (separate effect)
   useEffect(() => {
      if (prevStreakRef.current === null) {
         prevStreakRef.current = currentStreak;
         return;
      }
      const prevStreak = prevStreakRef.current;

      const milestones = [
         { days: 7, title: '7-Day Warrior! 🔥', msg: 'A full week of discipline.' },
         { days: 14, title: '14-Day Iron Will! ⚒️', msg: 'Two weeks of forging.' },
         { days: 30, title: '30-Day Champion! ⚔️', msg: 'A month of relentless effort.' },
         { days: 60, title: '60-Day Legend! 💪', msg: 'Two months of iron will.' },
         { days: 100, title: 'Century Club! 💯', msg: '100 days. Truly unstoppable.' },
         { days: 365, title: 'Year of Iron! 🏆', msg: 'An entire year. You are forged.' },
      ];

      for (const m of milestones) {
         if (currentStreak >= m.days && prevStreak < m.days) {
            addToast({
               title: m.title,
               message: m.msg,
               variant: 'streak',
               duration: 6000,
            });
            break;
         }
      }

      prevStreakRef.current = currentStreak;
   }, [currentStreak]);

   // Forge Mode progress
   let forgeProgress = null;
   if (forgeMode?.active) {
      const totalDays = forgeMode.duration;
      const elapsed = daysBetween(forgeMode.startDate, today);
      const pct = Math.min(Math.round((elapsed / totalDays) * 100), 100);
      forgeProgress = { elapsed, totalDays, pct };
   }

   const isTimeLocked = (habit) => {
      if (!habit.targetTime || selectedDate !== today) return false;
      const now = new Date();
      const [tHours, tMins] = habit.targetTime.split(':').map(Number);
      if (now.getHours() < tHours) return true;
      if (now.getHours() === tHours && now.getMinutes() < tMins) return true;
      return false;
   };

   const handleHabitClick = (habit) => {
      const completed = isHabitComplete(habit);
      if (completed) return; // Already done

      if (isTimeLocked(habit)) {
         addToast({ title: 'Time Locked 🔒', message: `This habit unlocks at ${habit.targetTime}`, variant: 'info' });
         return;
      }

      // Journal type → go to journal page
      if (habit.trackingType === 'journal') {
         navigate('/journal');
         return;
      }

      // Checkbox → direct log
      if (habit.trackingType === 'checkbox' || !habit.trackingType) {
         dispatch({ type: 'LOG_HABIT', payload: { habitId: habit.id, date: selectedDate, log: { done: true }, timestamp: Date.now() } });
         return;
      }

      // Exercise/Duration/Quantity → open modal
      setLogModalHabit(habit);
   };

   const handleLogSubmit = (log) => {
      dispatch({ type: 'LOG_HABIT', payload: { habitId: logModalHabit.id, date: selectedDate, log, timestamp: Date.now() } });
      setLogModalHabit(null);
   };

   const handleUndo = (e, habitId) => {
      e.stopPropagation();
      dispatch({ type: 'UNDO_HABIT', payload: { habitId, date: selectedDate } });
   };

   return (
      <div className="dashboard animate-fade-in">
         {/* Hero Section */}
         <div className="dashboard-hero glass-card">
            <div className="hero-left">
               <p className="hero-greeting">
                  {getGreeting()}, <strong>{user.name || 'Forger'}</strong>
               </p>
               <h1 className="hero-rank">
                  <span className="rank-icon">{rank.icon}</span> {rank.name}
               </h1>
               <div className="hero-xp-bar">
                  <div className="progress-bar">
                     <div className="progress-bar-fill" style={{ width: `${xpProgress.percentage}%` }}></div>
                  </div>
                  <span className="xp-label">
                     {user.xp} XP {nextRank ? `• ${xpProgress.needed - xpProgress.current} XP to ${nextRank.name}` : '• MAX RANK'}
                  </span>
               </div>
            </div>
            <div className="hero-streak">
               <div className={`streak-number ${currentStreak > 0 ? 'fire' : ''}`}>
                  {currentStreak > 0 && <Flame size={24} className="streak-flame" />}
                  {currentStreak}
               </div>
               <span className="streak-label">Day Streak</span>
            </div>
         </div>

         {/* Quick Stats */}
         <div className="stats-grid">
            <div className="stat-card">
               <Target size={20} className="stat-icon" />
               <span className="stat-label">Today</span>
               <span className="stat-value">{todayRate}%</span>
            </div>
            <div className="stat-card">
               <Zap size={20} className="stat-icon" />
               <span className="stat-label">Weekly Rate</span>
               <span className="stat-value">{weeklyRate}%</span>
            </div>
            <div className="stat-card">
               <Trophy size={20} className="stat-icon" />
               <span className="stat-label">Longest Streak</span>
               <span className="stat-value">{longestStreak}</span>
            </div>
            <div className="stat-card">
               <Zap size={20} className="stat-icon" />
               <span className="stat-label">Total XP</span>
               <span className="stat-value">{user.xp}</span>
            </div>
         </div>

         {/* Daily Challenge */}
         <div className={`daily-challenge-card glass-card ${challengeCompleted ? 'completed' : ''}`}>
            <div className="dc-icon-wrap">{dailyChallenge.icon}</div>
            <div className="dc-content">
               <div className="dc-header">
                  <span className="dc-badge">Daily Challenge</span>
                  {challengeCompleted && <span className="dc-status"><CheckCircle2 size={14} /> Complete</span>}
               </div>
               <h3>{dailyChallenge.title}</h3>
               <p>{dailyChallenge.description}</p>
            </div>
            <div className="dc-reward">
               <Zap size={16} /> +{dailyChallenge.xpReward} XP
            </div>
         </div>

         {/* Forge Mode Status */}
         {forgeProgress && (
            <div className="ghost-mode-banner glass-card">
               <div className="ghost-banner-left">
                  <Flame size={24} className="ghost-icon-animated" />
                  <div>
                     <h3>Forge Mode Active</h3>
                     <p>Day {forgeProgress.elapsed} of {forgeProgress.totalDays}</p>
                  </div>
               </div>
               <div className="ghost-progress-ring">
                  <svg viewBox="0 0 80 80" className="progress-ring-svg">
                     <circle cx="40" cy="40" r="35" fill="none" stroke="var(--bg-surface)" strokeWidth="6" />
                     <circle
                        cx="40" cy="40" r="35" fill="none"
                        stroke="url(#forgeGrad)" strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 35}`}
                        strokeDashoffset={`${2 * Math.PI * 35 * (1 - forgeProgress.pct / 100)}`}
                        transform="rotate(-90 40 40)"
                     />
                     <defs>
                        <linearGradient id="forgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                           <stop offset="0%" stopColor="#f59e0b" />
                           <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                     </defs>
                  </svg>
                  <span className="ring-text">{forgeProgress.pct}%</span>
               </div>
            </div>
         )}

         {/* Today's Habits */}
         <div className="today-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div className="date-navigator">
                  {settings.strictTracking ? (
                     <div className="date-locked">
                        <Lock size={16} className="locked-icon" />
                        <span>Strict Tracking: Today Only</span>
                     </div>
                  ) : (
                     <>
                        <button className="btn btn-icon btn-ghost" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                           <ChevronLeft size={18} />
                        </button>
                        <h2 className="selected-date-title">{selectedDate === today ? "Today's Habits" : formatDateShort(selectedDate)}</h2>
                        <button className="btn btn-icon btn-ghost" disabled={selectedDate === today} onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                           <ChevronRight size={18} />
                        </button>
                     </>
                  )}
               </div>
               <span className="badge badge-accent">{completedToday}/{scheduledToday.length}</span>
            </div>

            {scheduledToday.length === 0 ? (
               <div className="empty-state">
                  <div className="empty-state-icon">🎯</div>
                  <h3>No habits scheduled</h3>
                  <p>Add some habits to start tracking your progress!</p>
               </div>
            ) : (
               <div className="habits-today-list">
                  {scheduledToday.map(habit => {
                     const isCompleted = isHabitComplete(habit);
                     const locked = isTimeLocked(habit) && !isCompleted;
                     const completionData = currentCompletions[habit.id];
                     const logData = completionData?.log;
                     const targetStr = formatTarget(habit);
                     const isJournal = habit.trackingType === 'journal';

                     return (
                        <button
                           key={habit.id}
                           className={`habit-today-card ${isCompleted ? 'completed' : ''} ${locked ? 'locked-habit' : ''}`}
                           onClick={() => handleHabitClick(habit)}
                           style={{ '--habit-color': habit.color, opacity: locked ? 0.6 : 1 }}
                        >
                           <div className="habit-check-icon">
                              {isCompleted ? (
                                 <CheckCircle2 size={24} className="check-filled" />
                              ) : locked ? (
                                 <Lock size={20} className="lock-icon" style={{ color: 'var(--text-muted)' }} />
                              ) : (
                                 <Circle size={24} />
                              )}
                           </div>
                           <span className="habit-today-icon">{habit.icon}</span>
                           <div className="habit-today-info">
                              <span className={`habit-today-name ${isCompleted ? 'struck' : ''}`}>
                                 {habit.name}
                              </span>
                              {!isCompleted && !locked && targetStr && (
                                 <span className="habit-today-target">Target: {targetStr}</span>
                              )}
                              {!isCompleted && locked && (
                                 <span className="habit-today-target" style={{ color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Lock size={12} /> Unlocks at {habit.targetTime}
                                 </span>
                              )}
                              {!isCompleted && !locked && isJournal && (
                                 <span className="habit-today-target">
                                    <BookOpen size={12} /> Write a journal entry
                                 </span>
                              )}
                              {isCompleted && logData && (
                                 <span className="habit-today-log">
                                    {formatLog(habit.trackingType, logData)}
                                 </span>
                              )}
                              {isCompleted && isJournal && (
                                 <span className="habit-today-log">Journal entry ✓</span>
                              )}
                           </div>
                           {isCompleted && !isJournal && (
                              <button
                                 className="undo-btn"
                                 onClick={(e) => handleUndo(e, habit.id)}
                                 title="Undo"
                              >
                                 <Undo2 size={14} />
                              </button>
                           )}
                           {isCompleted && <span className="xp-badge">+10 XP</span>}
                        </button>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Log Modal */}
         {logModalHabit && (
            <HabitLogModal
               habit={logModalHabit}
               onSubmit={handleLogSubmit}
               onCancel={() => setLogModalHabit(null)}
            />
         )}

         {/* Level Up Celebration */}
         {levelUpData && (
            <LevelUpCelebration
               oldRank={levelUpData.oldRank}
               newRank={levelUpData.newRank}
               onComplete={() => setLevelUpData(null)}
            />
         )}
      </div>
   );
}

function getGreeting() {
   const hour = new Date().getHours();
   if (hour < 12) return 'Good Morning';
   if (hour < 17) return 'Good Afternoon';
   return 'Good Evening';
}
