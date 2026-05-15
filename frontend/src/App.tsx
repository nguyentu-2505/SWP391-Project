import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import TeamsPage from './pages/TeamsPage';
import RoundsPage from './pages/RoundsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import UsersPage from './pages/UsersPage';
import PrizesPage from './pages/PrizesPage';
import ScoresPage from './pages/ScoresPage';
import TracksPage from './pages/TracksPage';
import RankingsPage from './pages/RankingsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import HackathonEventPage from './pages/HackathonEventPage';
import CriterionPage from './pages/CriterionPage';
import TeamMemberPage from './pages/TeamMemberPage';
import { Role } from './services/authUtils';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/rounds" element={<RoundsPage />} />
              <Route path="/submissions" element={<SubmissionsPage />} />
              <Route path="/prizes" element={<PrizesPage />} />
              <Route path="/scores" element={<ScoresPage />} />
              <Route path="/tracks" element={<TracksPage />} />
              <Route path="/rankings" element={<RankingsPage />} />
              <Route path="/hackathon-events" element={<HackathonEventPage />} />
              <Route path="/criterion" element={<CriterionPage />} />
              <Route path="/team-members" element={<TeamMemberPage />} />
              
              {/* Admin Only Routes */}
              <Route element={<PrivateRoute allowedRoles={[Role.ADMIN]} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;