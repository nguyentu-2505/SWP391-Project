import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/rounds" element={<RoundsPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/prizes" element={<PrizesPage />} />
            <Route path="/scores" element={<ScoresPage />} />
            <Route path="/tracks" element={<TracksPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;