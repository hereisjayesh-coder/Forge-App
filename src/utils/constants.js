// ===== TRACKING TYPES =====
export const TRACKING_TYPES = {
   checkbox: { id: 'checkbox', label: 'Checkbox', icon: '✅', description: 'Simple done/not done' },
   exercise: { id: 'exercise', label: 'Exercise', icon: '💪', description: 'Sets × Reps × Weight' },
   duration: { id: 'duration', label: 'Duration', icon: '⏱️', description: 'Track minutes' },
   quantity: { id: 'quantity', label: 'Quantity', icon: '🔢', description: 'Track count' },
   journal: { id: 'journal', label: 'Journal', icon: '📝', description: 'Auto-verified by journal entry' },
};

// ===== HABIT CATEGORIES =====
export const HABIT_CATEGORIES = [
   { id: 'health', label: 'Health', color: '#22c55e' },
   { id: 'fitness', label: 'Fitness', color: '#f97316' },
   { id: 'mind', label: 'Mind & Spirit', color: '#8b5cf6' },
   { id: 'work', label: 'Work', color: '#3b82f6' },
   { id: 'learning', label: 'Learning', color: '#eab308' },
   { id: 'other', label: 'Other', color: '#94a3b8' },
];

// ===== DEFAULT HABITS =====
export const DEFAULT_HABITS = [
   {
      id: 'pushups', name: 'Push-ups', icon: '💪', color: '#ef4444',
      trackingType: 'exercise',
      baseTarget: { sets: 3, reps: 10, weight: 0 },
      progressionRate: { reps: 2, perWeeks: 2 }, // +2 reps every 2 weeks
   },
   {
      id: 'meditation', name: 'Meditation', icon: '🧘', color: '#8b5cf6',
      trackingType: 'duration',
      baseTarget: { minutes: 10 },
      progressionRate: { minutes: 2, perWeeks: 2 },
   },
   {
      id: 'reading', name: 'Reading', icon: '📚', color: '#3b82f6',
      trackingType: 'duration',
      baseTarget: { minutes: 15 },
      progressionRate: { minutes: 5, perWeeks: 2 },
   },
   {
      id: 'cold_shower', name: 'Cold Shower', icon: '🧊', color: '#06b6d4',
      trackingType: 'duration',
      baseTarget: { minutes: 2 },
      progressionRate: { minutes: 1, perWeeks: 3 },
   },
   {
      id: 'no_distraction', name: 'No Distractions', icon: '🔇', color: '#f59e0b',
      trackingType: 'checkbox',
   },
   {
      id: 'journaling', name: 'Journaling', icon: '📝', color: '#22c55e',
      trackingType: 'journal',
   },
   {
      id: 'exercise', name: 'Exercise', icon: '🏃', color: '#ec4899',
      trackingType: 'duration',
      baseTarget: { minutes: 30 },
      progressionRate: { minutes: 5, perWeeks: 2 },
   },
   {
      id: 'water', name: 'Drink Water', icon: '💧', color: '#0ea5e9',
      trackingType: 'quantity',
      baseTarget: { count: 8, unit: 'glasses' },
      progressionRate: null,
   },
   {
      id: 'sleep_early', name: 'Sleep Early', icon: '😴', color: '#6366f1',
      trackingType: 'checkbox',
   },
   {
      id: 'healthy_eating', name: 'Healthy Eating', icon: '🥗', color: '#10b981',
      trackingType: 'checkbox',
   },
   {
      id: 'gratitude', name: 'Gratitude', icon: '🙏', color: '#f97316',
      trackingType: 'journal',
   },
   {
      id: 'coding', name: 'Coding', icon: '💻', color: '#14b8a6',
      trackingType: 'duration',
      baseTarget: { minutes: 30 },
      progressionRate: { minutes: 10, perWeeks: 3 },
   },
];

// ===== MOOD OPTIONS =====
export const MOODS = [
   { value: 1, emoji: '😞', label: 'Terrible', color: '#ef4444' },
   { value: 2, emoji: '😔', label: 'Bad', color: '#f97316' },
   { value: 3, emoji: '😐', label: 'Okay', color: '#f59e0b' },
   { value: 4, emoji: '😊', label: 'Good', color: '#22c55e' },
   { value: 5, emoji: '🤩', label: 'Amazing', color: '#8b5cf6' },
];

// ===== HABIT ICONS =====
export const HABIT_ICONS = [
   '💪', '🧘', '📚', '🧊', '🔇', '📝', '🏃', '💧', '😴', '🥗',
   '🙏', '💻', '🎯', '🏋️', '🧠', '🎨', '🎸', '🌱', '⏰', '🚶',
   '🍎', '🧹', '📱', '🔬', '✍️', '🎓', '🏊', '🚴', '🧑‍💻', '💤',
];

// ===== HABIT COLORS =====
export const HABIT_COLORS = [
   '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981',
   '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
   '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
];

// ===== GHOST MODE DURATIONS =====
export const GHOST_MODE_DURATIONS = [
   { days: 30, label: '30 Days', description: 'Sprint Mode', icon: '⚡' },
   { days: 60, label: '60 Days', description: 'Build Momentum', icon: '🔥' },
   { days: 90, label: '90 Days', description: 'Transformation', icon: '🦋' },
   { days: 180, label: '180 Days', description: 'Half-Year Grind', icon: '⚔️' },
   { days: 365, label: '365 Days', description: 'Ultimate Forge', icon: '👑' },
];

// ===== JOURNAL PROMPTS =====
export const JOURNAL_PROMPTS = [
   "What are you grateful for today?",
   "What's one thing you did today that pushed you outside your comfort zone?",
   "How did you show discipline today?",
   "What's the biggest lesson you learned this week?",
   "What habit are you most proud of building?",
   "Where do you see yourself in 90 days?",
   "What distraction did you successfully avoid today?",
   "How are you feeling mentally and physically right now?",
   "What would your future self thank you for doing today?",
   "What's one thing you could improve tomorrow?",
   "Describe a moment today when you felt truly focused.",
   "What progress have you made toward your goals this week?",
   "If you could change one habit, what would it be?",
   "What motivated you to keep going today?",
   "How has your mindset changed since you started this journey?",
];

// ===== SCHEDULE DAYS =====
export const DAYS_OF_WEEK = [
   { value: 0, label: 'Sun', full: 'Sunday' },
   { value: 1, label: 'Mon', full: 'Monday' },
   { value: 2, label: 'Tue', full: 'Tuesday' },
   { value: 3, label: 'Wed', full: 'Wednesday' },
   { value: 4, label: 'Thu', full: 'Thursday' },
   { value: 5, label: 'Fri', full: 'Friday' },
   { value: 6, label: 'Sat', full: 'Saturday' },
];
