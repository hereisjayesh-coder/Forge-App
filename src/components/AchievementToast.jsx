import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Flame, Trophy, Star, Zap, Award, TrendingUp } from 'lucide-react';
import './AchievementToast.css';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
   const [toasts, setToasts] = useState([]);
   const timeoutsRef = useRef({});

   const addToast = useCallback(({ title, message, icon, variant = 'success', duration = 4500 }) => {
      const id = ++toastIdCounter;
      setToasts(prev => [...prev, { id, title, message, icon, variant }]);

      timeoutsRef.current[id] = setTimeout(() => {
         setToasts(prev => prev.filter(t => t.id !== id));
         delete timeoutsRef.current[id];
      }, duration);

      return id;
   }, []);

   const removeToast = useCallback((id) => {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
      setToasts(prev => prev.filter(t => t.id !== id));
   }, []);

   const iconMap = {
      streak: <Flame size={20} />,
      rankup: <Trophy size={20} />,
      badge: <Award size={20} />,
      xp: <Zap size={20} />,
      perfect: <Star size={20} />,
      milestone: <TrendingUp size={20} />,
   };

   return (
      <ToastContext.Provider value={{ addToast, removeToast }}>
         {children}
         <div className="toast-container" aria-live="polite">
            {toasts.map((toast, i) => (
               <div
                  key={toast.id}
                  className={`achievement-toast toast-${toast.variant}`}
                  style={{ '--toast-index': i }}
                  onClick={() => removeToast(toast.id)}
               >
                  <div className="toast-icon-wrap">
                     {toast.icon ? (
                        <span className="toast-emoji">{toast.icon}</span>
                     ) : (
                        iconMap[toast.variant] || iconMap.xp
                     )}
                  </div>
                  <div className="toast-content">
                     <strong className="toast-title">{toast.title}</strong>
                     {toast.message && <span className="toast-message">{toast.message}</span>}
                  </div>
                  <div className="toast-progress">
                     <div className="toast-progress-bar" />
                  </div>
               </div>
            ))}
         </div>
      </ToastContext.Provider>
   );
}

export function useToast() {
   const ctx = useContext(ToastContext);
   if (!ctx) throw new Error('useToast must be inside ToastProvider');
   return ctx;
}
