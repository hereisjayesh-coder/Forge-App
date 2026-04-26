import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getToday } from '../utils/streakCalculator';

export default function NotificationService() {
   const { state } = useApp();
   const { settings, user } = state;

   useEffect(() => {
      // Don't run if reminders are disabled
      if (!settings.dailyReminders) return;

      // Ask for permission if we don't have it
      if ('Notification' in window && Notification.permission === 'default') {
         Notification.requestPermission();
      }

      // Check every minute
      const interval = setInterval(() => {
         if (!('Notification' in window) || Notification.permission !== 'granted') return;

         const now = new Date();
         const hour = now.getHours();

         // Trigger around 8:00 PM (20:00)
         if (hour >= 20) {
            const today = getToday();

            // Have they completed a habit today? Or dismissed the notification?
            // To prevent spam, let's only notify once per day.
            // We use localStorage to track if we've already notified them today.
            const lastNotifiedStr = localStorage.getItem('forge_last_notified');

            if (lastNotifiedStr !== today) {
               // Make sure they haven't already logged something recently
               const lastLogTime = user.lastHabitLog?.timestamp || 0;
               const hoursSinceLastLog = (Date.now() - lastLogTime) / (1000 * 60 * 60);

               if (hoursSinceLastLog > 12) {
                  // Fire notification
                  try {
                     new Notification('FORGE: The fire is fading! 🔥', {
                        body: "You haven't logged your habits for tonight. Keep your streak alive!",
                        icon: '/vite.svg'
                     });
                     // Mark as notified so we don't spam them every minute after 8 PM
                     localStorage.setItem('forge_last_notified', today);
                  } catch (e) {
                     console.warn("Notification error:", e);
                  }
               }
            }
         }
      }, 60000); // Check every 60 seconds

      return () => clearInterval(interval);
   }, [settings.dailyReminders, user.lastHabitLog]);

   return null; // This component has no UI, it just runs background logic
}
