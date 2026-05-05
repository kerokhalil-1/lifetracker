// Mobile bottom navigation bar
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

const MobileNav = () => (
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex">
    {navItems.map(({ path, label, Icon }) => (
      <NavLink
        key={path}
        to={path}
        end={path === ROUTES.DASHBOARD}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
            isActive ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={20} className={isActive ? 'text-sky-600' : ''} />
            <span>{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export default MobileNav;
