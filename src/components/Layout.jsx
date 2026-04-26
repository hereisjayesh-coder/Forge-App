import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Flame, BarChart3, BookOpen, User, Trophy } from 'lucide-react';

const navItems = [
   { path: '/', label: 'Dashboard', icon: LayoutDashboard },
   { path: '/habits', label: 'Habits', icon: ListChecks },
   { path: '/forge-mode', label: 'Forge Mode', icon: Flame },
   { path: '/analytics', label: 'Analytics', icon: BarChart3 },
   { path: '/leaderboard', label: 'Leaders', icon: Trophy },
   { path: '/journal', label: 'Journal', icon: BookOpen },
   { path: '/profile', label: 'Profile', icon: User },
];

export default function Layout({ children }) {
   return (
      <div className="app-layout">
         {/* Sidebar (Desktop) */}
         <aside className="sidebar">
            <div className="sidebar-logo">
               <div className="logo-icon">🔨</div>
               <h1>FORGE</h1>
            </div>
            <nav className="sidebar-nav">
               {navItems.map(item => (
                  <NavLink
                     key={item.path}
                     to={item.path}
                     className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                     end={item.path === '/'}
                  >
                     <item.icon size={20} className="nav-icon" />
                     {item.label}
                  </NavLink>
               ))}
            </nav>
         </aside>

         {/* Main Content */}
         <main className="main-content">
            {children}
         </main>

         {/* Bottom Bar (Mobile) */}
         <div className="bottom-bar">
            <nav className="bottom-bar-nav">
               {navItems.map(item => (
                  <NavLink
                     key={item.path}
                     to={item.path}
                     className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                     end={item.path === '/'}
                  >
                     <item.icon size={20} className="nav-icon" />
                     {item.label}
                  </NavLink>
               ))}
            </nav>
         </div>
      </div>
   );
}
