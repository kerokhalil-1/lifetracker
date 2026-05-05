// Root app component — sets up routing and shared layout
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/routes.js';
import Sidebar from './components/layout/Sidebar.jsx';
import MobileNav from './components/layout/MobileNav.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RoutinePage from './pages/RoutinePage.jsx';
import StudyPage from './pages/StudyPage.jsx';
import SleepPage from './pages/SleepPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <MobileNav />
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.ROUTINE} element={<RoutinePage />} />
        <Route path={ROUTES.STUDY} element={<StudyPage />} />
        <Route path={ROUTES.SLEEP} element={<SleepPage />} />
        <Route path={ROUTES.PROGRESS} element={<ProgressPage />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App;
