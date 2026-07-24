import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });
  const [theme, setTheme] = useState(
    () => localStorage.getItem('zo-theme') || 'light'
  );

  const dark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('zo-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const difficultyMatch =
        filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
      const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
      const statusMatch =
        filters.status === 'all' ||
        solvedProblems.some((sp) => sp._id === problem._id);
      return difficultyMatch && tagMatch && statusMatch;
    });
  }, [problems, filters, solvedProblems]);

  const solvedCount = solvedProblems.length;
  const totalCount = problems.length;
  const pct = totalCount ? Math.round((solvedCount / totalCount) * 100) : 0;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Still up late';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Still up late';
  }, []);

  const difficultyBreakdown = useMemo(() => {
    const counts = { easy: 0, medium: 0, hard: 0 };
    solvedProblems.forEach((sp) => {
      const full = problems.find((p) => p._id === sp._id);
      const level = full?.difficulty?.toLowerCase();
      if (level && counts[level] !== undefined) counts[level] += 1;
    });
    return counts;
  }, [solvedProblems, problems]);

  // ---- theme tokens ----
  const bg = dark ? 'bg-[#0a0e1a]' : 'bg-[#f7f8fb]';
  const surface = dark ? 'bg-[#111827]' : 'bg-white';
  const surfaceAlt = dark ? 'bg-[#0f1420]' : 'bg-[#f1f4f9]';
  const border = dark ? 'border-[#1f2937]' : 'border-slate-200';
  const textPrimary = dark ? 'text-slate-100' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-500' : 'text-slate-400';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const accent = '#3b82f6';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${accent} 70%, transparent)`,
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))',
              WebkitMask:
                'radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

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
                    {user?.firstName || 'Guest'}
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
            {/* ambient glow */}
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: accent }}
            />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <p className="font-mono text-xs text-blue-500 mb-2 tracking-wide">
                </p>
                <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${textPrimary}`}>
                  {user ? (
                    <>
                      {greeting},{' '}
                      <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                        {user.firstName}
                      </span>
                      .
                    </>
                  ) : (
                    'Sharpen your skills.'
                  )}
                </h1>
                <p className={`mt-2 ${textSub}`}>
                  {user
                    ? solvedCount === 0
                      ? "You haven't solved anything yet — let's fix that."
                      : `You're ${pct}% of the way through the problem set.`
                    : 'Pick a problem below and keep the streak alive.'}
                </p>
              </div>

              {user && (
                <div className="flex items-center gap-6 sm:gap-8">
                  {/* difficulty breakdown */}
                  <div className="hidden sm:flex flex-col gap-2">
                    {[
                      ['Easy', difficultyBreakdown.easy, '#10b981'],
                      ['Medium', difficultyBreakdown.medium, '#f59e0b'],
                      ['Hard', difficultyBreakdown.hard, '#f43f5e'],
                    ].map(([label, count, color]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className={`text-xs font-mono w-14 ${textMuted}`}>{label}</span>
                        <div className={`w-20 h-1.5 rounded-full overflow-hidden ${surfaceAlt}`}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${solvedCount ? (count / Math.max(solvedCount, 1)) * 100 : 0}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span className={`text-xs font-mono font-semibold ${textPrimary}`}>{count}</span>
                      </div>
                    ))}
                  </div>

                  {/* progress ring */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="relative w-16 h-16">
                      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke={dark ? '#1f2937' : '#e2e8f0'} strokeWidth="4" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke={accent}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${textPrimary}`}>
                        {pct}%
                      </span>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold leading-none ${textPrimary}`}>
                        {solvedCount}
                        <span className={`font-medium ${textMuted}`}>/{totalCount}</span>
                      </p>
                      <p className={`text-xs mt-1 ${textMuted}`}>solved so far</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 pb-16">
          {/* Filters */}
          <div className={`flex flex-wrap gap-2 mb-6 rounded-2xl border ${border} ${surface} p-2`}>
            <FilterDropdown
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
              tokens={{ border, surface, surfaceAlt, textPrimary, textSub, textMuted }}
            />
            <FilterDropdown
              options={DIFFICULTY_OPTIONS}
              value={filters.difficulty}
              onChange={(v) => setFilters({ ...filters, difficulty: v })}
              tokens={{ border, surface, surfaceAlt, textPrimary, textSub, textMuted }}
            />
            <FilterDropdown
              options={TAG_OPTIONS}
              value={filters.tag}
              onChange={(v) => setFilters({ ...filters, tag: v })}
              tokens={{ border, surface, surfaceAlt, textPrimary, textSub, textMuted }}
            />
          </div>

          {/* Problems List */}
          {filteredProblems.length === 0 ? (
            <div className={`text-center py-20 rounded-2xl border border-dashed ${border}`}>
              <p className={`font-medium ${textMuted}`}>No problems match these filters.</p>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {filteredProblems.map((problem, i) => {
                const isSolved = solvedProblems.some((sp) => sp._id === problem._id);
                const diffColor = getDifficultyColor(problem.difficulty);
                return (
                  <div
                    key={problem._id}
                    className={`group relative flex items-center gap-4 rounded-2xl border ${border} ${surface} pl-1 pr-4 sm:pr-5 py-3.5 hover:border-blue-400/60 hover:shadow-md transition-all overflow-hidden`}
                  >
                    <span
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: diffColor }}
                    />
                    <span className={`font-mono text-xs w-8 text-right shrink-0 ${textMuted}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div
                      className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center p-2 ${
                        isSolved ? 'bg-emerald-500/10 text-emerald-500' : `${surfaceAlt} ${textMuted}`
                      }`}
                    >
                      {isSolved ? (
                        CheckCircleIcon
                      ) : (
                        <svg viewBox="0 0 16 16" className="w-full h-full" fill="currentColor">
                          <path d="M5 3l7 5-7 5V3z" />
                        </svg>
                      )}
                    </div>

                    <NavLink
                      to={`/problem/${problem._id}`}
                      className={`flex-1 min-w-0 font-semibold truncate ${textPrimary} group-hover:text-blue-500 transition-colors`}
                    >
                      {problem.title}
                    </NavLink>

                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-md shrink-0"
                      style={{ color: diffColor, backgroundColor: `${diffColor}1a` }}
                    >
                      <span className="w-2.5 h-2.5">{DotIcon}</span>
                      {problem.difficulty}
                    </span>
                    <TagBadge tag={problem.tags} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TAG_META = {
  array: {
    label: 'Array',
    color: '#3b82f6',
    icon: (
      <>
        <rect x="1" y="4" width="3" height="8" rx="0.5" />
        <rect x="5.5" y="2" width="3" height="12" rx="0.5" />
        <rect x="10" y="6" width="3" height="6" rx="0.5" />
      </>
    ),
  },
  linkedList: {
    label: 'Linked List',
    color: '#8b5cf6',
    icon: (
      <>
        <circle cx="3" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="13" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.4" />
      </>
    ),
  },
  tree: {
    label: 'Tree',
    color: '#ec4899',
    icon: (
      <>
        <circle cx="8" cy="2.5" r="1.7" />
        <circle cx="3" cy="9" r="1.7" />
        <circle cx="8" cy="9" r="1.7" />
        <circle cx="13" cy="9" r="1.7" />
        <circle cx="3" cy="14.5" r="1.4" />
        <circle cx="8" cy="14.5" r="1.4" opacity="0.5" />
        <line x1="8" y1="4" x2="3" y2="7.5" stroke="currentColor" strokeWidth="1.1" />
        <line x1="8" y1="4" x2="8" y2="7.3" stroke="currentColor" strokeWidth="1.1" />
        <line x1="8" y1="4" x2="13" y2="7.5" stroke="currentColor" strokeWidth="1.1" />
        <line x1="3" y1="10.6" x2="3" y2="13" stroke="currentColor" strokeWidth="1.1" />
        <line x1="3" y1="10.6" x2="8" y2="13.2" stroke="currentColor" strokeWidth="1.1" opacity="0.5" />
      </>
    ),
  },
  dp: {
    label: 'DP',
    color: '#f97316',
    icon: (
      <>
        <rect x="1" y="11" width="3.2" height="4" rx="0.5" />
        <rect x="4.9" y="8" width="3.2" height="7" rx="0.5" />
        <rect x="8.8" y="5" width="3.2" height="10" rx="0.5" />
        <rect x="12.7" y="1.5" width="3.2" height="13.5" rx="0.5" />
      </>
    ),
  },
  greedy: {
    label: 'Greedy',
    color: '#eab308',
    icon: (
      <>
        <rect x="1" y="10" width="3" height="5" rx="0.5" opacity="0.4" />
        <rect x="5" y="6.5" width="3" height="8.5" rx="0.5" opacity="0.4" />
        <rect x="9" y="3" width="3" height="12" rx="0.5" />
        <path d="M9.5 1.5l1.2 1.6h-2.4z" />
      </>
    ),
  },
};

const getTagMeta = (tag) =>
  TAG_META[tag] || { label: tag || 'General', color: '#64748b', icon: <circle cx="8" cy="8" r="3" /> };

const TagBadge = ({ tag }) => {
  const meta = getTagMeta(tag);
  return (
    <span
      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md shrink-0"
      style={{ color: meta.color, backgroundColor: `${meta.color}14` }}
    >
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        {meta.icon}
      </svg>
      {meta.label}
    </span>
  );
};

// ---- small icon primitives for filter menus ----
const DotIcon = (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="5" />
  </svg>
);

const CheckCircleIcon = (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
    <path d="M5 8.2l1.8 1.8L11.2 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ListIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <line x1="2" y1="4" x2="14" y2="4" />
    <line x1="2" y1="8" x2="14" y2="8" />
    <line x1="2" y1="12" x2="10" y2="12" />
  </svg>
);

const GridIcon = (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="6" rx="1" />
    <rect x="9" y="1" width="6" height="6" rx="1" />
    <rect x="1" y="9" width="6" height="6" rx="1" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

const TriDotIcon = (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="4" cy="8" r="2.4" fill="#10b981" />
    <circle cx="8" cy="8" r="2.4" fill="#f59e0b" />
    <circle cx="12" cy="8" r="2.4" fill="#f43f5e" />
  </svg>
);

const ChevronIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6l4 4 4-4" />
  </svg>
);

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Problems', color: '#64748b', icon: ListIcon },
  { value: 'solved', label: 'Solved', color: '#10b981', icon: CheckCircleIcon },
];

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'All Difficulties', color: '#64748b', icon: TriDotIcon },
  { value: 'easy', label: 'Easy', color: '#10b981', icon: DotIcon },
  { value: 'medium', label: 'Medium', color: '#f59e0b', icon: DotIcon },
  { value: 'hard', label: 'Hard', color: '#f43f5e', icon: DotIcon },
];

const TAG_OPTIONS = [
  { value: 'all', label: 'All Tags', color: '#64748b', icon: GridIcon },
  ...Object.entries(TAG_META).map(([value, meta]) => ({
    value,
    label: meta.label,
    color: meta.color,
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor">
        {meta.icon}
      </svg>
    ),
  })),
];

// ---- custom dropdown with per-option icons (native <option> can't render icons) ----
const FilterDropdown = ({ options, value, onChange, tokens }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { border, surface, surfaceAlt, textPrimary, textSub, textMuted } = tokens;
  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-xl border ${border} ${surfaceAlt} px-3 py-2 text-sm font-medium ${textSub} hover:brightness-95 transition`}
      >
        <span className="w-4 h-4 shrink-0" style={{ color: selected.color }}>
          {selected.icon}
        </span>
        {selected.label}
        <span className={`w-3.5 h-3.5 ${textMuted} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          {ChevronIcon}
        </span>
      </button>

      {open && (
        <ul
          className={`absolute z-30 mt-2 min-w-[190px] rounded-xl border ${border} ${surface} shadow-lg py-1`}
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition ${
                  opt.value === value ? `font-semibold ${textPrimary}` : textSub
                } hover:bg-blue-500/10 hover:text-blue-500`}
              >
                <span className="w-4 h-4 shrink-0" style={{ color: opt.color }}>
                  {opt.icon}
                </span>
                <span className="flex-1">{opt.label}</span>
                {opt.value === value && <span className="w-3.5 h-3.5 text-blue-500">{CheckCircleIcon}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return '#10b981';
    case 'medium':
      return '#f59e0b';
    case 'hard':
      return '#f43f5e';
    default:
      return '#64748b';
  }
};

export default Homepage;