import { daysBetween, getToday } from './streakCalculator';

/**
 * Get number of weeks since a habit was created.
 */
export function getWeeksSinceCreation(createdAt) {
   if (!createdAt) return 0;
   const days = daysBetween(createdAt, getToday());
   return Math.max(0, Math.floor(days / 7));
}

/**
 * Compute the current target for a habit based on progressive overload.
 * Returns the target object with updated values.
 */
export function getCurrentTarget(habit) {
   const { trackingType, baseTarget, progressionRate, createdAt } = habit;

   if (!baseTarget) return null;
   if (!progressionRate) return { ...baseTarget };

   const weeks = getWeeksSinceCreation(createdAt);
   const progressionCycles = Math.floor(weeks / (progressionRate.perWeeks || 2));

   switch (trackingType) {
      case 'exercise': {
         const repsIncrease = (progressionRate.reps || 0) * progressionCycles;
         const setsIncrease = (progressionRate.sets || 0) * progressionCycles;
         return {
            sets: (baseTarget.sets || 3) + setsIncrease,
            reps: (baseTarget.reps || 10) + repsIncrease,
            weight: baseTarget.weight || 0,
         };
      }
      case 'duration': {
         const minutesIncrease = (progressionRate.minutes || 0) * progressionCycles;
         return {
            minutes: (baseTarget.minutes || 10) + minutesIncrease,
         };
      }
      case 'quantity': {
         const countIncrease = (progressionRate.count || 0) * progressionCycles;
         return {
            count: (baseTarget.count || 1) + countIncrease,
            unit: baseTarget.unit || 'times',
         };
      }
      default:
         return { ...baseTarget };
   }
}

/**
 * Check if a habit log meets the current target.
 */
export function meetsTarget(habit, log) {
   if (!log) return false;
   const target = getCurrentTarget(habit);
   if (!target) return true; // No target = any log counts

   switch (habit.trackingType) {
      case 'exercise':
         return (log.sets || 0) >= (target.sets || 1) && (log.reps || 0) >= (target.reps || 1);
      case 'duration':
         return (log.minutes || 0) >= (target.minutes || 1);
      case 'quantity':
         return (log.count || 0) >= (target.count || 1);
      default:
         return true;
   }
}

/**
 * Format a target for display.
 */
export function formatTarget(habit) {
   const target = getCurrentTarget(habit);
   if (!target) return '';

   switch (habit.trackingType) {
      case 'exercise':
         return `${target.sets}×${target.reps}${target.weight > 0 ? ` @ ${target.weight}kg` : ''}`;
      case 'duration':
         return `${target.minutes} min`;
      case 'quantity':
         return `${target.count} ${target.unit || 'times'}`;
      default:
         return '';
   }
}

/**
 * Format a log entry for display.
 */
export function formatLog(trackingType, log) {
   if (!log) return '';

   switch (trackingType) {
      case 'exercise':
         return `${log.sets}×${log.reps}${log.weight > 0 ? ` @ ${log.weight}kg` : ''}`;
      case 'duration':
         return `${log.minutes} min`;
      case 'quantity':
         return `${log.count} ${log.unit || ''}`.trim();
      case 'journal':
         return 'Entry written';
      case 'checkbox':
         return 'Done';
      default:
         return '';
   }
}

/**
 * Check if journaling habit is complete for a given date.
 */
export function isJournalComplete(journal, date) {
   return journal.some(entry => {
      const entryDate = entry.createdAt?.split('T')[0];
      return entryDate === date;
   });
}
