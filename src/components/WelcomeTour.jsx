import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Trophy, ChartBar, Target, ArrowRight, X } from 'lucide-react';
import './WelcomeTour.css';

const TOUR_STEPS = [
   {
      icon: <Flame size={48} className="tour-icon fire" />,
      title: 'Forge Your Discipline',
      description: 'Welcome to FORGE. This is more than a tracker—it is a progression system for your life. Complete daily tasks to build streaks and earn XP.',
   },
   {
      icon: <Target size={48} className="tour-icon accent" />,
      title: 'Progressive Habits',
      description: 'Track checkboxes, sets & reps, durations, or quantities. FORGE automatically scales your targets using Progressive Overload.',
   },
   {
      icon: <Trophy size={48} className="tour-icon rank" />,
      title: 'Rank Up',
      description: 'Never break the chain. Earning XP ranks you up from Apprentice to legendary Master Forger. Earn badges for hitting epic milestones.',
   },
   {
      icon: <ChartBar size={48} className="tour-icon chart" />,
      title: 'Hard Data',
      description: 'Check your Analytics page for your 365-day contribution heatmap, weekly hit rates, and journal mood correlations.',
   },
];

export default function WelcomeTour() {
   const { state, dispatch } = useApp();
   const [step, setStep] = useState(0);

   // Only show if onboarding is complete but tour isn't
   if (!state.settings.onboardingComplete || state.settings.tourComplete) return null;

   const activeStep = TOUR_STEPS[step];

   const handleNext = () => {
      if (step < TOUR_STEPS.length - 1) {
         setStep(step + 1);
      } else {
         dispatch({ type: 'UPDATE_SETTINGS', payload: { tourComplete: true } });
      }
   };

   const handleSkip = () => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { tourComplete: true } });
   };

   return (
      <div className="tour-overlay animate-fade-in">
         <div className="tour-modal">
            <button className="tour-skip" onClick={handleSkip} title="Skip Tour">
               <X size={20} />
            </button>
            <div className="tour-content" key={step}>
               <div className="tour-icon-wrap animate-pop">
                  {activeStep.icon}
               </div>
               <h2 className="animate-slide-up">{activeStep.title}</h2>
               <p className="animate-slide-up delay-1">{activeStep.description}</p>
            </div>

            <div className="tour-footer">
               <div className="tour-dots">
                  {TOUR_STEPS.map((_, i) => (
                     <span key={i} className={`tour-dot ${i === step ? 'active' : ''}`} />
                  ))}
               </div>
               <button className="btn btn-primary btn-lg tour-next-btn" onClick={handleNext}>
                  {step < TOUR_STEPS.length - 1 ? (
                     <>Next <ArrowRight size={18} /></>
                  ) : (
                     'Enter the Forge'
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}
