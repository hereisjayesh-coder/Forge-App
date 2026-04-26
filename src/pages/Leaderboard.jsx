import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getRankForXP } from '../utils/rankSystem';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown, Flame, AlertCircle } from 'lucide-react';
import './Leaderboard.css';

export default function Leaderboard() {
   const { user: authUser } = useAuth();
   const { state } = useApp();
   const [leaders, setLeaders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      async function fetchLeaders() {
         try {
            const q = query(
               collection(db, 'users'),
               orderBy('user.xp', 'desc'),
               limit(20)
            );
            const querySnapshot = await getDocs(q);
            const loaded = [];
            querySnapshot.forEach((doc) => {
               const data = doc.data();
               if (data.user) {
                  // Pass settings along to check isPublic flag
                  loaded.push({ id: doc.id, ...data.user, settings: data.settings });
               }
            });
            setLeaders(loaded);
         } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
            setError('Could not load leaderboard data. You might be offline or Firestore rules are restricted.');
         } finally {
            setLoading(false);
         }
      }

      fetchLeaders();
   }, []);

   const getRankIcon = (index) => {
      if (index === 0) return <Crown className="rank-icon gold" size={24} />;
      if (index === 1) return <Medal className="rank-icon silver" size={24} />;
      if (index === 2) return <Medal className="rank-icon bronze" size={20} />;
      return <span className="rank-number">{index + 1}</span>;
   };

   return (
      <div className="leaderboard-page animate-fade-in">
         <div className="page-header">
            <h1>🏆 Global Leaderboard</h1>
            <p>The top 20 Forgers in the world.</p>
         </div>

         {error && (
            <div className="alert-box glass-card">
               <AlertCircle size={20} />
               <p>{error}</p>
            </div>
         )}

         <div className="leaderboard-container glass-card">
            {loading ? (
               <div className="table-loading">
                  <Flame className="spinner" size={32} />
                  <p>Forging Leaderboard...</p>
               </div>
            ) : leaders.length > 0 ? (
               <table className="leaderboard-table">
                  <thead>
                     <tr>
                        <th>Rank</th>
                        <th>Forger</th>
                        <th>Title</th>
                        <th className="text-right">Total XP</th>
                     </tr>
                  </thead>
                  <tbody>
                     {leaders.map((leader, index) => {
                        const rankInfo = getRankForXP(leader.xp);
                        const isMe = leader.id === authUser?.uid;

                        return (
                           <tr key={leader.id} className={isMe ? 'is-me' : ''}>
                              <td className="col-rank">
                                 {getRankIcon(index)}
                              </td>
                              <td className="col-name">
                                 <span className="name-text" title={leader.name}>
                                    {leader.settings?.isPublic === false ? '👻 Anonymous Forger' : (leader.name || 'Anonymous Forger')}
                                 </span>
                                 {isMe && <span className="me-badge">You</span>}
                              </td>
                              <td className="col-title">
                                 <span className="rank-emoji">{rankInfo.icon}</span> {rankInfo.name}
                              </td>
                              <td className="col-xp text-right">
                                 <span className="xp-value">{leader.xp.toLocaleString()}</span> XP
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            ) : (
               <div className="table-empty">
                  <p>No data available yet.</p>
               </div>
            )}
         </div>
      </div>
   );
}
