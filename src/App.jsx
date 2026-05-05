// Root app component — routing, error capture, perf monitoring, lazy-loaded pages
import { useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/routes.js';
import { ErrorLogProvider, useErrorLog } from './context/ErrorLogContext.jsx';
import { PerfProvider } from './context/PerfContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Spinner from './components/ui/Spinner.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import MobileNav from './components/layout/MobileNav.jsx';

// Lazy-load every page so each route is its own JS chunk (faster initial load)
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const RoutinePage   = lazy(() => import('./pages/RoutinePage.jsx'));
const StudyPage     = lazy(() => import('./pages/StudyPage.jsx'));
const SleepPage     = lazy(() => import('./pages/SleepPage.jsx'));
const ProgressPage  = lazy(() => import('./pages/ProgressPage.jsx'));
const ErrorLogPage  = lazy(() => import('./pages/ErrorLogPage.jsx'));
const PerfPage      = lazy(() => import('./pages/PerfPage.jsx'));

const PageFallback = () => (
  <div className="lg:ml-56 min-h-screen flex items-center justify-center bg-slate-50" style={{ contain: 'layout' }}>
    <Spinner size="lg" />
  </div>
);

// Inner component so providers can access the router context
const AppRoutes = () => {
  const { addError } = useErrorLog();
  const handleBoundaryError = useCallback((error, info) => {
    addError('ErrorBoundary', error, { componentStack: info?.componentStack });
  }, [addError]);

  return (
    <PerfProvider>
      <ErrorBoundary onError={handleBoundaryError}>
        <div className="min-h-screen bg-slate-50">
          <Sidebar />
          <MobileNav />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.ROUTINE}   element={<RoutinePage />} />
              <Route path={ROUTES.STUDY}     element={<StudyPage />} />
              <Route path={ROUTES.SLEEP}     element={<SleepPage />} />
              <Route path={ROUTES.PROGRESS}  element={<ProgressPage />} />
              <Route path={ROUTES.ERRORS}    element={<ErrorLogPage />} />
              <Route path={ROUTES.PERF}      element={<PerfPage />} />
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </Suspense>
        </div>
      </ErrorBoundary>
    </PerfProvider>
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
