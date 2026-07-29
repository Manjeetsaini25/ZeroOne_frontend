import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient'

// ---- shared icon primitives (same language as Homepage / ProblemPage / AdminDelete) ----
const DotIcon = (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="5" />
  </svg>
);

const CrossCircleIcon = (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
    <path d="M5.5 5.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 2.5a1.4 1.4 0 012 2L5 13l-3 .8L2.8 11l8.7-8.5z" />
    <path d="M9.8 4.2l2 2" />
  </svg>
);

const TAG_META = {
  array: { label: 'Array', color: '#3b82f6' },
  linkedList: { label: 'Linked List', color: '#8b5cf6' },
  tree: { label: 'Tree', color: '#ec4899' },
  dp: { label: 'DP', color: '#f97316' },
  greedy: { label: 'Greedy', color: '#eab308' },
};

const getTagMeta = (tag) => TAG_META[tag] || { label: tag || 'General', color: '#64748b' };

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'hard': return '#f43f5e';
    default: return '#64748b';
  }
};

const AdminUpdate = () => {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [theme] = useState(() => localStorage.getItem('zo-theme') || 'light');
  const dark = theme === 'dark';

  // ---- theme tokens (mirrors Homepage / ProblemPage / AdminDelete) ----
  const bg = dark ? 'bg-[#0a0e1a]' : 'bg-[#f7f8fb]';
  const surface = dark ? 'bg-[#111827]' : 'bg-white';
  const surfaceAlt = dark ? 'bg-[#0f1420]' : 'bg-[#f1f4f9]';
  const border = dark ? 'border-[#1f2937]' : 'border-slate-200';
  const textPrimary = dark ? 'text-slate-100' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-500' : 'text-slate-400';
  const accent = '#3b82f6';

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (id) => {
    navigate(`/admin/update/${id}`);
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${bg}`}>
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${accent} 70%, transparent)`,
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${textPrimary}`}>Update Problems</h1>
          <span className={`text-sm font-mono ${textMuted}`}>
            {problems.length} problem{problems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {error && (
          <div
            className="rounded-2xl border p-4 mb-6 flex items-center gap-3"
            style={{ borderColor: '#f43f5e55', backgroundColor: '#f43f5e0f' }}
          >
            <span className="w-5 h-5 text-rose-500 shrink-0">{CrossCircleIcon}</span>
            <span className={`text-sm font-medium ${textPrimary}`}>{error}</span>
          </div>
        )}

        {problems.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border border-dashed ${border}`}>
            <p className={`font-medium ${textMuted}`}>No problems to show.</p>
          </div>
        ) : (
          <div className={`rounded-2xl border ${border} ${surface} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${surfaceAlt} border-b ${border}`}>
                    <th className={`text-left font-semibold px-4 py-3 w-14 ${textMuted}`}>#</th>
                    <th className={`text-left font-semibold px-4 py-3 ${textMuted}`}>Title</th>
                    <th className={`text-left font-semibold px-4 py-3 w-36 ${textMuted}`}>Difficulty</th>
                    <th className={`text-left font-semibold px-4 py-3 w-40 ${textMuted}`}>Tags</th>
                    <th className={`text-left font-semibold px-4 py-3 w-28 ${textMuted}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem, index) => {
                    const diffColor = getDifficultyColor(problem.difficulty);
                    const tagMeta = getTagMeta(problem.tags);
                    return (
                      <tr
                        key={problem._id}
                        className={`border-b last:border-b-0 ${border} hover:${surfaceAlt} transition-colors`}
                      >
                        <td className={`px-4 py-3 font-mono ${textMuted}`}>{String(index + 1).padStart(2, '0')}</td>
                        <td className={`px-4 py-3 font-medium ${textPrimary}`}>{problem.title}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-md"
                            style={{ color: diffColor, backgroundColor: `${diffColor}1a` }}
                          >
                            <span className="w-2.5 h-2.5">{DotIcon}</span>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md"
                            style={{ color: tagMeta.color, backgroundColor: `${tagMeta.color}14` }}
                          >
                            {tagMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleUpdate(problem._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                            style={{ backgroundColor: accent, boxShadow: `0 1px 2px ${accent}4d` }}
                          >
                            <span className="w-3.5 h-3.5">{EditIcon}</span>
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUpdate;