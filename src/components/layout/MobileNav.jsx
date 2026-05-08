// Mobile bottom navigation bar — horizontally scrollable so all tabs always show
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sunrise, BookOpen, Moon, TrendingUp, Bug, Zap, GraduationCap } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { useErrorLog } from '../../context/ErrorLogContext.jsx';
import { usePerf } from '../../context/PerfContext.jsx';
import en from '../../locales/en.js';

const navItems = [
  { path: ROUTES.DASHBOARD,    label: en.nav.dashboard, Icon: LayoutDashboard },
  { path: ROUTES.ROUTINE,      label: en.nav.routine,   Icon: Sunrise },
  { path: ROUTES.STUDY,        label: en.nav.study,     Icon: BookOpen },
  { path: ROUTES.SLEEP,        label: en.nav.sleep,     Icon: Moon },
  { path: ROUTES.PROGRESS,     label: en.nav.progress,  Icon: TrendingUp },
  { path: ROUTES.ZOHO_ROADMAP, label: 'Zoho',           Icon: GraduationCap },
];

const MobileNav = () => {
  const { errors } = useErrorLog();
  const { entries } = usePerf();
  const slowOps = entries.filter((e) => e.type === 'firestore' && e.duration >= 1000).length;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200">
      <div className="flex overflow-x-auto scrollbar-none">

        {navItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === ROUTES.DASHBOARD}
            data-perf-label={`Nav: ${label}`}
            className={({ isActive }) =>
              `flex-shrink-0 flex flex-col items-center py-2.5 px-3.5 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-sky-600' : ''} />
                <span className="whitespace-nowrap">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Speed Monitor */}
        <NavLink
          to={ROUTES.PERF}
          data-perf-label="Nav: Speed Monitor"
          className={({ isActive }) =>
            `flex-shrink-0 flex flex-col items-center py-2.5 px-3.5 gap-0.5 text-xs font-medium transition-colors relative ${
              isActive ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <Zap size={20} className={isActive ? 'text-sky-500' : ''} />
                {slowOps > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {slowOps > 9 ? '9+' : slowOps}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap">Speed</span>
            </>
          )}
        </NavLink>

        {/* Error Log */}
        <NavLink
          to={ROUTES.ERRORS}
          data-perf-label="Nav: Error Log"
          className={({ isActive }) =>
            `flex-shrink-0 flex flex-col items-center py-2.5 px-3.5 gap-0.5 text-xs font-medium transition-colors relative ${
              isActive ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <Bug size={20} className={isActive ? 'text-red-500' : ''} />
                {errors.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {errors.length > 9 ? '9+' : errors.length}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap">Errors</span>
            </>
          )}
        </NavLink>

      </div>
    </nav>
  );
};

export default MobileNav;
