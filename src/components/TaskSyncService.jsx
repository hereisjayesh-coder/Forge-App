import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getToday, getScheduledHabits } from '../utils/streakCalculator';
import { getOrCreateForgeTaskList, createGoogleTask, getGoogleTaskStatus } from '../utils/googleTasksLib';

const BASE_URL = 'https://tasks.googleapis.com/tasks/v1';

export default function TaskSyncService() {
   const { state, dispatch } = useApp();
   const today = getToday();

   useEffect(() => {
      // Only run if user is authenticated with Google and has a token
      const token = localStorage.getItem('google_oauth_token');
      if (!token || !state.user) return;

      const syncTasks = async () => {
         try {
            const listId = await getOrCreateForgeTaskList();
            if (!listId) return;

            // 1. Fetch all currently active tasks in the FORGE list
            const response = await fetch(`${BASE_URL}/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
               headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const gTasks = data.items || [];

            // 2. Clear out old tasks from yesterday (optional cleanup)
            // For simplicity, we'll just focus on syncing today's state.

            const scheduledToday = getScheduledHabits(state.habits, today);
            const currentCompletions = state.completions[today] || {};

            for (const habit of scheduledToday) {
               // We only sync habits that the user has explicitly opted into syncing
               if (!habit.syncToGoogle) continue;

               // Find if this habit already has a task in Google Tasks today
               // We match by title. To ensure it's today's task, we can check the 'due' date
               // or just rely on the fact that we clear/manage the list. 
               // For this implementation, we assume 1 task per habit name in the list.
               const gTask = gTasks.find(t => t.title === habit.name && new Date(t.updated).toISOString().startsWith(today));

               const isCompletedInForge = !!currentCompletions[habit.id];

               if (gTask) {
                  // Two-Way Sync: If completed in Google Tasks, but not in Forge -> Log it in Forge
                  if (gTask.status === 'completed' && !isCompletedInForge) {
                     dispatch({
                        type: 'LOG_HABIT',
                        payload: { habitId: habit.id, date: today, log: { done: true }, timestamp: Date.now() }
                     });
                  }
               } else {
                  // If task doesn't exist in Google Tasks, CREATE IT
                  // Excuse Injection:
                  let excusePrompt = "Don't miss this.";
                  if (habit.excusesList && habit.excusesList.length > 0) {
                     // Pick a random excuse
                     const randomExcuse = habit.excusesList[Math.floor(Math.random() * habit.excusesList.length)];
                     excusePrompt = `Your last excuse was: "${randomExcuse.excuse}". No excuses today.`;
                  }

                  // Due date formatting for Google Tasks (RFC 3339)
                  // We set it to today with the target time if provided, else end of day
                  const dueDate = new Date();
                  if (habit.targetTime) {
                     const [tHours, tMins] = habit.targetTime.split(':');
                     dueDate.setHours(tHours, tMins, 0, 0);
                  } else {
                     dueDate.setHours(23, 59, 59, 0);
                  }

                  await createGoogleTask(listId, habit.name, excusePrompt, dueDate.toISOString());
               }
            }

         } catch (error) {
            console.error('TaskSyncService Error:', error);
         }
      };

      // Run sync on mount (app load)
      syncTasks();

      // Run sync periodically every 5 minutes while app is open
      const intervalId = setInterval(syncTasks, 5 * 60 * 1000);
      return () => clearInterval(intervalId);

   }, [state.user, state.habits, state.completions, today, dispatch]);

   return null;
}
