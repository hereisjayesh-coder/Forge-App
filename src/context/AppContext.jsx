import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { XP_REWARDS } from '../utils/rankSystem';
import { getToday } from '../utils/streakCalculator';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { getMessaging, getToken } from 'firebase/messaging';
import { db } from '../firebase';

const AppContext = createContext(null);

const STORAGE_KEY = 'forge_app_data';

// ===== INITIAL STATE =====
const initialState = {
   habits: [],
   completions: {},
   missedHabitsToExcuse: [], // [{ id: 'habitId', date: 'YYYY-MM-DD' }]
   forgeMode: null,
   forgeModeHistory: [],
   journal: [],
   user: {
      name: '',
      xp: 0,
      totalCompletions: 0,
      forgeModesCompleted: 0,
      lastHabitLog: null, // { timestamp: 1234567, id: '...' }
      dailyChallengeCompleted: null, // 'YYYY-MM-DD'
   },
   settings: {
      theme: 'dark',
      onboardingComplete: false,
      isPublic: true,
      strictTracking: false,
      dailyReminders: false,
   },
};

// ===== GENERATE ID =====
function generateId() {
   return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ===== REDUCER =====
function appReducer(state, action) {
   switch (action.type) {
      case 'LOAD_STATE':
         return { ...initialState, ...action.payload };

      case 'COMPLETE_ONBOARDING':
         return {
            ...state,
            user: { ...state.user },
            habits: action.payload.habits.map(h => ({
               ...h,
               id: h.id || generateId(),
               schedule: h.schedule || { type: 'daily' },
               createdAt: getToday(),
            })),
            forgeMode: action.payload.forgeMode || null,
            settings: { ...state.settings, onboardingComplete: true },
         };

      case 'ADD_HABIT': {
         const newHabit = {
            ...action.payload,
            id: generateId(),
            createdAt: getToday(),
         };
         return { ...state, habits: [...state.habits, newHabit] };
      }

      case 'UPDATE_HABIT': {
         return {
            ...state,
            habits: state.habits.map(h =>
               h.id === action.payload.id ? { ...h, ...action.payload } : h
            ),
         };
      }

      case 'DELETE_HABIT': {
         return {
            ...state,
            habits: state.habits.filter(h => h.id !== action.payload),
         };
      }

      case 'REORDER_HABITS': {
         return {
            ...state,
            habits: action.payload,
         };
      }

      case 'LOG_HABIT': {
         const { habitId, date, log, timestamp } = action.payload;
         const dateCompletions = { ...(state.completions[date] || {}) };
         dateCompletions[habitId] = { completed: true, log: log || {} };

         // Combo check
         let comboXP = 0;
         let newLastLog = { timestamp, id: habitId };
         const lastLog = state.user.lastHabitLog;
         if (lastLog && timestamp) {
            const timeDiff = timestamp - lastLog.timestamp;
            // If they log a different habit within 15 minutes = Combo!
            if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000 && lastLog.id !== habitId) {
               comboXP = 5;
            }
         }

         return {
            ...state,
            completions: { ...state.completions, [date]: dateCompletions },
            user: {
               ...state.user,
               xp: state.user.xp + XP_REWARDS.HABIT_COMPLETE + comboXP,
               totalCompletions: state.user.totalCompletions + 1,
               lastHabitLog: newLastLog,
            },
         };
      }

      case 'UNDO_HABIT': {
         const { habitId: undoId, date: undoDate } = action.payload;
         const undoCompletions = { ...(state.completions[undoDate] || {}) };
         delete undoCompletions[undoId];

         return {
            ...state,
            completions: { ...state.completions, [undoDate]: undoCompletions },
            user: {
               ...state.user,
               xp: Math.max(0, state.user.xp - XP_REWARDS.HABIT_COMPLETE),
               totalCompletions: Math.max(0, state.user.totalCompletions - 1),
            },
         };
      }

      case 'START_FORGE_MODE': {
         const { duration, habitIds } = action.payload;
         const startDate = getToday();
         const endDate = new Date(new Date(startDate + 'T12:00:00').getTime() + duration * 86400000)
            .toISOString().split('T')[0];
         return {
            ...state,
            forgeMode: {
               active: true,
               startDate,
               endDate,
               duration,
               habitIds,
            }
         };
      }

      case 'AUDIT_MISSED_HABITS': {
         const { missedHabitIds, date } = action.payload;
         if (!missedHabitIds || missedHabitIds.length === 0) return state;

         // Penalty: 25 XP per missed habit
         const penalty = missedHabitIds.length * 25;

         // Only add ones we haven't excused yet
         const existingMisses = state.missedHabitsToExcuse || [];
         const newMisses = missedHabitIds
            .map(id => ({ id, date }))
            .filter(n => !existingMisses.some(e => e.id === n.id && e.date === n.date));

         if (newMisses.length === 0) return state;

         return {
            ...state,
            user: {
               ...state.user,
               xp: Math.max(0, state.user.xp - penalty),
            },
            missedHabitsToExcuse: [...existingMisses, ...newMisses]
         };
      }

      case 'SUBMIT_EXCUSE': {
         const { habitId, date, excuse } = action.payload;

         const updatedHabits = state.habits.map(h => {
            if (h.id === habitId) {
               return {
                  ...h,
                  excusesList: [...(h.excusesList || []), { date, excuse }]
               };
            }
            return h;
         });

         const newMissed = (state.missedHabitsToExcuse || []).filter(
            m => !(m.id === habitId && m.date === date)
         );

         return {
            ...state,
            habits: updatedHabits,
            missedHabitsToExcuse: newMissed,
         };
      }


      case 'COMPLETE_FORGE_MODE': {
         const xpBonus = XP_REWARDS.FORGE_MODE_COMPLETE;
         return {
            ...state,
            forgeModeHistory: [...state.forgeModeHistory, { ...state.forgeMode, completedAt: getToday() }],
            forgeMode: null,
            user: {
               ...state.user,
               xp: state.user.xp + xpBonus,
               forgeModesCompleted: state.user.forgeModesCompleted + 1,
            },
         };
      }

      case 'CANCEL_FORGE_MODE': {
         return { ...state, forgeMode: null };
      }

      case 'ADD_JOURNAL_ENTRY': {
         const entry = {
            ...action.payload,
            id: generateId(),
            createdAt: new Date().toISOString(),
         };
         const xpBonus = XP_REWARDS.JOURNAL_ENTRY;
         return {
            ...state,
            journal: [entry, ...state.journal],
            user: { ...state.user, xp: state.user.xp + xpBonus },
         };
      }

      case 'COMPLETE_CHALLENGE': {
         return {
            ...state,
            user: {
               ...state.user,
               xp: state.user.xp + action.payload.xpReward,
               dailyChallengeCompleted: action.payload.date,
            },
         };
      }

      case 'DELETE_JOURNAL_ENTRY': {
         return {
            ...state,
            journal: state.journal.filter(j => j.id !== action.payload),
         };
      }

      case 'UPDATE_SETTINGS': {
         return {
            ...state,
            settings: { ...state.settings, ...action.payload },
         };
      }

      case 'UPDATE_USER': {
         return {
            ...state,
            user: { ...state.user, ...action.payload },
         };
      }

      case 'ADD_XP': {
         return {
            ...state,
            user: { ...state.user, xp: state.user.xp + action.payload },
         };
      }

      case 'IMPORT_DATA': {
         return { ...initialState, ...action.payload };
      }

      case 'RESET_ALL': {
         return { ...initialState };
      }

      default:
         return state;
   }
}

