// Desktop sidebar navigation with page links and active state
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sunrise, BookOpen, Moon, TrendingUp, Bug, Zap, GraduationCap } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { useErrorLog } from '../../context/ErrorLogContext.jsx';
import { usePerf } from '../../context/PerfContext.jsx';
import en from '../../locales/en.js';

const mainNav = [
  { path: ROUTES.DASHBOARD,    label: en.nav.dashboard, Icon: LayoutDashboard },
  { path: ROUTES.ROUTINE,      label: en.nav.routine,   Icon: Sunrise },
  { path: ROUTES.STUDY,        label: en.nav.study,     Icon: BookOpen },
  { path: ROUTES.SLEEP,        label: en.nav.sleep,     Icon: Moon },
  { path: ROUTES.PROGRESS,     label: en.nav.progress,  Icon: TrendingUp },
  { path: ROUTES.ZOHO_ROADMAP, label: 'Zoho Roadmap',   Icon: GraduationCap },
];

const Sidebar = () => {
  const { errors } = useErrorLog();
  const { entries } = usePerf();
  const unread = errors.length;
  const slowOps = entries.filter((e) => e.type === 'firestore' && e.duration >= 1000).length;

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 py-8 px-4 fixed top-0 left-0">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-slate-800">LifeTracker</h1>
        <p className="text-xs text-slate-400 mt-0.5">Your daily compass</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {mainNav.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === ROUTES.DASHBOARD}
            data-perf-label={`Nav: ${label}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-sky-600' : 'text-slate-400'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Speed monitor link */}
      <NavLink
        to={ROUTES.PERF}
        data-perf-label="Nav: Speed Monitor"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-1 ${
            isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Zap size={18} className={isActive ? 'text-sky-500' : ''} />
            <span>Speed Monitor</span>
            {slowOps > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                {slowOps}
              </span>
            )}
          </>
        )}
      </NavLink>

      {/* Error log link always visible at the bottom */}
      <NavLink
        to={ROUTES.ERRORS}
        data-perf-label="Nav: Error Log"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2 ${
            isActive ? 'bg-red-50 text-red-700' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Bug size={18} className={isActive ? 'text-red-500' : ''} />
            <span>Error Log</span>
            {unread > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                {unread}
              </span>
            )}
          </>
        )}
      </NavLink>
    </aside>
  );
};

export default Sidebar;
