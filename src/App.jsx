import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { ConfirmProvider } from './components/ConfirmDialog';
import { ToastProvider } from './components/AchievementToast';
import Layout from './components/Layout';
import WelcomeTour from './components/WelcomeTour';
import NotificationService from './components/NotificationService';
import AuditService from './components/AuditService';
import TaskSyncService from './components/TaskSyncService';
import ExcuseModal from './components/ExcuseModal';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import ForgeMode from './pages/GhostMode';
import Analytics from './pages/Analytics';
import Journal from './pages/Journal';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function AppRoutes() {
  const { state } = useApp();

  if (!state.settings.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <Layout>
      <NotificationService />
      <AuditService />
      <TaskSyncService />
      <ExcuseModal />
      <WelcomeTour />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/forge-mode" element={<ForgeMode />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-icon">🔨</div>
        <p>Loading FORGE...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppProvider firebaseUser={user}>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
