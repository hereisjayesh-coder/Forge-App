import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_HABITS, GHOST_MODE_DURATIONS } from '../utils/constants';
import { ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import './Onboarding.css';

export default function Onboarding() {
   const { dispatch } = useApp();
   const [step, setStep] = useState(0);
   const [selectedHabits, setSelectedHabits] = useState([]);
   const [forgeDuration, setForgeDuration] = useState(null);

   const toggleHabit = (habit) => {
      setSelectedHabits(prev =>
         prev.find(h => h.id === habit.id)
            ? prev.filter(h => h.id !== habit.id)
            : [...prev, habit]
      );
   };

   const handleComplete = () => {
      const habits = selectedHabits.length > 0
         ? selectedHabits
         : DEFAULT_HABITS.slice(0, 3);

      dispatch({
         type: 'COMPLETE_ONBOARDING',
         payload: {
            habits,
            forgeMode: forgeDuration ? {
               active: true,
               startDate: new Date().toISOString().split('T')[0],
               endDate: new Date(Date.now() + forgeDuration * 86400000).toISOString().split('T')[0],
               duration: forgeDuration,
               habitIds: habits.map(h => h.id),
            } : null,
         },
      });
   };

   const steps = [
      // Step 0: Welcome
      <div className="onboarding-step animate-fade-in" key="welcome">
         <div className="onboarding-ghost-icon animate-bounce">🔨</div>
         <h1 className="onboarding-title">
            Forge Yourself<br />
            <span className="gradient-text">Into Steel.</span>
         </h1>
         <p className="onboarding-subtitle">
            Build unbreakable habits. Track your transformation.<br />
            Rise through the ranks. Become unstoppable.
         </p>
         <div className="onboarding-features">
            <div className="feature-pill">🔥 Streaks</div>
            <div className="feature-pill">🏅 Rank Up</div>
            <div className="feature-pill">📊 Analytics</div>
            <div className="feature-pill">📝 Journal</div>
            <div className="feature-pill">⚒️ Forge Mode</div>
         </div>
      </div>,

      // Step 1: Choose Habits
      <div className="onboarding-step animate-fade-in" key="habits">
         <div className="onboarding-step-icon">🎯</div>
         <h2>Choose Your Habits</h2>
         <p className="onboarding-subtitle">Select the habits you want to forge. You can always add more later.</p>
         <div className="habit-selection-grid">
            {DEFAULT_HABITS.map(habit => (
               <button
                  key={habit.id}
                  className={`habit-select-card ${selectedHabits.find(h => h.id === habit.id) ? 'selected' : ''}`}
                  onClick={() => toggleHabit(habit)}
                  style={{ '--habit-color': habit.color }}
               >
                  <span className="habit-select-icon">{habit.icon}</span>
                  <span className="habit-select-name">{habit.name}</span>
                  {selectedHabits.find(h => h.id === habit.id) && (
                     <Check size={16} className="habit-select-check" />
                  )}
               </button>
            ))}
         </div>
      </div>,

      // Step 2: Forge Mode
      <div className="onboarding-step animate-fade-in" key="forge">
         <div className="onboarding-step-icon">🔥</div>
         <h2>Enter Forge Mode?</h2>
         <p className="onboarding-subtitle">Commit to your habits for a set duration. Enter the fire. Come out steel.</p>
         <div className="ghost-duration-grid">
            {GHOST_MODE_DURATIONS.map(dur => (
               <button
                  key={dur.days}
                  className={`ghost-duration-card ${forgeDuration === dur.days ? 'selected' : ''}`}
                  onClick={() => setForgeDuration(prev => prev === dur.days ? null : dur.days)}
               >
                  <span className="ghost-dur-icon">{dur.icon}</span>
                  <span className="ghost-dur-label">{dur.label}</span>
                  <span className="ghost-dur-desc">{dur.description}</span>
               </button>
            ))}
         </div>
         <p className="onboarding-skip-text">You can skip this and start Forge Mode later.</p>
      </div>,
   ];

   const isLastStep = step === steps.length - 1;

   return (
      <div className="onboarding-container">
         <div className="onboarding-bg-effects">
            <div className="bg-orb bg-orb-1"></div>
            <div className="bg-orb bg-orb-2"></div>
            <div className="bg-orb bg-orb-3"></div>
         </div>

         <div className="onboarding-content">
            {/* Progress dots */}
            <div className="onboarding-progress">
               {steps.map((_, i) => (
                  <div key={i} className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`} />
               ))}
            </div>

            {steps[step]}

            <div className="onboarding-actions">
               {step > 0 && (
                  <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                     <ArrowLeft size={18} /> Back
                  </button>
               )}
               {isLastStep ? (
                  <button className="btn btn-primary btn-lg" onClick={handleComplete}>
                     <Sparkles size={18} /> Start Forging
                  </button>
               ) : (
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(s => s + 1)}>
                     Continue <ArrowRight size={18} />
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}