// ===== FIRESTORE HELPERS =====
async function loadFromFirestore(uid) {
   try {
      // 1. Load Main User Doc (Profile, Settings, Habits)
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;

      const userData = docSnap.data();

      // 2. Load Sharded Data (Completions + Journal)
      // This solves the 1MB Firestore document limit constraint
      let completions = {};
      let journal = [];

      try {
         const dataCollection = collection(db, `users/${uid}/data`);
         const dataDocs = await getDocs(dataCollection);

         dataDocs.forEach(d => {
            if (d.id === 'completions') completions = d.data();
            if (d.id === 'journal') journal = d.data().entries || [];
         });
      } catch (subErr) {
         console.warn('Failed to load sharded data:', subErr);
      }

      // 3. Merge Phase
      // If the old monolithic doc has completions/journal embedded, we migrate them.
      // Otherwise we use the sharded ones.
      return {
         ...userData,
         completions: Object.keys(userData.completions || {}).length > 0 ? userData.completions : completions,
         journal: (userData.journal && userData.journal.length > 0) ? userData.journal : journal,
      };

   } catch (e) {
      console.warn('Firestore load failed, using localStorage:', e);
   }
   return null;
}

async function saveToFirestore(uid, state) {
   try {
      // Sharding: Separate the massive data objects from the main user profile
      const { completions, journal, ...mainState } = state;

      // 1. Save Main Doc
      const docRef = doc(db, 'users', uid);
      // Clean up monolithic fields if they exist to free up 1MB limit space
      const cleanMainState = { ...mainState };
      delete cleanMainState.completions;
      delete cleanMainState.journal;
      await setDoc(docRef, cleanMainState, { merge: true });

      // 2. Save Completions Subcollection Doc
      const completionsRef = doc(db, `users/${uid}/data`, 'completions');
      await setDoc(completionsRef, completions);

      // 3. Save Journal Subcollection Doc
      const journalRef = doc(db, `users/${uid}/data`, 'journal');
      await setDoc(journalRef, { entries: journal });

   } catch (e) {
      console.warn('Firestore sharded save failed:', e);
   }
}

