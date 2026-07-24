import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, 'Input is required'),
        output: z.string().min(1, 'Output is required'),
        explanation: z.string().min(1, 'Explanation is required'),
      })
    )
    .min(1, 'At least one visible test case required'),
  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, 'Input is required'),
        output: z.string().min(1, 'Output is required'),
      })
    )
    .min(1, 'At least one hidden test case required'),
  startCode: z
    .array(
      z.object({
        language: z.enum(['C++', 'Java', 'JavaScript']),
        initialCode: z.string().min(1, 'Initial code is required'),
      })
    )
    .length(3, 'All three languages required'),
  referenceSolution: z
    .array(
      z.object({
        language: z.enum(['C++', 'Java', 'JavaScript']),
        completeCode: z.string().min(1, 'Complete code is required'),
      })
    )
    .length(3, 'All three languages required'),
});

function CreateProblem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('zo-theme') || 'light');
  const dark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('zo-theme', theme);
  }, [theme]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'easy',
      tags: 'array',
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' },
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' },
      ],
    },
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({ control, name: 'visibleTestCases' });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({ control, name: 'hiddenTestCases' });

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await axiosClient.post('/problem/create', data);
      navigate('/admin');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- theme tokens (matches Homepage / AdminPanel) ----
  const bg = dark ? 'bg-[#0a0e1a]' : 'bg-[#f7f8fb]';
  const surface = dark ? 'bg-[#111827]' : 'bg-white';
  const surfaceAlt = dark ? 'bg-[#0f1420]' : 'bg-[#f1f4f9]';
  const border = dark ? 'border-[#1f2937]' : 'border-slate-200';
  const textPrimary = dark ? 'text-slate-100' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-500' : 'text-slate-400';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const accent = '#3b82f6';

  const inputClass = `w-full rounded-lg border ${border} ${surfaceAlt} ${textPrimary} px-3 py-2 text-sm placeholder:${textMuted} focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition`;
  const labelClass = `block text-sm font-medium mb-1.5 ${textSub}`;
  const errorClass = 'text-xs text-rose-500 mt-1';
  const sectionClass = `rounded-2xl border ${border} ${surface} p-5 sm:p-6`;

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
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
                <button className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border ${border} ${surfaceAlt} hover:brightness-95 transition`}>
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={`text-sm font-medium ${textSub}`}>{user?.firstName || 'Admin'}</span>
                </button>
                <ul className={`absolute right-0 mt-2 w-40 py-1 rounded-xl shadow-lg border ${border} ${surface} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all`}>
                  <li>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm ${textSub} hover:text-blue-500 rounded-lg transition-colors`}
                    >
                      Logout
                    </button>
                  </li>
                  {user?.role === 'admin' && (
                    <li>
                      <NavLink to="/admin" className={`block px-4 py-2 text-sm ${textSub} hover:text-blue-500 rounded-lg transition-colors`}>
                        Admin Panel
                      </NavLink>
                    </li>
                  )}
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
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-blue-500 mb-2 tracking-wide">// admin / create</p>
                <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${textPrimary}`}>
                  Create a new problem
                </h1>
                <p className={`mt-2 ${textSub}`}>Fill in the details, test cases, and code templates below.</p>
              </div>
              <NavLink
                to="/admin"
                className={`hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border ${border} ${surfaceAlt} ${textSub} hover:text-blue-500 transition-colors shrink-0`}
              >
                ← Back to Admin
              </NavLink>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="container mx-auto px-4 sm:px-6 pb-16">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-4xl mx-auto">
            {/* Basic Information */}
            <div className={sectionClass}>
              <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input {...register('title')} className={inputClass} placeholder="e.g. Two Sum" />
                  {errors.title && <p className={errorClass}>{errors.title.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea {...register('description')} rows={5} className={inputClass} placeholder="Problem statement..." />
                  {errors.description && <p className={errorClass}>{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Difficulty</label>
                    <select {...register('difficulty')} className={inputClass}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Tag</label>
                    <select {...register('tags')} className={inputClass}>
                      <option value="array">Array</option>
                      <option value="linkedList">Linked List</option>
                      <option value="graph">Tree</option>
                      <option value="graph">Greedy</option>
                      <option value="dp">DP</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Visible Test Cases */}
            <div className={sectionClass}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${textPrimary}`}>Visible Test Cases</h2>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  + Add Case
                </button>
              </div>

              <div className="space-y-3">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className={`rounded-xl border ${border} ${surfaceAlt} p-4 space-y-2 relative`}>
                    {visibleFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="absolute top-3 right-3 text-xs font-medium text-rose-500 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    )}
                    <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className={inputClass} />
                    {errors.visibleTestCases?.[index]?.input && (
                      <p className={errorClass}>{errors.visibleTestCases[index].input.message}</p>
                    )}
                    <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className={inputClass} />
                    {errors.visibleTestCases?.[index]?.output && (
                      <p className={errorClass}>{errors.visibleTestCases[index].output.message}</p>
                    )}
                    <textarea
                      {...register(`visibleTestCases.${index}.explanation`)}
                      placeholder="Explanation"
                      rows={2}
                      className={inputClass}
                    />
                    {errors.visibleTestCases?.[index]?.explanation && (
                      <p className={errorClass}>{errors.visibleTestCases[index].explanation.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Test Cases */}
            <div className={sectionClass}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${textPrimary}`}>Hidden Test Cases</h2>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  + Add Case
                </button>
              </div>

              <div className="space-y-3">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className={`rounded-xl border ${border} ${surfaceAlt} p-4 space-y-2 relative`}>
                    {hiddenFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="absolute top-3 right-3 text-xs font-medium text-rose-500 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    )}
                    <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className={inputClass} />
                    {errors.hiddenTestCases?.[index]?.input && (
                      <p className={errorClass}>{errors.hiddenTestCases[index].input.message}</p>
                    )}
                    <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className={inputClass} />
                    {errors.hiddenTestCases?.[index]?.output && (
                      <p className={errorClass}>{errors.hiddenTestCases[index].output.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Code Templates */}
            <div className={sectionClass}>
              <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Code Templates</h2>
              <div className="space-y-6">
                {[0, 1, 2].map((index) => {
                  const lang = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
                  return (
                    <div key={index} className={`rounded-xl border ${border} ${surfaceAlt} p-4 space-y-3`}>
                      <span
                        className="inline-flex text-xs font-mono font-semibold px-2.5 py-1 rounded-md"
                        style={{ color: accent, backgroundColor: `${accent}1a` }}
                      >
                        {lang}
                      </span>

                      <div>
                        <label className={labelClass}>Initial Code</label>
                        <textarea
                          {...register(`startCode.${index}.initialCode`)}
                          rows={6}
                          className={`${inputClass} font-mono`}
                          spellCheck={false}
                        />
                        {errors.startCode?.[index]?.initialCode && (
                          <p className={errorClass}>{errors.startCode[index].initialCode.message}</p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>Reference Solution</label>
                        <textarea
                          {...register(`referenceSolution.${index}.completeCode`)}
                          rows={6}
                          className={`${inputClass} font-mono`}
                          spellCheck={false}
                        />
                        {errors.referenceSolution?.[index]?.completeCode && (
                          <p className={errorClass}>{errors.referenceSolution[index].completeCode.message}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-500 text-white font-semibold py-3 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Problem'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProblem;