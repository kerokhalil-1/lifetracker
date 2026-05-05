// Desktop sidebar navigation with page links and active state
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sunrise, BookOpen, Moon, TrendingUp } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import en from '../../locales/en.js';

const navItems = [
  { path: ROUTES.DASHBOARD, label: en.nav.dashboard, Icon: LayoutDashboard },
  { path: ROUTES.ROUTINE, label: en.nav.routine, Icon: Sunrise },
  { path: ROUTES.STUDY, label: en.nav.study, Icon: BookOpen },
  { path: ROUTES.SLEEP, label: en.nav.sleep, Icon: Moon },
  { path: ROUTES.PROGRESS, label: en.nav.progress, Icon: TrendingUp },
];

const Sidebar = () => (
  <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 py-8 px-4 fixed top-0 left-0">
    <div className="mb-8 px-2">
      <h1 className="text-xl font-bold text-slate-800">LifeTracker</h1>
      <p className="text-xs text-slate-400 mt-0.5">Your daily compass</p>
    </div>
    <nav className="flex flex-col gap-1">
      {navItems.map(({ path, label, Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === ROUTES.DASHBOARD}
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
  </aside>
);

export default Sidebar;
