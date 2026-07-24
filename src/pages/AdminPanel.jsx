import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';

// Admin dashboard - entry point for problem management.
// Actual forms/logic live in separate components:
//   <CreateProblem />, <UpdateProblem />, <DeleteProblem />
// This page only routes to them; visual language mirrors Homepage.

function AdminPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [theme, setTheme] = useState(
    () => localStorage.getItem('zo-theme') || 'light'
  );

  const dark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('zo-theme', theme);
  }, [theme]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // ---- theme tokens (matches Homepage) ----
  const bg = dark ? 'bg-[#0a0e1a]' : 'bg-[#f7f8fb]';
  const surface = dark ? 'bg-[#111827]' : 'bg-white';
  const surfaceAlt = dark ? 'bg-[#0f1420]' : 'bg-[#f1f4f9]';
  const border = dark ? 'border-[#1f2937]' : 'border-slate-200';
  const textPrimary = dark ? 'text-slate-100' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-500' : 'text-slate-400';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const accent = '#3b82f6';

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      {/* faint dot-grid backdrop, code-editor feel */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(${dark ? '#1e293b' : '#e2e8f0'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative">
        {/* Navigation */}
        <nav className={`sticky top-0 z-20 backdrop-blur-md ${dark ? 'bg-[#0a0e1a]/80' : 'bg-white/80'} border-b ${border}`}>
          <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center overflow-hidden font-mono text-white text-[13px] font-bold leading-none tracking-tighter shadow-lg shadow-blue-500/20">
                <span className="transition-transform duration-300 ease-out group-hover:-translate-x-[3px]">0</span>
                <span className="transition-transform duration-300 ease-out group-hover:translate-x-[3px]">1</span>
              </div>
              <span className={`text-lg font-bold tracking-tight ${textPrimary}`}>
                Zero<span className="text-blue-500">One</span>
              </span>
            </NavLink>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(dark ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className={`relative w-14 h-8 rounded-full border ${border} ${surfaceAlt} transition-colors`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 ${
                    dark ? 'translate-x-6 bg-slate-800' : 'translate-x-0 bg-white shadow'
                  }`}
                >
                  {dark ? (
                    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-blue-400" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-amber-500" fill="currentColor">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-9.9a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 9a1 1 0 100 2h1a1 1 0 100-2h-1zM4.464 4.05a1 1 0 010 1.414l-.707.707A1 1 0 012.343 4.75l.707-.707a1 1 0 011.414 0zM3 9a1 1 0 100 2H2a1 1 0 100-2h1zm2.05 8.536a1 1 0 001.414 0l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 000 1.414zM10 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
                    </svg>
                  )}
                </span>
              </button>

              <div className="relative group">
                <button
                  className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border ${border} ${surfaceAlt} hover:brightness-95 transition`}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={`text-sm font-medium ${textSub}`}>
                    {user?.firstName || 'Admin'}
                  </span>
                </button>
                <ul
                  className={`absolute right-0 mt-2 w-40 py-1 rounded-xl shadow-lg border ${border} ${surface} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all`}
                >
                  <li>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm ${textSub} hover:text-blue-500 rounded-lg transition-colors`}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div className="container mx-auto px-4 sm:px-6 pt-10 pb-6">
          <div className={`relative overflow-hidden rounded-3xl border ${border} ${surface} px-6 sm:px-8 py-7`}>
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: accent }}
            />
            <div className="relative">
              <p className="font-mono text-xs text-blue-500 mb-2 tracking-wide"></p>
              <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${textPrimary}`}>
                Problem management
              </h1>
              <p className={`mt-2 ${textSub}`}>
                Create, update, or remove problems from the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Admin actions */}
        <div className="container mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ADMIN_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.route)}
                className={`group relative text-left rounded-2xl border ${border} ${surface} p-5 overflow-hidden hover:border-blue-400/60 hover:shadow-md transition-all`}
              >
                <span
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: action.color }}
                />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ color: action.color, backgroundColor: `${action.color}1a` }}
                >
                  <svg viewBox="0 0 16 16" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    {action.icon}
                  </svg>
                </div>
                <h2 className={`font-semibold text-lg ${textPrimary} group-hover:text-blue-500 transition-colors`}>
                  {action.title}
                </h2>
                <p className={`text-sm mt-1 ${textSub}`}>{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ADMIN_ACTIONS = [
  {
    id: 'create',
    title: 'Create Problem',
    description: 'Add a new problem with test cases and templates',
    route: '/admin/create',
    color: '#10b981',
    icon: <path d="M8 3v10M3 8h10" />,
  },
  {
    id: 'update',
    title: 'Update Problem',
    description: 'Edit an existing problem\u2019s details',
    route: '/admin/update',
    color: '#3b82f6',
    icon: <path d="M11.5 2.5l2 2L5 13H3v-2l8.5-8.5z" />,
  },
  {
    id: 'delete',
    title: 'Delete Problem',
    description: 'Permanently remove a problem',
    route: '/admin/delete',
    color: '#f43f5e',
    icon: <path d="M3 4h10M6 4V2.5h4V4M4 4l.5 9.5A1 1 0 005.5 14.5h5a1 1 0 001-1L12 4" />,
  },
];

export default AdminPanel;