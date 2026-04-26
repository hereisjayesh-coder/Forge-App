// ===== RANK TIERS =====
export const RANKS = [
  { level: 1, name: 'Apprentice', minXP: 0, icon: '🔨', color: '#6b7280' },
  { level: 2, name: 'Ironworker', minXP: 100, icon: '⚒️', color: '#8b5cf6' },
  { level: 3, name: 'Bladesmith', minXP: 300, icon: '🗡️', color: '#7c3aed' },
  { level: 4, name: 'Steel Forger', minXP: 600, icon: '⚡', color: '#6d28d9' },
  { level: 5, name: 'Anvil Master', minXP: 1000, icon: '🛡️', color: '#06b6d4' },
  { level: 6, name: 'War Forger', minXP: 1500, icon: '⚔️', color: '#0891b2' },
  { level: 7, name: 'Temperer', minXP: 2200, icon: '✨', color: '#0d9488' },
  { level: 8, name: 'Mythic Smith', minXP: 3200, icon: '💎', color: '#059669' },
  { level: 9, name: 'Titan Forger', minXP: 5000, icon: '🔥', color: '#f59e0b' },
  { level: 10, name: 'Master Forger', minXP: 8000, icon: '👑', color: '#ef4444' },
];

// ===== XP REWARDS =====
export const XP_REWARDS = {
  HABIT_COMPLETE: 10,
  STREAK_7_DAYS: 50,
  STREAK_30_DAYS: 200,
  STREAK_100_DAYS: 500,
  FORGE_MODE_COMPLETE: 300,
  JOURNAL_ENTRY: 5,
  ALL_HABITS_TODAY: 25,
  FIRST_HABIT: 20,
};

// ===== BADGE DEFINITIONS =====
export const BADGES = [
  { id: 'first_habit', name: 'First Strike', icon: '🔨', description: 'Complete your first habit', condition: (stats) => stats.totalCompletions >= 1 },
  { id: 'streak_7', name: '7-Day Warrior', icon: '🔥', description: 'Maintain a 7-day streak', condition: (stats) => stats.longestStreak >= 7 },
  { id: 'streak_30', name: '30-Day Champion', icon: '⚔️', description: 'Maintain a 30-day streak', condition: (stats) => stats.longestStreak >= 30 },
  { id: 'streak_100', name: 'Century Club', icon: '💯', description: 'Maintain a 100-day streak', condition: (stats) => stats.longestStreak >= 100 },
  { id: 'streak_365', name: 'Year of Iron', icon: '🏆', description: 'Maintain a 365-day streak', condition: (stats) => stats.longestStreak >= 365 },
  { id: 'completions_50', name: 'Grinding', icon: '💪', description: 'Complete 50 habits total', condition: (stats) => stats.totalCompletions >= 50 },
  { id: 'completions_500', name: 'Relentless', icon: '🦾', description: 'Complete 500 habits total', condition: (stats) => stats.totalCompletions >= 500 },
  { id: 'completions_1000', name: 'Unstoppable', icon: '⭐', description: 'Complete 1000 habits total', condition: (stats) => stats.totalCompletions >= 1000 },
  { id: 'forge_mode', name: 'Forged in Fire', icon: '🔥', description: 'Complete a Forge Mode challenge', condition: (stats) => stats.forgeModesCompleted >= 1 },
  { id: 'forge_mode_3', name: 'Triple Forged', icon: '⚒️', description: 'Complete 3 Forge Mode challenges', condition: (stats) => stats.forgeModesCompleted >= 3 },
  { id: 'journal_7', name: 'Reflector', icon: '📝', description: 'Write 7 journal entries', condition: (stats) => stats.journalEntries >= 7 },
  { id: 'journal_30', name: 'Deep Thinker', icon: '🧠', description: 'Write 30 journal entries', condition: (stats) => stats.journalEntries >= 30 },
  { id: 'all_habits_7', name: 'Perfect Week', icon: '🌟', description: 'Complete all habits for 7 consecutive days', condition: (stats) => stats.perfectDays >= 7 },
  { id: 'iceproof', name: 'Iceproof', icon: '🧊', description: 'Track cold showers for 30 days', condition: (stats) => stats.iceproofDays >= 30 },
  { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Complete habits before 8am for 14 days', condition: (stats) => stats.earlyBirdDays >= 14 },
  { id: 'rank_5', name: 'Anvil Master', icon: '🛡️', description: 'Reach Rank 5 (Anvil Master)', condition: (stats) => stats.rank >= 5 },
  { id: 'rank_10', name: 'Legendary', icon: '👑', description: 'Reach Rank 10 (Master Forger)', condition: (stats) => stats.rank >= 10 },
];

// ===== HELPER FUNCTIONS =====

export function getRankForXP(xp) {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXP) {
      currentRank = rank;
    } else {
      break;
    }
  }
  return currentRank;
}

export function getNextRank(currentRank) {
  const idx = RANKS.findIndex(r => r.level === currentRank.level);
  if (idx < RANKS.length - 1) {
    return RANKS[idx + 1];
  }
  return null;
}

export function getXPProgress(xp) {
  const current = getRankForXP(xp);
  const next = getNextRank(current);
  if (!next) return { current: xp, needed: 0, percentage: 100 };

  const xpInCurrentTier = xp - current.minXP;
  const xpNeededForNext = next.minXP - current.minXP;
  const percentage = Math.min((xpInCurrentTier / xpNeededForNext) * 100, 100);

  return {
    current: xpInCurrentTier,
    needed: xpNeededForNext,
    percentage,
  };
}

export function getEarnedBadges(stats) {
  return BADGES.filter(badge => badge.condition(stats));
}

export function getLockedBadges(stats) {
  return BADGES.filter(badge => !badge.condition(stats));
}
