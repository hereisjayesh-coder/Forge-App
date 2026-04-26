import { useState } from 'react';
import { X, Check, ArrowRight, TrendingUp } from 'lucide-react';
import { getCurrentTarget, formatTarget, meetsTarget } from '../utils/progressionEngine';
import './HabitLogModal.css';

export default function HabitLogModal({ habit, onSubmit, onCancel }) {
   const target = getCurrentTarget(habit);
   const trackingType = habit.trackingType || 'checkbox';

   // Exercise state
   const [sets, setSets] = useState(target?.sets || 3);
   const [reps, setReps] = useState(target?.reps || 10);
   const [weight, setWeight] = useState(target?.weight || 0);

   // Duration state
   const [minutes, setMinutes] = useState(target?.minutes || 10);

   // Quantity state
   const [count, setCount] = useState(target?.count || 1);

   const handleSubmit = () => {
      let log = {};
      switch (trackingType) {
         case 'exercise':
            log = { sets, reps, weight };
            break;
         case 'duration':
            log = { minutes };
            break;
         case 'quantity':
            log = { count, unit: target?.unit || 'times' };
            break;
         case 'checkbox':
         default:
            log = { done: true };
            break;
      }
      onSubmit(log);
   };

   const targetStr = formatTarget(habit);
   const currentLog = trackingType === 'exercise' ? { sets, reps, weight }
      : trackingType === 'duration' ? { minutes }
         : trackingType === 'quantity' ? { count }
            : { done: true };
   const hitsTarget = meetsTarget(habit, currentLog);

   return (
      <div className="modal-overlay" onClick={onCancel}>
         <div className="modal-content log-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
               <div className="log-modal-title">
                  <span className="log-habit-icon" style={{ background: `${habit.color}20`, color: habit.color }}>
                     {habit.icon}
                  </span>
                  <div>
                     <h2>{habit.name}</h2>
                     {targetStr && (
                        <span className="log-target-badge">
                           <TrendingUp size={12} /> Target: {targetStr}
                        </span>
                     )}
                  </div>
               </div>
               <button className="btn btn-icon btn-ghost" onClick={onCancel}>
                  <X size={20} />
               </button>
            </div>

            <div className="modal-body">
               {trackingType === 'exercise' && (
                  <div className="log-exercise-form">
                     <div className="log-input-group">
                        <label className="form-label">Sets</label>
                        <div className="stepper">
                           <button className="stepper-btn" onClick={() => setSets(Math.max(1, sets - 1))}>−</button>
                           <input type="number" value={sets} onChange={e => setSets(Math.max(1, +e.target.value || 1))} />
                           <button className="stepper-btn" onClick={() => setSets(sets + 1)}>+</button>
                        </div>
                     </div>
                     <div className="log-input-group">
                        <label className="form-label">Reps</label>
                        <div className="stepper">
                           <button className="stepper-btn" onClick={() => setReps(Math.max(1, reps - 1))}>−</button>
                           <input type="number" value={reps} onChange={e => setReps(Math.max(1, +e.target.value || 1))} />
                           <button className="stepper-btn" onClick={() => setReps(reps + 1)}>+</button>
                        </div>
                     </div>
                     <div className="log-input-group">
                        <label className="form-label">Weight (kg)</label>
                        <div className="stepper">
                           <button className="stepper-btn" onClick={() => setWeight(Math.max(0, weight - 1))}>−</button>
                           <input type="number" value={weight} onChange={e => setWeight(Math.max(0, +e.target.value || 0))} />
                           <button className="stepper-btn" onClick={() => setWeight(weight + 1)}>+</button>
                        </div>
                     </div>
                     <div className="log-summary">
                        <span className="log-total">
                           Total: <strong>{sets * reps} reps</strong>
                           {weight > 0 && <> @ <strong>{weight}kg</strong></>}
                        </span>
                     </div>
                  </div>
               )}

               {trackingType === 'duration' && (
                  <div className="log-duration-form">
                     <label className="form-label">Duration (minutes)</label>
                     <div className="duration-slider-wrap">
                        <input
                           type="range"
                           min="1"
                           max={Math.max(120, (target?.minutes || 10) * 2)}
                           value={minutes}
                           onChange={e => setMinutes(+e.target.value)}
                           className="duration-slider"
                           style={{ '--fill-pct': `${(minutes / Math.max(120, (target?.minutes || 10) * 2)) * 100}%` }}
                        />
                        <div className="duration-display">
                           <span className="duration-value">{minutes}</span>
                           <span className="duration-unit">min</span>
                        </div>
                     </div>
                     <div className="duration-presets">
                        {[5, 10, 15, 20, 30, 45, 60].map(m => (
                           <button
                              key={m}
                              className={`preset-btn ${minutes === m ? 'active' : ''}`}
                              onClick={() => setMinutes(m)}
                           >
                              {m}m
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {trackingType === 'quantity' && (
                  <div className="log-quantity-form">
                     <label className="form-label">{target?.unit || 'Count'}</label>
                     <div className="quantity-stepper">
                        <button className="stepper-btn big" onClick={() => setCount(Math.max(1, count - 1))}>−</button>
                        <div className="quantity-display">
                           <span className="quantity-value">{count}</span>
                           <span className="quantity-unit">{target?.unit || 'times'}</span>
                        </div>
                        <button className="stepper-btn big" onClick={() => setCount(count + 1)}>+</button>
                     </div>
                  </div>
               )}

               {trackingType === 'checkbox' && (
                  <div className="log-checkbox-form">
                     <div className="checkbox-confirm-icon">✅</div>
                     <p>Mark <strong>{habit.name}</strong> as complete for today?</p>
                  </div>
               )}
            </div>

            <div className="modal-footer">
               <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
               <button
                  className={`btn ${hitsTarget ? 'btn-primary' : 'btn-primary'}`}
                  onClick={handleSubmit}
               >
                  <Check size={18} />
                  {hitsTarget ? 'Log & Complete' : 'Log Anyway'}
                  {!hitsTarget && trackingType !== 'checkbox' && (
                     <span className="below-target-badge">Below target</span>
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}
