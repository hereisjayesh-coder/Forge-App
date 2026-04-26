import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getToday, getScheduledHabits } from '../utils/streakCalculator';
import { isJournalComplete } from '../utils/progressionEngine';

export default function AuditService() {
   const { state, dispatch } = useApp();

   useEffect(() => {
      // 1. Determine if an audit is needed today
      const today = getToday();
      if (!state.user || state.user.lastAuditDate === today) return;
      if (!state.settings.onboardingComplete) return;

      // 2. We only want to audit if the account existed yesterday.
      // Easiest heuristic: checking if totalCompletions > 0 or checking account creation.
      // Let's just calculate "yesterday"
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      // 3. Find scheduled habits for yesterday
      const scheduledYesterday = getScheduledHabits(state.habits, yesterday);

      // 4. Determine which ones were missed
      const completionsYesterday = state.completions[yesterday] || {};
      const missedIds = [];

      scheduledYesterday.forEach(habit => {
         let isDone = false;
         if (habit.trackingType === 'journal') {
            isDone = isJournalComplete(state.journal, yesterday);
         } else {
            isDone = !!completionsYesterday[habit.id];
         }

         if (!isDone) {
            missedIds.push(habit.id);
         }
      });

      // 5. Fire the Audit Action
      if (missedIds.length > 0) {
         dispatch({
            type: 'AUDIT_MISSED_HABITS',
            payload: { missedHabitIds: missedIds, date: yesterday }
         });
      }

      // 6. Mark today's audit as complete so we don't spam
      dispatch({
         type: 'UPDATE_USER',
         payload: { lastAuditDate: today }
      });

   }, [state.user?.lastAuditDate, state.settings.onboardingComplete]);

   return null;
}
