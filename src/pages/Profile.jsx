import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../components/ConfirmDialog';
import Tooltip from '../components/Tooltip';
import {
   getRankForXP, getNextRank, getXPProgress, RANKS,
   getEarnedBadges, getLockedBadges,
} from '../utils/rankSystem';
import { calculateCurrentStreak, calculateLongestStreak, getTotalCompletions, getPerfectDays } from '../utils/streakCalculator';
import { Sun, Moon, Download, Upload, Trash2, LogOut, Share2, Shield, Lock, Bell, Heart, Mail, Copy, FileText } from 'lucide-react';
import { useToast } from '../components/AchievementToast';
import { useRef } from 'react';
import './Profile.css';

export default function Profile() {
   const { state, dispatch } = useApp();
   const { user: authUser, signOut } = useAuth();
   const confirm = useConfirm();
   const { user, habits, completions, journal, forgeModeHistory, settings } = state;
   const fileInputRef = useRef(null);

   // Rank info
   const rank = getRankForXP(user.xp);
   const nextRank = getNextRank(rank);
   const xpProgress = getXPProgress(user.xp);

   // Stats
   const currentStreak = calculateCurrentStreak(completions, habits);
   const longestStreak = calculateLongestStreak(completions, habits);
   const totalCompletions = getTotalCompletions(completions);
   const perfectDays = getPerfectDays(completions, habits);

   const stats = {
      totalCompletions,
      longestStreak,
      forgeModesCompleted: user.forgeModesCompleted || 0,
      journalEntries: journal.length,
      perfectDays,
      rank: rank.level,
      iceproofDays: 0,
      earlyBirdDays: 0,
   };

   const earnedBadges = getEarnedBadges(stats);
   const lockedBadges = getLockedBadges(stats);

   const isDark = settings.theme === 'dark';

   const toggleTheme = () => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: isDark ? 'light' : 'dark' } });
   };

   const togglePrivacy = () => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { isPublic: !settings.isPublic } });
   };

   const toggleStrict = () => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { strictTracking: !settings.strictTracking } });
   };

   const toggleReminders = () => {
      if (!settings.dailyReminders && 'Notification' in window) {
         Notification.requestPermission();
      }
      dispatch({ type: 'UPDATE_SETTINGS', payload: { dailyReminders: !settings.dailyReminders } });
   };

   const exportData = () => {
      const data = JSON.stringify(state, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forge-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
   };

   const importData = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
         try {
            const data = JSON.parse(event.target.result);
            const ok = await confirm({
               title: 'Import Data?',
               message: 'This will replace all your current data with the imported file. This action cannot be undone.',
               confirmText: 'Import',
               variant: 'warning',
            });
            if (ok) dispatch({ type: 'IMPORT_DATA', payload: data });
         } catch {
            await confirm({
               title: 'Invalid File',
               message: 'The selected file is not a valid FORGE backup.',
               confirmText: 'OK',
               cancelText: '',
               variant: 'info',
            });
         }
      };
      reader.readAsText(file);
   };

   const resetAll = async () => {
      const ok = await confirm({
         title: 'Delete All Data?',
         message: 'This will permanently erase all your habits, completions, journal entries, and progress. This cannot be undone!',
         confirmText: 'Delete Everything',
         variant: 'danger',
      });
      if (!ok) return;
      const really = await confirm({
         title: 'Final Confirmation',
         message: 'Are you absolutely sure? All your progress will be lost forever.',
         confirmText: 'Yes, Delete',
         variant: 'danger',
      });
      if (really) {
         dispatch({ type: 'RESET_ALL' });
         localStorage.clear();
         window.location.reload();
      }
   };

   const handleSignOut = async () => {
      const ok = await confirm({
         title: 'Sign Out?',
         message: 'Your data is saved in the cloud. You can sign back in anytime.',
         confirmText: 'Sign Out',
         variant: 'warning',
      });
      if (ok) await signOut();
   };

   const { addToast } = useToast();

   const shareStats = () => {
      const text = `🔥 I'm a Level ${rank.level} ${rank.name} on FORGE!\n\n` +
         `⚔️ Current Streak: ${currentStreak} Days\n` +
         `⭐ Perfect Days: ${perfectDays}\n` +
         `🏆 Total XP: ${user.xp.toLocaleString()}\n\n` +
         `Join me in building iron discipline!`;

      navigator.clipboard.writeText(text);
      addToast({
         title: 'Copied to Clipboard!',
         message: 'Share your stats with your accountability partner.',
         icon: '📋',
      });
   };

   const copyUpi = () => {
      navigator.clipboard.writeText('dimond@ybl'); // Replace with actual UPI ID
      addToast({
         title: 'UPI ID Copied',
         message: 'Thanks for the support! 💖',
         icon: '🎉',
      });
   };

   return (
      <div className="profile-page animate-fade-in">
         <div className="page-header">
            <h1>👤 Profile</h1>
            <p>Your rank, badges, and settings.</p>
         </div>

         {/* User Info */}
         <div className="profile-hero glass-card">
            <div className="profile-avatar-wrap">
               {authUser?.photoURL ? (
                  <img src={authUser.photoURL} alt="avatar" className="profile-avatar-img" referrerPolicy="no-referrer" />
               ) : (
                  <div className="profile-avatar" style={{ background: rank.color }}>
                     {rank.icon}
                  </div>
               )}
            </div>
            <div className="profile-info">
               <h2 className="profile-name">
                  {authUser?.displayName || user.name || 'Forger'}
               </h2>
               {authUser?.email && (
                  <p className="profile-email">{authUser.email}</p>
               )}
               <div className="profile-rank-label" style={{ color: rank.color }}>
                  {rank.icon} {rank.name} <span className="rank-level">Lv.{rank.level}</span>
               </div>
               <button className="btn btn-secondary" style={{ marginTop: '12px' }} onClick={shareStats}>
                  <Share2 size={16} /> Share Stats
               </button>
            </div>
         </div>

         {/* Rank Progress */}
         <div className="rank-progress-card glass-card">
            <h3>Rank Evolution</h3>
            <div className="rank-timeline">
               {RANKS.map((r, i) => (
                  <div
                     key={r.level}
                     className={`rank-node ${r.level <= rank.level ? 'unlocked' : 'locked'} ${r.level === rank.level ? 'current' : ''}`}
                  >
                     <span className="rank-node-icon">{r.icon}</span>
                     <span className="rank-node-name">{r.name}</span>
                     <span className="rank-node-xp">{r.minXP} XP</span>
                  </div>
               ))}
            </div>
            {nextRank && (
               <div className="next-rank-progress">
                  <div className="progress-bar">
                     <div className="progress-bar-fill" style={{ width: `${xpProgress.percentage}%` }}></div>
                  </div>
                  <span className="xp-text">
                     {xpProgress.current} / {xpProgress.needed} XP to {nextRank.name}
                  </span>
               </div>
            )}
         </div>

         {/* Stats */}
         <div className="stats-grid">
            <div className="stat-card">
               <span className="stat-label">Total Days</span>
               <span className="stat-value">{Object.keys(completions).length}</span>
            </div>
            <div className="stat-card">
               <span className="stat-label">Completions</span>
               <span className="stat-value">{totalCompletions}</span>
            </div>
            <div className="stat-card">
               <span className="stat-label">Perfect Days</span>
               <span className="stat-value">{perfectDays}</span>
            </div>
            <div className="stat-card">
               <span className="stat-label">Forge Modes</span>
               <span className="stat-value">{user.forgeModesCompleted}</span>
            </div>
         </div>

         {/* Badges */}
         <div className="badges-section glass-card">
            <h3>🏅 Badges</h3>
            <div className="badges-grid">
               {earnedBadges.map(b => (
                  <div key={b.id} className="badge-card earned">
                     <span className="badge-card-icon">{b.icon}</span>
                     <span className="badge-card-name">{b.name}</span>
                     <span className="badge-card-desc">{b.description}</span>
                  </div>
               ))}
               {lockedBadges.map(b => (
                  <div key={b.id} className="badge-card locked">
                     <span className="badge-card-icon">🔒</span>
                     <span className="badge-card-name">{b.name}</span>
                     <span className="badge-card-desc">{b.description}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Settings */}
         <div className="settings-section glass-card">
            <h3>⚙️ Settings</h3>

            <div className="setting-row">
               <div className="setting-info">
                  <FileText size={18} />
                  <span>Terms of Service</span>
               </div>
               <button className="btn btn-ghost" onClick={() => window.open('/terms', '_blank')}>View</button>
            </div>

            <div className="setting-row">
               <div className="setting-info">
                  <Shield size={18} />
                  <span>Privacy Policy</span>
               </div>
               <button className="btn btn-ghost" onClick={() => window.open('/privacy', '_blank')}>View</button>
            </div>

            <div className="setting-row">
               <div className="setting-info">
                  {isDark ? <Moon size={18} /> : <Sun size={18} />}
                  <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
               </div>
               <label className="toggle">
                  <input type="checkbox" checked={isDark} onChange={toggleTheme} />
                  <span className="toggle-slider"></span>
               </label>
            </div>

            <div className="setting-row">
               <div className="setting-info">
                  <Shield size={18} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span>Ghost Mode (Private)</span>
                     <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hide name/avatar from Global Leaderboard</span>
                  </div>
               </div>
               <label className="toggle">
                  <input type="checkbox" checked={!settings.isPublic} onChange={togglePrivacy} />
                  <span className="toggle-slider"></span>
               </label>
            </div>

            <div className="setting-row">
               <div className="setting-info">
                  <Lock size={18} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span>Strict Tracking</span>
                     <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prevent retroactive habit logging for past days</span>
                  </div>
               </div>
               <label className="toggle">
                  <input type="checkbox" checked={settings.strictTracking} onChange={toggleStrict} />
                  <span className="toggle-slider"></span>
               </label>
            </div>

            <div className="setting-row">
               <div className="setting-info">
                  <Bell size={18} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span>Daily Reminders</span>
                     <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get a browser notification at 8 PM if you haven't logged</span>
                  </div>
               </div>
               <label className="toggle">
                  <input type="checkbox" checked={settings.dailyReminders} onChange={toggleReminders} />
                  <span className="toggle-slider"></span>
               </label>
            </div>

            <div className="setting-row">
               <div className="setting-info">
                  <Download size={18} />
                  <span>Export Data</span>
               </div>
               <button className="btn btn-secondary btn-sm" onClick={exportData}>Export</button>
            </div>

            <div className="setting-row">
               <div className="setting-info">
                  <Upload size={18} />
                  <span>Import Data</span>
               </div>
               <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>Import</button>
               <input ref={fileInputRef} type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
            </div>

            <div className="setting-row">
               <div className="setting-info">
                  <LogOut size={18} />
                  <span>Sign Out</span>
               </div>
               <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>Sign Out</button>
            </div>

            <div className="setting-row danger">
               <div className="setting-info">
                  <Trash2 size={18} />
                  <span>Reset All Data</span>
               </div>
               <button className="btn btn-danger btn-sm" onClick={resetAll}>Reset</button>
            </div>
         </div>

         {/* Support Section */}
         <div className="settings-section glass-card" style={{ marginTop: '24px' }}>
            <h3><Heart size={18} className="heart-icon" style={{ fill: 'currentColor' }} /> Support the Developer</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
               Building FORGE takes time and coffee. If this app helped you build better habits, consider supporting the journey! 🚀
            </p>

            <div className="setting-row">
               <div className="setting-info">
                  <span className="upi-icon" style={{ fontWeight: 800, color: '#10b981', width: '18px', textAlign: 'center' }}>₹</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span>Donate via UPI</span>
                     <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>dimond@ybl</span>
                  </div>
               </div>
               <button className="btn btn-secondary btn-sm" onClick={copyUpi}>
                  <Copy size={14} /> Copy ID
               </button>
            </div>

            <a href="mailto:hereisjayesh@gmail.com?subject=FORGE%20App%20Feedback" className="setting-row" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex' }}>
               <div className="setting-info">
                  <Mail size={18} style={{ color: '#8b5cf6' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span style={{ color: 'var(--text-primary)' }}>Feedback & Ideas</span>
                     <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Send a direct email</span>
                  </div>
               </div>
            </a>
         </div>
      </div>
   );
}
