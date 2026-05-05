// Root app component — sets up routing, error capture, and shared layout
import { useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/routes.js';
import { ErrorLogProvider, useErrorLog } from './context/ErrorLogContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import MobileNav from './components/layout/MobileNav.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RoutinePage from './pages/RoutinePage.jsx';
import StudyPage from './pages/StudyPage.jsx';
import SleepPage from './pages/SleepPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import ErrorLogPage from './pages/ErrorLogPage.jsx';

// Inner component so ErrorBoundary can access the context
const AppRoutes = () => {
  const { addError } = useErrorLog();
  const handleBoundaryError = useCallback((error, info) => {
    addError('ErrorBoundary', error, { componentStack: info?.componentStack });
  }, [addError]);

  return (
    <ErrorBoundary onError={handleBoundaryError}>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <MobileNav />
        <Routes>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.ROUTINE} element={<RoutinePage />} />
          <Route path={ROUTES.STUDY} element={<StudyPage />} />
          <Route path={ROUTES.SLEEP} element={<SleepPage />} />
          <Route path={ROUTES.PROGRESS} element={<ProgressPage />} />
          <Route path="/errors" element={<ErrorLogPage />} />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

const App = () => (
  <BrowserRouter>
    <ErrorLogProvider>
      <AppRoutes />
    </ErrorLogProvider>
  </BrowserRouter>
);

export default App;