// ===== PROVIDER =====
export function AppProvider({ children, firebaseUser }) {
   const [state, dispatch] = useReducer(appReducer, initialState, () => {
      try {
         const saved = localStorage.getItem(STORAGE_KEY);
         if (saved) {
            const parsed = JSON.parse(saved);
            return { ...initialState, ...parsed };
         }
      } catch (e) {
         console.error('Failed to load state:', e);
      }
      return initialState;
   });

   const saveTimerRef = useRef(null);
   const uid = firebaseUser?.uid;

   // Load from Firestore when user logs in
   useEffect(() => {
      if (!uid) return;
      loadFromFirestore(uid).then(data => {
         if (data) {
            dispatch({ type: 'LOAD_STATE', payload: data });
         }
      });
   }, [uid]);

   // Firebase Cloud Messaging (FCM) Token Request
   useEffect(() => {
      if (!uid) return;
      if (typeof window !== 'undefined' && 'Notification' in window) {
         try {
            const messaging = getMessaging();
            // ONLY request the token if they actually enabled Daily Reminders at some point
            if (state.settings?.dailyReminders || Notification.permission === 'granted') {
               getToken(messaging, {
                  // Place your VAPID key here from Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
                  vapidKey: 'REPLACE_WITH_YOUR_VAPID_KEY'
               }).then((currentToken) => {
                  if (currentToken) {
                     // Check if token changed
                     if (state.user.fcmToken !== currentToken) {
                        dispatch({ type: 'UPDATE_USER', payload: { fcmToken: currentToken } });
                     }
                  }
               }).catch((err) => {
                  console.warn('An error occurred while retrieving FCM token. ', err);
               });
            }
         } catch (e) {
            console.warn('FCM not supported or enabled in this environment', e);
         }
      }
   }, [uid, state.settings?.dailyReminders, state.user.fcmToken]);

   // Set user name from Google profile if not already set
   useEffect(() => {
      if (firebaseUser && (!state.user.name || state.user.name === 'Forger')) {
         dispatch({
            type: 'UPDATE_USER',
            payload: { name: firebaseUser.displayName || 'Forger' },
         });
      }
   }, [firebaseUser]);

   // Auto-save to localStorage + Firestore (debounced)
   useEffect(() => {
      // Always save to localStorage immediately
      try {
         localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
         console.error('Failed to save state:', e);
      }

      // Debounce Firestore save
      if (uid) {
         if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
         saveTimerRef.current = setTimeout(() => {
            saveToFirestore(uid, state);
         }, 2000);
      }

      return () => {
         if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      };
   }, [state, uid]);

   // Apply theme
   useEffect(() => {
      document.documentElement.setAttribute('data-theme', state.settings.theme);
   }, [state.settings.theme]);

   // Check Forge Mode expiry
   useEffect(() => {
      if (state.forgeMode?.active) {
         const today = getToday();
         if (today >= state.forgeMode.endDate) {
            dispatch({ type: 'COMPLETE_FORGE_MODE' });
         }
      }
   }, [state.forgeMode]);

   return (
      <AppContext.Provider value={{ state, dispatch }}>
         {children}
      </AppContext.Provider>
   );
}

// ===== HOOK =====
export function useApp() {
   const context = useContext(AppContext);
   if (!context) throw new Error('useApp must be used within AppProvider');
   return context;
}

export default AppContext;
