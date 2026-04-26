import { getToday } from './streakCalculator';

export const CHALLENGES = [
   {
      id: 'early_bird',
      title: 'Dawn Forger',
      description: 'Complete 2 habits before 9:00 AM',
      xpReward: 30,
      icon: '🌅',
   },
   {
      id: 'the_trio',
      title: 'Triple Strike',
      description: 'Complete 3 habits today',
      xpReward: 25,
      icon: '⚡',
   },
   {
      id: 'journal_deep',
      title: 'Deep Reflection',
      description: 'Write a journal entry',
      xpReward: 20,
      icon: '📝',
   },
   {
      id: 'flawless',
      title: 'Flawless Victory',
      description: 'Complete all scheduled habits today',
      xpReward: 50,
      icon: '⭐',
   },
   {
      id: 'forge_stepper',
      title: 'Step Up',
      description: 'Complete any tracking habit (number/duration)',
      xpReward: 25,
      icon: '💪',
   }
];

export function getDailyChallenge() {
   const today = getToday();
   let hash = 0;
   for (let i = 0; i < today.length; i++) {
      hash = today.charCodeAt(i) + ((hash << 5) - hash);
   }
   const index = Math.abs(hash) % CHALLENGES.length;
   return CHALLENGES[index];
}

export function checkChallengeCompletion(challenge, state, todayStr) {
   const todayComps = state.completions[todayStr] || {};
   const completionsCount = Object.keys(todayComps).length;

   switch (challenge.id) {
      case 'early_bird': {
         // This is a simplified check: we just check if it's before 9AM when they complete 2 habits
         const hour = new Date().getHours();
         return completionsCount >= 2 && hour < 9;
      }
      case 'the_trio':
         return completionsCount >= 3;
      case 'journal_deep': {
         return state.journal.some(j => j.date === todayStr);
      }
      case 'flawless': {
         // Flawless is tricky to check generically here without habits, but we can pass state.habits
         const scheduled = state.habits.filter(h => {
            if (!h.schedule) return true;
            if (h.schedule.type === 'daily') return true;
            const d = new Date(todayStr + 'T00:00:00');
            const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()];
            return h.schedule.days?.includes(dayName);
         });
         return scheduled.length > 0 && completionsCount >= scheduled.length;
      }
      case 'forge_stepper': {
         return state.habits.some(h =>
            (h.trackingType === 'exercise' || h.trackingType === 'duration' || h.trackingType === 'quantity')
            && todayComps[h.id]
         );
      }
      default:
         return false;
   }
}
