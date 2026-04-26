import React from 'react';
import { FileText } from 'lucide-react';
import './Legal.css';

export default function Terms() {
   return (
      <div className="legal-page animate-fade-in">
         <div className="legal-container glass-card">
            <div className="legal-header">
               <FileText size={48} className="legal-icon" />
               <h1>Terms of Service</h1>
               <p className="legal-date">Last Updated: February 2026</p>
            </div>

            <div className="legal-content">
               <h2>1. Acceptance of Terms</h2>
               <p>By logging into and using the FORGE application, you accept these Terms of Service. If you do not agree with them, please do not use the application.</p>

               <h2>2. Service Description</h2>
               <p>FORGE is a productivity and extreme habit-tracking application designed to enforce discipline through strict scheduling, negative XP penalties, and Google Tasks integration.</p>

               <h2>3. Google Tasks Integration</h2>
               <p>To use the full features of FORGE, you must connect your Google Account and grant permission to manage your Google Tasks. You are solely responsible for the actions taken by FORGE within your Tasks account, which include creating task lists, generating tasks, and marking them as complete.</p>

               <h2>4. Disclaimer of Warranty</h2>
               <p>FORGE is provided "as is" without any warranties. We are not responsible for missed deadlines, forgotten tasks, or any direct/indirect consequences of using our notification sync engine.</p>
            </div>
         </div>
      </div>
   );
}
