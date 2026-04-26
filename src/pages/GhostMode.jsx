import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../components/ConfirmDialog';
import { GHOST_MODE_DURATIONS } from '../utils/constants';
import { getToday, daysBetween } from '../utils/streakCalculator';
import { Flame, Play, X, Trophy, Clock, Target } from 'lucide-react';
import './GhostMode.css';

export default function ForgeMode() {
   const { state, dispatch } = useApp();
   const { forgeMode, forgeModeHistory, habits } = state;
   const today = getToday();
   const [selectedDuration, setSelectedDuration] = useState(null);
   const [selectedHabits, setSelectedHabits] = useState([]);
   const [showSetup, setShowSetup] = useState(false);

   const toggleHabit = (id) => {
      setSelectedHabits(prev =>
         prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
      );
   };

   const startForgeMode = () => {
      if (!selectedDuration || selectedHabits.length === 0) return;
      dispatch({
         type: 'START_FORGE_MODE',
         payload: { duration: selectedDuration, habitIds: selectedHabits },
      });
      setShowSetup(false);
      setSelectedDuration(null);
      setSelectedHabits([]);
   };

   const confirm = useConfirm();

   const cancelForgeMode = async () => {
      const ok = await confirm({
         title: 'End Forge Mode?',
         message: 'Your current Forge Mode progress will be lost. This cannot be undone.',
         confirmText: 'End Forge Mode',
         variant: 'warning',
      });
      if (ok) dispatch({ type: 'CANCEL_FORGE_MODE' });
   };

   // Active Forge Mode View
   if (forgeMode?.active) {
      const elapsed = Math.max(0, daysBetween(forgeMode.startDate, today));
      const remaining = forgeMode.duration - elapsed;
      const pct = Math.min(Math.round((elapsed / forgeMode.duration) * 100), 100);
      const committedHabits = habits.filter(h => forgeMode.habitIds.includes(h.id));

      return (
         <div className="ghost-mode-page animate-fade-in">
            <div className="page-header">
               <h1>🔥 Forge Mode</h1>
               <p>Stay in the fire. Forge your discipline. Come out steel.</p>
            </div>

            <div className="ghost-active-card glass-card">
               <div className="ghost-active-ring">
                  <svg viewBox="0 0 160 160" className="big-progress-ring">
                     <circle cx="80" cy="80" r="70" fill="none" stroke="var(--bg-surface)" strokeWidth="10" />
                     <circle
                        cx="80" cy="80" r="70" fill="none"
                        stroke="url(#fmGrad)" strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - pct / 100)}`}
                        transform="rotate(-90 80 80)"
                        className="ring-animated"
                     />
                     <defs>
                        <linearGradient id="fmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                           <stop offset="0%" stopColor="#f59e0b" />
                           <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                     </defs>
                  </svg>
                  <div className="ring-center-text">
                     <span className="ring-pct">{pct}%</span>
                     <span className="ring-sub">Forged</span>
                  </div>
               </div>

               <div className="ghost-active-stats">
                  <div className="ga-stat">
                     <Clock size={18} />
                     <div>
                        <span className="ga-stat-val">{elapsed}</span>
                        <span className="ga-stat-label">Days In</span>
                     </div>
                  </div>
                  <div className="ga-stat">
                     <Target size={18} />
                     <div>
                        <span className="ga-stat-val">{remaining}</span>
                        <span className="ga-stat-label">Days Left</span>
                     </div>
                  </div>
                  <div className="ga-stat">
                     <Trophy size={18} />
                     <div>
                        <span className="ga-stat-val">{forgeMode.duration}</span>
                        <span className="ga-stat-label">Total Days</span>
                     </div>
                  </div>
               </div>

               <div className="ghost-committed-habits">
                  <h3>Committed Habits</h3>
                  <div className="committed-list">
                     {committedHabits.map(h => (
                        <div key={h.id} className="committed-habit-chip" style={{ borderColor: h.color }}>
                           <span>{h.icon}</span> {h.name}
                        </div>
                     ))}
                  </div>
               </div>

               <button className="btn btn-danger btn-sm" onClick={cancelForgeMode}>
                  <X size={16} /> End Forge Mode
               </button>
            </div>

            {/* Motivational quote */}
            <div className="ghost-quote glass-card">
               <p>"The steel that goes through the hottest fire comes out the strongest. Stay in the forge."</p>
            </div>
         </div>
      );
   }

   // Setup View
   if (showSetup) {
      return (
         <div className="ghost-mode-page animate-fade-in">
            <div className="page-header">
               <h1>🔥 Start Forge Mode</h1>
               <p>Choose your duration and commit to your habits.</p>
            </div>

            <div className="ghost-setup-section">
               <h3>Choose Duration</h3>
               <div className="duration-grid">
                  {GHOST_MODE_DURATIONS.map(dur => (
                     <button
                        key={dur.days}
                        className={`duration-card card ${selectedDuration === dur.days ? 'selected' : ''}`}
                        onClick={() => setSelectedDuration(dur.days)}
                     >
                        <span className="dur-icon">{dur.icon}</span>
                        <span className="dur-label">{dur.label}</span>
                        <span className="dur-desc">{dur.description}</span>
                     </button>
                  ))}
               </div>
            </div>

            <div className="ghost-setup-section">
               <h3>Select Habits to Commit</h3>
               <div className="commit-habits-grid">
                  {habits.map(h => (
                     <button
                        key={h.id}
                        className={`commit-habit-card ${selectedHabits.includes(h.id) ? 'selected' : ''}`}
                        onClick={() => toggleHabit(h.id)}
                        style={{ '--habit-color': h.color }}
                     >
                        <span>{h.icon}</span>
                        <span>{h.name}</span>
                     </button>
                  ))}
               </div>
            </div>

            <div className="ghost-setup-actions">
               <button className="btn btn-secondary" onClick={() => setShowSetup(false)}>Cancel</button>
               <button
                  className="btn btn-primary btn-lg"
                  onClick={startForgeMode}
                  disabled={!selectedDuration || selectedHabits.length === 0}
               >
                  <Flame size={20} /> Enter The Forge
               </button>
            </div>
         </div>
      );
   }

   // Default: Forge Mode Landing
   return (
      <div className="ghost-mode-page animate-fade-in">
         <div className="page-header">
            <h1>🔥 Forge Mode</h1>
            <p>Enter the fire. Build yourself into steel.</p>
         </div>

         <div className="ghost-landing glass-card">
            <div className="ghost-landing-icon animate-bounce">🔥</div>
            <h2>Enter Forge Mode</h2>
            <p>Commit to your habits for 30 to 365 days. Step into the fire. Come out forged.</p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowSetup(true)} disabled={habits.length === 0}>
               <Play size={20} /> Start Forge Mode
            </button>
            {habits.length === 0 && (
               <p className="ghost-warning">Add some habits first before entering Forge Mode.</p>
            )}
         </div>

         {/* History */}
         {forgeModeHistory.length > 0 && (
            <div className="ghost-history">
               <h3>Completed Challenges</h3>
               <div className="history-list">
                  {forgeModeHistory.map((gm, i) => (
                     <div key={i} className="history-card card">
                        <Trophy size={20} className="history-icon" />
                        <div>
                           <strong>{gm.duration} Day Challenge</strong>
                           <p>{gm.startDate} → {gm.completedAt}</p>
                        </div>
                        <span className="badge badge-success">Complete</span>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
