import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame } from 'lucide-react';
import './Login.css';

export default function Login() {
   const { signInWithGoogle } = useAuth();
   const [agreed, setAgreed] = useState(false);

   return (
      <div className="login-container">
         <div className="login-bg-effects">
            <div className="bg-orb bg-orb-1"></div>
            <div className="bg-orb bg-orb-2"></div>
            <div className="bg-orb bg-orb-3"></div>
         </div>

         <div className="login-card glass-card animate-scale-in">
            <div className="login-logo">
               <div className="login-logo-icon">🔨</div>
               <h1 className="login-title">FORGE</h1>
               <p className="login-tagline">Forge Yourself Into Steel</p>
            </div>

            <div className="login-features">
               <div className="login-feature">
                  <Flame size={16} />
                  <span>Build Unbreakable Habits</span>
               </div>
               <div className="login-feature">
                  <Flame size={16} />
                  <span>Track Streaks & Rank Up</span>
               </div>
               <div className="login-feature">
                  <Flame size={16} />
                  <span>Enter Forge Mode</span>
               </div>
            </div>

            <div className="login-legal-check">
               <label className="checkbox-label">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">I have read and agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></span>
               </label>
            </div>

            <button
               className={`login-google-btn ${!agreed ? 'disabled' : ''}`}
               onClick={agreed ? signInWithGoogle : undefined}
               disabled={!agreed}
            >
               <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
               </svg>
               <span>Sign in with Google</span>
            </button>

            <p className="login-disclaimer">
               Your data syncs across devices. 100% free, no subscriptions.
            </p>
         </div>
      </div>
   );
}
