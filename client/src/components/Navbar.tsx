import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, LogOut, User as UserIcon, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from './Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Predict', path: '/predict' },
    { label: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <nav className="bg-white border-b border-earth-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                <Sprout size={20} className="text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold text-earth-800 tracking-tight">HarvestPredict</span>
                <span className="text-[10px] text-earth-500 font-medium tracking-wider uppercase">AI Yield Platform</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-earth-600 hover:text-earth-800 hover:bg-earth-50'
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-earth-200 hover:border-earth-300 hover:bg-earth-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-earth-700 max-w-[120px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown size={16} className={`text-earth-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-earth-100 py-2 z-20 animate-in">
                      <div className="px-4 py-3 border-b border-earth-100 mb-1">
                        <p className="text-sm font-semibold text-earth-800 truncate">{user?.name}</p>
                        <p className="text-xs text-earth-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-earth-700 hover:bg-earth-50"
                      >
                        <UserIcon size={16} />
                        Dashboard
                      </Link>
                      <Link
                        to="/predictions"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-earth-700 hover:bg-earth-50"
                      >
                        <UserIcon size={16} />
                        Prediction History
                      </Link>
                      <div className="border-t border-earth-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-earth-600 hover:bg-earth-100"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-earth-100 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-2.5 rounded-lg text-sm font-medium
                  ${location.pathname === link.path
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-earth-600 hover:bg-earth-50'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-earth-100 flex flex-col gap-2 px-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-earth-800">{user?.name}</p>
                      <p className="text-xs text-earth-500">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<LogOut size={16} />}
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" fullWidth>Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" fullWidth>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
