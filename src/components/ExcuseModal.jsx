import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import './ExcuseModal.css';

export default function ExcuseModal() {
   const { state, dispatch } = useApp();
   const { missedHabitsToExcuse, habits, user } = state;

   // Check if we need to show
   if (!missedHabitsToExcuse || missedHabitsToExcuse.length === 0) return null;

   // Always show the FIRST missed habit in the queue
   const currentMiss = missedHabitsToExcuse[0];
   const habit = habits.find(h => h.id === currentMiss.id);

   // Local state for the text area
   const [excuse, setExcuse] = useState('');
   const [error, setError] = useState('');

   const handleSubmit = (e) => {
      e.preventDefault();
      if (excuse.trim().length < 10) {
         setError('Your excuse must be at least 10 characters long. Be honest.');
         return;
      }

      dispatch({
         type: 'SUBMIT_EXCUSE',
         payload: {
            habitId: currentMiss.id,
            date: currentMiss.date,
            excuse: excuse.trim()
         }
      });

      setExcuse('');
      setError('');
   };

   // Fallback if habit was deleted but still in queue
   if (!habit) {
      dispatch({
         type: 'SUBMIT_EXCUSE',
         payload: { habitId: currentMiss.id, date: currentMiss.date, excuse: 'Habit deleted' }
      });
      return null;
   }

   return (
      <div className="excuse-overlay">
         <div className="excuse-content glass-card animate-scale-up">
            <div className="excuse-header">
               <ShieldAlert size={32} className="excuse-icon-danger" />
               <h2>Discipline Broken</h2>
            </div>

            <p className="excuse-desc">
               You missed your targeted habit yesterday. The forge demands accountability.
            </p>

            <div className="excuse-habit-target">
               <div className="habit-icon-wrap" style={{ background: `${habit.color}20` }}>
                  <span>{habit.icon}</span>
               </div>
               <div className="habit-details">
                  <h3>{habit.name}</h3>
                  <span className="missed-date">Missed on {new Date(currentMiss.date).toLocaleDateString()}</span>
               </div>
               <div className="penalty-badge">
                  -25 XP
               </div>
            </div>

            <form onSubmit={handleSubmit} className="excuse-form">
               <label>Why did you fail? No excuses.</label>
               <textarea
                  value={excuse}
                  onChange={(e) => setExcuse(e.target.value)}
                  placeholder="I failed because..."
                  autoFocus
                  rows={4}
               />
               {error && <span className="excuse-error"><AlertTriangle size={14} /> {error}</span>}

               <button type="submit" className="btn btn-primary excuse-submit-btn">
                  Accept Failure & Continue
               </button>
            </form>
         </div>
      </div>
   );
}
