import { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Trash2, LogOut, Info, X } from 'lucide-react';
import './ConfirmDialog.css';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
   const [dialog, setDialog] = useState(null);

   const confirm = useCallback(({
      title = 'Are you sure?',
      message = '',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      variant = 'danger', // 'danger' | 'warning' | 'info'
      icon = null,
   }) => {
      return new Promise((resolve) => {
         setDialog({ title, message, confirmText, cancelText, variant, icon, resolve });
      });
   }, []);

   const handleConfirm = () => {
      dialog?.resolve(true);
      setDialog(null);
   };

   const handleCancel = () => {
      dialog?.resolve(false);
      setDialog(null);
   };

   const iconMap = {
      danger: <Trash2 size={24} />,
      warning: <AlertTriangle size={24} />,
      info: <Info size={24} />,
      logout: <LogOut size={24} />,
   };

   return (
      <ConfirmContext.Provider value={{ confirm }}>
         {children}
         {dialog && (
            <div className="confirm-overlay" onClick={handleCancel}>
               <div className={`confirm-dialog confirm-${dialog.variant}`} onClick={e => e.stopPropagation()}>
                  <div className="confirm-icon-wrap">
                     {dialog.icon || iconMap[dialog.variant] || iconMap.info}
                  </div>
                  <h3 className="confirm-title">{dialog.title}</h3>
                  {dialog.message && <p className="confirm-message">{dialog.message}</p>}
                  <div className="confirm-actions">
                     <button className="btn btn-secondary" onClick={handleCancel}>
                        {dialog.cancelText}
                     </button>
                     <button className={`btn btn-${dialog.variant === 'danger' ? 'danger' : 'primary'}`} onClick={handleConfirm}>
                        {dialog.confirmText}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </ConfirmContext.Provider>
   );
}

export function useConfirm() {
   const ctx = useContext(ConfirmContext);
   if (!ctx) throw new Error('useConfirm must be inside ConfirmProvider');
   return ctx.confirm;
}
