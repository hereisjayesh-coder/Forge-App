import { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

export default function Tooltip({ children, text, position = 'top' }) {
   const [show, setShow] = useState(false);
   const timeoutRef = useRef(null);

   const handleEnter = () => {
      timeoutRef.current = setTimeout(() => setShow(true), 400);
   };

   const handleLeave = () => {
      clearTimeout(timeoutRef.current);
      setShow(false);
   };

   useEffect(() => {
      return () => clearTimeout(timeoutRef.current);
   }, []);

   return (
      <div
         className="tooltip-wrapper"
         onMouseEnter={handleEnter}
         onMouseLeave={handleLeave}
      >
         {children}
         {show && (
            <div className={`tooltip-bubble tooltip-${position}`}>
               {text}
            </div>
         )}
      </div>
   );
}
