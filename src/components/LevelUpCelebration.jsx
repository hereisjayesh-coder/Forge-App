import { useEffect, useState, useRef } from 'react';
import './LevelUpCelebration.css';

export default function LevelUpCelebration({ oldRank, newRank, onComplete }) {
   const [phase, setPhase] = useState('enter'); // enter → show → exit
   const canvasRef = useRef(null);

   useEffect(() => {
      // Phase transitions
      const t1 = setTimeout(() => setPhase('show'), 300);
      const t2 = setTimeout(() => setPhase('exit'), 4500);
      const t3 = setTimeout(() => onComplete?.(), 5200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
   }, [onComplete]);

   // Particle confetti
   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = [];
      const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#22c55e', '#f97316', '#ec4899'];

      for (let i = 0; i < 120; i++) {
         particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 100,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.8) * 14 - 4,
            size: Math.random() * 8 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10,
            gravity: 0.15,
            opacity: 1,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
         });
      }

      let frame;
      const animate = () => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         let alive = false;
         for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotSpeed;
            p.opacity -= 0.005;
            if (p.opacity <= 0) continue;
            alive = true;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
               ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            } else {
               ctx.beginPath();
               ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
               ctx.fill();
            }
            ctx.restore();
         }
         if (alive) frame = requestAnimationFrame(animate);
      };

      // Delay particle start
      const startTimeout = setTimeout(() => {
         frame = requestAnimationFrame(animate);
      }, 400);

      return () => {
         clearTimeout(startTimeout);
         cancelAnimationFrame(frame);
      };
   }, []);

   return (
      <div className={`levelup-overlay levelup-${phase}`}>
         <canvas ref={canvasRef} className="levelup-canvas" />
         <div className="levelup-content">
            <div className="levelup-label">RANK UP!</div>
            <div className="levelup-ranks">
               <div className="levelup-old-rank">
                  <span className="levelup-rank-icon">{oldRank.icon}</span>
                  <span className="levelup-rank-name">{oldRank.name}</span>
               </div>
               <div className="levelup-arrow">→</div>
               <div className="levelup-new-rank">
                  <span className="levelup-rank-icon glow">{newRank.icon}</span>
                  <span className="levelup-rank-name">{newRank.name}</span>
               </div>
            </div>
            <div className="levelup-subtitle">Keep forging your legend</div>
         </div>
      </div>
   );
}
