import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../components/ConfirmDialog';
import Tooltip from '../components/Tooltip';
import { getToday, calculateHabitStreak } from '../utils/streakCalculator';
import { HABIT_ICONS, HABIT_COLORS, DAYS_OF_WEEK, TRACKING_TYPES, HABIT_CATEGORIES } from '../utils/constants';
import { formatTarget } from '../utils/progressionEngine';
import { Plus, Pencil, Trash2, X, Flame, Calendar, Check, TrendingUp, Tag } from 'lucide-react';
import './Habits.css';

export default function Habits() {
   const { state, dispatch } = useApp();
   const { habits, completions } = state;
   const today = getToday();
   const [showModal, setShowModal] = useState(false);
   const [editHabit, setEditHabit] = useState(null);
   const [draggedIdx, setDraggedIdx] = useState(null);

   const openAdd = () => { setEditHabit(null); setShowModal(true); };
   const openEdit = (h) => { setEditHabit(h); setShowModal(true); };
   const close = () => { setShowModal(false); setEditHabit(null); };

   const confirm = useConfirm();

   const handleDelete = async (id, name) => {
      const ok = await confirm({
         title: 'Delete Habit?',
         message: `"${name}" will be removed along with all its tracking data. This cannot be undone.`,
         confirmText: 'Delete',
         variant: 'danger',
      });
      if (ok) dispatch({ type: 'DELETE_HABIT', payload: id });
   };

   return (
      <div className="habits-page animate-fade-in">
         <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div>
                  <h1>My Habits</h1>
                  <p>Build your daily discipline routine</p>
               </div>
               <button className="btn btn-primary" onClick={openAdd}>
                  <Plus size={18} /> Add Habit
               </button>
            </div>
         </div>

         {habits.length === 0 ? (
            <div className="empty-state">
               <div className="empty-state-icon">🎯</div>
               <h3>No habits yet</h3>
               <p>Create your first habit to begin your journey.</p>
               <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>
                  <Plus size={18} /> Create Habit
               </button>
            </div>
         ) : (
            <div className="habits-grid">
               {habits.map((habit, index) => {
                  const streak = calculateHabitStreak(completions, habit.id);
                  const isCompletedToday = completions[today]?.[habit.id];
                  const targetStr = formatTarget(habit);
                  const trackLabel = TRACKING_TYPES[habit.trackingType || 'checkbox']?.label || 'Checkbox';
                  const cat = HABIT_CATEGORIES.find(c => c.id === habit.category) || HABIT_CATEGORIES[5];

                  return (
                     <div
                        key={habit.id}
                        className={`habit-card card ${draggedIdx === index ? 'dragging' : ''}`}
                        style={{ '--habit-color': habit.color }}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={() => setDraggedIdx(null)}
                     >
                        <div className="habit-card-header">
                           <div className="habit-card-icon-wrap" style={{ background: `${habit.color}20` }}>
                              <span className="habit-card-icon">{habit.icon}</span>
                           </div>
                           <div className="habit-card-actions">
                              <Tooltip text="Edit habit name, icon, target, and schedule">
                                 <button className="btn btn-icon btn-ghost" onClick={() => openEdit(habit)}>
                                    <Pencil size={14} />
                                 </button>
                              </Tooltip>
                              <Tooltip text="Delete this habit permanently">
                                 <button className="btn btn-icon btn-ghost" onClick={() => handleDelete(habit.id, habit.name)}>
                                    <Trash2 size={14} />
                                 </button>
                              </Tooltip>
                           </div>
                        </div>
                        <h3 className="habit-card-name">{habit.name}</h3>
                        <div className="habit-card-meta">
                           <span className="habit-meta-item">
                              <Flame size={14} /> {streak} day streak
                           </span>
                           <span className="habit-meta-item">
                              <Calendar size={14} />
                              {habit.schedule?.type === 'weekly'
                                 ? habit.schedule.days.map(d => DAYS_OF_WEEK[d]?.label).join(', ')
                                 : 'Daily'}
                           </span>
                           <span className="habit-category-tag" style={{ color: cat.color, background: `${cat.color}20` }}>
                              <Tag size={12} /> {cat.label}
                           </span>
                        </div>
                        {/* Tracking type + target */}
                        <div className="habit-card-tracking">
                           <span className="tracking-type-badge">{trackLabel}</span>
                           {targetStr && (
                              <span className="tracking-target">
                                 <TrendingUp size={12} /> {targetStr}
                              </span>
                           )}
                        </div>
                        <div className={`habit-card-status ${isCompletedToday ? 'done' : 'pending'}`}>
                           {isCompletedToday ? (
                              <><Check size={14} /> Done today</>
                           ) : (
                              'Pending'
                           )}
                        </div>
                        {/* Mini heatmap - last 7 days */}
                        <div className="habit-mini-heatmap">
                           {Array.from({ length: 7 }, (_, i) => {
                              const d = new Date(today + 'T00:00:00');
                              d.setDate(d.getDate() - (6 - i));
                              const ds = d.toISOString().split('T')[0];
                              const done = completions[ds]?.[habit.id];
                              return (
                                 <div
                                    key={ds}
                                    className={`heatmap-cell ${done ? 'filled' : ''}`}
                                    title={ds}
                                    style={done ? { background: habit.color } : {}}
                                 />
                              );
                           })}
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {showModal && (
            <HabitModal
               habit={editHabit}
               onClose={close}
               onSave={(data) => {
                  if (editHabit) {
                     dispatch({ type: 'UPDATE_HABIT', payload: { ...data, id: editHabit.id } });
                  } else {
                     dispatch({ type: 'ADD_HABIT', payload: data });
                  }
                  close();
               }}
            />
         )}
      </div>
   );
}

function HabitModal({ habit, onClose, onSave }) {
   const [name, setName] = useState(habit?.name || '');
   const [nameError, setNameError] = useState(false);
   const [icon, setIcon] = useState(habit?.icon || '💪');
   const [color, setColor] = useState(habit?.color || '#8b5cf6');
   const [schedType, setSchedType] = useState(habit?.schedule?.type || 'daily');
   const [schedDays, setSchedDays] = useState(habit?.schedule?.days || []);
   const [trackingType, setTrackingType] = useState(habit?.trackingType || 'checkbox');
   const [category, setCategory] = useState(habit?.category || 'health');

   // Time Lock / Google Tasks
   const [targetTime, setTargetTime] = useState(habit?.targetTime || '');
   const [syncToGoogle, setSyncToGoogle] = useState(habit?.syncToGoogle || false);

   // Target fields
   const [targetSets, setTargetSets] = useState(habit?.baseTarget?.sets || 3);
   const [targetReps, setTargetReps] = useState(habit?.baseTarget?.reps || 10);
   const [targetWeight, setTargetWeight] = useState(habit?.baseTarget?.weight || 0);
   const [targetMinutes, setTargetMinutes] = useState(habit?.baseTarget?.minutes || 10);
   const [targetCount, setTargetCount] = useState(habit?.baseTarget?.count || 1);
   const [targetUnit, setTargetUnit] = useState(habit?.baseTarget?.unit || 'times');

   const toggleDay = (day) => {
      setSchedDays(prev =>
         prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      );
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!name.trim()) {
         setNameError(true);
         return;
      }
      setNameError(false);

      const habitData = {
         name: name.trim(),
         icon,
         color,
         trackingType,
         category,
         targetTime: targetTime || null,
         syncToGoogle,
         schedule: schedType === 'daily' ? { type: 'daily' } : { type: 'weekly', days: schedDays },
      };

      // Add target based on tracking type
      if (trackingType === 'exercise') {
         habitData.baseTarget = { sets: targetSets, reps: targetReps, weight: targetWeight };
         habitData.progressionRate = { reps: 2, perWeeks: 2 };
      } else if (trackingType === 'duration') {
         habitData.baseTarget = { minutes: targetMinutes };
         habitData.progressionRate = { minutes: 2, perWeeks: 2 };
      } else if (trackingType === 'quantity') {
         habitData.baseTarget = { count: targetCount, unit: targetUnit };
         habitData.progressionRate = null;
      }

      onSave(habitData);
   };

   return (
      <div className="modal-overlay" onClick={onClose}>
         <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
               <h2>{habit ? 'Edit Habit' : 'New Habit'}</h2>
               <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
               <div className={`form-group ${nameError ? 'has-error' : ''}`}>
                  <label className="form-label">Habit Name <span className="required">*</span></label>
                  <input
                     type="text"
                     value={name}
                     onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setNameError(false); }}
                     placeholder="e.g. Push-ups"
                     autoFocus
                     className={nameError ? 'input-error' : ''}
                  />
                  {nameError && <span className="field-error">Habit name is required</span>}
               </div>

               <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                     value={category}
                     onChange={(e) => setCategory(e.target.value)}
                     className="category-select"
                  >
                     {HABIT_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                     ))}
                  </select>
               </div>

               <div className="form-group">
                  <label className="form-label">Tracking Type</label>
                  <div className="tracking-type-picker">
                     {Object.values(TRACKING_TYPES).map(t => (
                        <button
                           type="button"
                           key={t.id}
                           className={`tracking-type-option ${trackingType === t.id ? 'selected' : ''}`}
                           onClick={() => setTrackingType(t.id)}
                        >
                           <span className="tt-icon">{t.icon}</span>
                           <span className="tt-label">{t.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               {/* Target config based on type */}
               {trackingType === 'exercise' && (
                  <div className="form-group target-config">
                     <label className="form-label">Starting Target</label>
                     <div className="target-row">
                        <div className="target-field">
                           <span>Sets</span>
                           <input type="number" value={targetSets} min={1}
                              onChange={e => setTargetSets(Math.max(1, +e.target.value || 1))} />
                        </div>
                        <span className="target-x">×</span>
                        <div className="target-field">
                           <span>Reps</span>
                           <input type="number" value={targetReps} min={1}
                              onChange={e => setTargetReps(Math.max(1, +e.target.value || 1))} />
                        </div>
                        <span className="target-x">@</span>
                        <div className="target-field">
                           <span>kg</span>
                           <input type="number" value={targetWeight} min={0}
                              onChange={e => setTargetWeight(Math.max(0, +e.target.value || 0))} />
                        </div>
                     </div>
                     <p className="target-hint">+2 reps every 2 weeks (progressive overload)</p>
                  </div>
               )}

               {trackingType === 'duration' && (
                  <div className="form-group target-config">
                     <label className="form-label">Starting Duration (minutes)</label>
                     <input type="number" value={targetMinutes} min={1}
                        onChange={e => setTargetMinutes(Math.max(1, +e.target.value || 1))} />
                     <p className="target-hint">+2 minutes every 2 weeks</p>
                  </div>
               )}

               {trackingType === 'quantity' && (
                  <div className="form-group target-config">
                     <label className="form-label">Target Count</label>
                     <div className="target-row">
                        <div className="target-field">
                           <span>Count</span>
                           <input type="number" value={targetCount} min={1}
                              onChange={e => setTargetCount(Math.max(1, +e.target.value || 1))} />
                        </div>
                        <div className="target-field">
                           <span>Unit</span>
                           <input type="text" value={targetUnit}
                              onChange={e => setTargetUnit(e.target.value)} placeholder="glasses" />
                        </div>
                     </div>
                  </div>
               )}

               {trackingType === 'journal' && (
                  <div className="form-group">
                     <p className="target-hint">📝 Auto-verified when you write a journal entry for the day.</p>
                  </div>
               )}

               <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div className="icon-picker">
                     {HABIT_ICONS.map(i => (
                        <button
                           type="button"
                           key={i}
                           className={`icon-option ${icon === i ? 'selected' : ''}`}
                           onClick={() => setIcon(i)}
                        >
                           {i}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="form-group">
                  <label className="form-label">Color</label>
                  <div className="color-picker">
                     {HABIT_COLORS.map(c => (
                        <button
                           type="button"
                           key={c}
                           className={`color-option ${color === c ? 'selected' : ''}`}
                           style={{ background: c }}
                           onClick={() => setColor(c)}
                        />
                     ))}
                  </div>
               </div>

               <div className="form-group">
                  <label className="form-label">Schedule</label>
                  <div className="schedule-toggle">
                     <button
                        type="button"
                        className={`sched-btn ${schedType === 'daily' ? 'active' : ''}`}
                        onClick={() => setSchedType('daily')}
                     >
                        Every Day
                     </button>
                     <button
                        type="button"
                        className={`sched-btn ${schedType === 'weekly' ? 'active' : ''}`}
                        onClick={() => setSchedType('weekly')}
                     >
                        Specific Days
                     </button>
                  </div>
                  {schedType === 'weekly' && (
                     <div className="day-picker">
                        {DAYS_OF_WEEK.map(d => (
                           <button
                              type="button"
                              key={d.value}
                              className={`day-btn ${schedDays.includes(d.value) ? 'selected' : ''}`}
                              onClick={() => toggleDay(d.value)}
                           >
                              {d.label}
                           </button>
                        ))}
                     </div>
                  )}
               </div>

               <div className="form-group">
                  <label className="form-label">Target Time (Optional Time Lock)</label>
                  <input
                     type="time"
                     value={targetTime}
                     onChange={(e) => setTargetTime(e.target.value)}
                     className="time-input"
                  />
                  <p className="target-hint">If set, you cannot log this habit until the target time has started.</p>
               </div>

               <div className="form-group" style={{ margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                     <label className="form-label" style={{ margin: 0 }}>Sync to Google Tasks</label>
                     <span className="target-hint" style={{ margin: 0 }}>Get reminded via your calendar notifications.</span>
                  </div>
                  <label className="toggle">
                     <input type="checkbox" checked={syncToGoogle} onChange={e => setSyncToGoogle(e.target.checked)} />
                     <span className="toggle-slider"></span>
                  </label>
               </div>

               <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                     {habit ? 'Save Changes' : 'Create Habit'}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
