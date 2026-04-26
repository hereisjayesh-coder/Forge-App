// ===== DATE HELPERS =====

// Format a Date object to YYYY-MM-DD using LOCAL time (avoids UTC timezone bugs)
function toLocalDateStr(d) {
   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getToday() {
   return toLocalDateStr(new Date());
}

export function formatDate(dateStr) {
   const d = new Date(dateStr + 'T12:00:00');
   return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr) {
   const d = new Date(dateStr + 'T12:00:00');
   return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDayName(dateStr) {
   const d = new Date(dateStr + 'T12:00:00');
   return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function addDays(dateStr, days) {
   const d = new Date(dateStr + 'T12:00:00');
   d.setDate(d.getDate() + days);
   return toLocalDateStr(d);
}

export function daysBetween(startDate, endDate) {
   const start = new Date(startDate + 'T12:00:00');
   const end = new Date(endDate + 'T12:00:00');
   return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export function getDateRange(startDate, endDate) {
   const dates = [];
   let current = startDate;
   while (current <= endDate) {
      dates.push(current);
      current = addDays(current, 1);
   }
   return dates;
}

export function getLast7Days() {
   const today = getToday();
   return getDateRange(addDays(today, -6), today);
}

export function getLast30Days() {
   const today = getToday();
   return getDateRange(addDays(today, -29), today);
}

export function getLast90Days() {
   const today = getToday();
   return getDateRange(addDays(today, -89), today);
}

// ===== STREAK CALCULATIONS =====

export function calculateCurrentStreak(completions, habits) {
   if (!habits.length) return 0;

   let streak = 0;
   let date = getToday();

   // Check if today has any completions, if not start from yesterday
   const todayCompletions = completions[date] || {};
   const hasTodayCompletions = habits.some(h => todayCompletions[h.id]);

   if (!hasTodayCompletions) {
      date = addDays(date, -1);
   }

   while (true) {
      const dayCompletions = completions[date] || {};
      const scheduledHabits = getScheduledHabits(habits, date);

      if (scheduledHabits.length === 0) {
         date = addDays(date, -1);
         continue;
      }

      const allCompleted = scheduledHabits.every(h => dayCompletions[h.id]);

      if (allCompleted) {
         streak++;
         date = addDays(date, -1);
      } else {
         break;
      }

      // Safety: don't go beyond 1000 days
      if (streak > 1000) break;
   }

   return streak;
}

export function calculateLongestStreak(completions, habits) {
   if (!habits.length) return 0;

   const dates = Object.keys(completions).sort();
   if (!dates.length) return 0;

   let longest = 0;
   let current = 0;
   let prevDate = null;

   for (const date of dates) {
      const dayCompletions = completions[date];
      const scheduledHabits = getScheduledHabits(habits, date);

      if (scheduledHabits.length === 0) continue;

      const allCompleted = scheduledHabits.every(h => dayCompletions[h.id]);

      if (allCompleted) {
         if (prevDate && daysBetween(prevDate, date) === 1) {
            current++;
         } else {
            current = 1;
         }
         longest = Math.max(longest, current);
         prevDate = date;
      } else {
         current = 0;
         prevDate = null;
      }
   }

   return longest;
}

export function calculateHabitStreak(completions, habitId) {
   let streak = 0;
   let date = getToday();

   // Check today first
   const todayComp = completions[date] || {};
   if (!todayComp[habitId]) {
      date = addDays(date, -1);
   }

   while (true) {
      const dayComp = completions[date] || {};
      if (dayComp[habitId]) {
         streak++;
         date = addDays(date, -1);
      } else {
         break;
      }
      if (streak > 1000) break;
   }

   return streak;
}

export function getScheduledHabits(habits, dateStr) {
   const day = new Date(dateStr + 'T12:00:00').getDay(); // 0=Sun, 6=Sat
   return habits.filter(habit => {
      if (!habit.schedule || habit.schedule.type === 'daily') return true;
      if (habit.schedule.type === 'weekly') {
         return habit.schedule.days.includes(day);
      }
      return true;
   });
}

// ===== COMPLETION RATES =====

export function getCompletionRate(completions, habits, dateRange) {
   if (!habits.length || !dateRange.length) return 0;

   let totalScheduled = 0;
   let totalCompleted = 0;

   for (const date of dateRange) {
      const scheduled = getScheduledHabits(habits, date);
      totalScheduled += scheduled.length;

      const dayComp = completions[date] || {};
      totalCompleted += scheduled.filter(h => dayComp[h.id]).length;
   }

   return totalScheduled ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
}

export function getDailyCompletionData(completions, habits, dateRange) {
   return dateRange.map(date => {
      const scheduled = getScheduledHabits(habits, date);
      const dayComp = completions[date] || {};
      const completed = scheduled.filter(h => dayComp[h.id]).length;
      const rate = scheduled.length ? Math.round((completed / scheduled.length) * 100) : 0;

      return { date, completed, total: scheduled.length, rate };
   });
}

export function getHabitCompletionData(completions, habits, dateRange) {
   return habits.map(habit => {
      let completed = 0;
      let scheduled = 0;

      for (const date of dateRange) {
         const scheduledHabits = getScheduledHabits([habit], date);
         if (scheduledHabits.length > 0) {
            scheduled++;
            if (completions[date]?.[habit.id]) completed++;
         }
      }

      const rate = scheduled ? Math.round((completed / scheduled) * 100) : 0;
      return { name: habit.name, completed, scheduled, rate, color: habit.color };
   });
}

export function getTotalCompletions(completions) {
   let total = 0;
   for (const date of Object.keys(completions)) {
      total += Object.values(completions[date]).filter(Boolean).length;
   }
   return total;
}

export function getPerfectDays(completions, habits) {
   let count = 0;
   for (const date of Object.keys(completions)) {
      const scheduled = getScheduledHabits(habits, date);
      if (scheduled.length === 0) continue;
      const dayComp = completions[date] || {};
      if (scheduled.every(h => dayComp[h.id])) {
         count++;
      }
   }
   return count;
}
