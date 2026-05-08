// Mobile bottom navigation bar — horizontally scrollable, swipe-safe
import { useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  { path: ROUTES.PERF,         label: 'Speed',          Icon: Zap,  special: 'perf'  },
  { path: ROUTES.ERRORS,       label: 'Errors',         Icon: Bug,  special: 'errors' },
];

const MobileNav = () => {
  const { errors } = useErrorLog();
  const { entries } = usePerf();
  const slowOps = entries.filter((e) => e.type === 'firestore' && e.duration >= 1000).length;
  const navigate = useNavigate();

  // ── Swipe-vs-tap detection ────────────────────────────────────────────────
  // Track horizontal finger movement; if > 6px we treat it as a scroll, not a tap.
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const didScroll   = useRef(false);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    didScroll.current   = false;
  };
  const onTouchMove = (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 6 || dy > 6) didScroll.current = true;
  };

  // Called by each nav item's touchEnd to navigate only on a real tap
  const handleTap = (e, path) => {
    e.preventDefault(); // prevent synthetic click from also firing
    if (!didScroll.current) navigate(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200">
      <div
        className="flex overflow-x-auto scrollbar-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        {navItems.map(({ path, label, Icon, special }) => {
          // Badge content for special items
          const badge =
            special === 'perf'   && slowOps > 0   ? (slowOps > 9 ? '9+' : String(slowOps))   :
            special === 'errors' && errors.length > 0 ? (errors.length > 9 ? '9+' : String(errors.length)) :
            null;

          const activeColor =
            special === 'errors' ? 'text-red-600'
            : special === 'perf' ? 'text-sky-600'
            : 'text-sky-600';

          const badgeBg = special === 'errors' ? 'bg-red-500' : 'bg-amber-500';

          return (
            <NavLink
              key={path}
              to={path}
              end={path === ROUTES.DASHBOARD}
              data-perf-label={`Nav: ${label}`}
              onTouchEnd={(e) => handleTap(e, path)}
              className={({ isActive }) =>
                `flex-shrink-0 flex flex-col items-center py-2.5 px-3.5 gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? activeColor : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon size={20} className={isActive ? activeColor : ''} />
                    {badge && (
                      <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 ${badgeBg} rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none`}>
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="whitespace-nowrap">{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
