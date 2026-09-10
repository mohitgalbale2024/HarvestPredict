import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  History,
  CalendarDays,
  BarChart2,
  Lightbulb,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const sidebarLinks = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & insights',
    },
    {
      label: 'Predict Yield',
      path: '/predict',
      icon: Sprout,
      description: 'Forecast crop yields',
    },
    {
      label: 'Harvest Forecast',
      path: '/harvest-forecast',
      icon: CalendarDays,
      description: 'Production timeline',
    },
    {
      label: 'Prediction History',
      path: '/predictions',
      icon: History,
      description: 'Past predictions',
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: BarChart2,
      description: 'Deep dive analytics',
    },
    {
      label: 'Insights',
      path: '/insights',
      icon: Lightbulb,
      description: 'Recommendations',
    },
  ];

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-earth-100 flex-shrink-0">
      <div className="h-full overflow-y-auto py-6 px-4">
        <div className="mb-2 px-2">
          <h4 className="text-xs font-semibold text-earth-400 uppercase tracking-wider mb-3">
            Main
          </h4>
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`
                    group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-earth-600 hover:bg-earth-50 hover:text-earth-800'
                    }
                  `}
                >
                  <div
                    className={`
                      mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all
                      ${isActive
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-earth-100 text-earth-500 group-hover:bg-earth-200 group-hover:text-earth-700'
                      }
                    `}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isActive ? 'text-primary-700' : ''}`}>
                      {link.label}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-primary-600/70' : 'text-earth-400'}`}>
                      {link.description}
                    </p>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center text-white mb-3">
            <Sprout size={18} />
          </div>
          <h4 className="text-sm font-bold text-primary-800 mb-1">Pro Tips</h4>
          <p className="text-xs text-primary-700/80 leading-relaxed mb-3">
            Combine historical data with real-time weather for 95%+ prediction accuracy.
          </p>
          <button className="text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline">
            Learn best practices →
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
