import React from 'react';
import { Shield } from 'lucide-react';
import './Legal.css';

export default function Privacy() {
   return (
      <div className="legal-page animate-fade-in">
         <div className="legal-container glass-card">
            <div className="legal-header">
               <Shield size={48} className="legal-icon" />
               <h1>Privacy Policy</h1>
               <p className="legal-date">Last Updated: February 2026</p>
            </div>

            <div className="legal-content">
               <h2>1. Data We Collect</h2>
               <p>FORGE stores your habit configurations, completion logs, and daily journal entries securely in a Firebase Firestore database linked to your authentication. Your data is private by default.</p>

               <h2>2. Google Tasks API Usage</h2>
               <p>FORGE requests access to the Google Tasks API (`https://www.googleapis.com/auth/tasks`) strictly to enable a two-way synchronization of your scheduled habits. We do NOT read your personal non-FORGE tasks, and we do NOT share, sell, or distribute your task data to any third parties. The Tasks connection is used exclusively to dispatch reminders and track habit completions on your behalf.</p>

               <h2>3. Data Storage</h2>
               <p>Your authentication tokens are stored locally on your device (`localStorage`). We do not transmit your Google OAuth tokens to any external servers other than directly to Google's API.</p>

               <h2>4. Contact</h2>
               <p>If you have any questions regarding your data privacy, please contact the developer of this application.</p>
            </div>
         </div>
      </div>
   );
}
