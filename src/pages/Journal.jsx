import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../components/ConfirmDialog';
import Tooltip from '../components/Tooltip';
import { MOODS, JOURNAL_PROMPTS } from '../utils/constants';
import { formatDate, getToday } from '../utils/streakCalculator';
import { Plus, Trash2, X, Search, RefreshCw } from 'lucide-react';
import './Journal.css';

export default function Journal() {
   const { state, dispatch } = useApp();
   const { journal } = state;
   const [showModal, setShowModal] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');

   const filteredEntries = journal.filter(entry =>
      !searchQuery ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.date?.includes(searchQuery)
   );

   const confirm = useConfirm();

   const handleDelete = async (id) => {
      const ok = await confirm({
         title: 'Delete Entry?',
         message: 'This journal entry will be permanently removed.',
         confirmText: 'Delete',
         variant: 'danger',
      });
      if (ok) dispatch({ type: 'DELETE_JOURNAL_ENTRY', payload: id });
   };

   return (
      <div className="journal-page animate-fade-in">
         <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div>
                  <h1>📝 Journal</h1>
                  <p>Reflect on your journey. Track your mindset.</p>
               </div>
               <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <Plus size={18} /> New Entry
               </button>
            </div>
         </div>

         {/* Search */}
         {journal.length > 0 && (
            <div className="journal-search">
               <Search size={18} className="search-icon" />
               <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
         )}

         {/* Entries */}
         {filteredEntries.length === 0 ? (
            <div className="empty-state">
               <div className="empty-state-icon">📝</div>
               <h3>{journal.length === 0 ? 'No journal entries yet' : 'No matching entries'}</h3>
               <p>Write your first entry to start reflecting on your progress.</p>
               {journal.length === 0 && (
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
                     <Plus size={18} /> Write Entry
                  </button>
               )}
            </div>
         ) : (
            <div className="journal-entries">
               {filteredEntries.map(entry => {
                  const mood = MOODS.find(m => m.value === entry.mood);
                  return (
                     <div key={entry.id} className="journal-entry card">
                        <div className="entry-header">
                           <div className="entry-date-mood">
                              <span className="entry-date">{formatDate(entry.date)}</span>
                              {mood && (
                                 <span className="entry-mood" style={{ color: mood.color }}>
                                    {mood.emoji} {mood.label}
                                 </span>
                              )}
                           </div>
                           <button className="btn btn-icon btn-ghost" onClick={() => handleDelete(entry.id)}>
                              <Trash2 size={14} />
                           </button>
                        </div>
                        <p className="entry-content">{entry.content}</p>
                     </div>
                  );
               })}
            </div>
         )}

         {showModal && (
            <JournalModal
               onClose={() => setShowModal(false)}
               onSave={(data) => {
                  dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: data });
                  setShowModal(false);
               }}
            />
         )}
      </div>
   );
}

function JournalModal({ onClose, onSave }) {
   const today = getToday();
   const [date, setDate] = useState(today);
   const [mood, setMood] = useState(null);
   const [content, setContent] = useState('');
   const [prompt, setPrompt] = useState(() =>
      JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]
   );

   const rotatePrompt = () => {
      setPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!content.trim()) return;
      onSave({ date, mood, content: content.trim() });
   };

   return (
      <div className="modal-overlay" onClick={onClose}>
         <div className="modal-content journal-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
               <h2>New Journal Entry</h2>
               <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
               <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={today} />
               </div>

               <div className="form-group">
                  <label className="form-label">How are you feeling?</label>
                  <div className="mood-picker">
                     {MOODS.map(m => (
                        <button
                           type="button"
                           key={m.value}
                           className={`mood-option ${mood === m.value ? 'selected' : ''}`}
                           onClick={() => setMood(m.value)}
                           style={mood === m.value ? { borderColor: m.color, background: `${m.color}15` } : {}}
                        >
                           <span className="mood-emoji">{m.emoji}</span>
                           <span className="mood-label">{m.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="form-group">
                  <div className="prompt-header">
                     <label className="form-label">Reflection</label>
                     <button type="button" className="btn btn-ghost btn-sm" onClick={rotatePrompt}>
                        <RefreshCw size={14} /> New Prompt
                     </button>
                  </div>
                  <div className="journal-prompt">{prompt}</div>
                  <textarea
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     placeholder="Write your thoughts..."
                     rows={5}
                     autoFocus
                  />
               </div>

               <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!content.trim()}>
                     Save Entry (+5 XP)
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
