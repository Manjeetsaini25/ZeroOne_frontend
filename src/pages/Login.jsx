import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from '../authSlice';

const loginSchema = z.object({
  emailId: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [theme, setTheme] = useState(
    () => localStorage.getItem('zo-theme') || 'light'
  );
  const dark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('zo-theme', theme);
  }, [theme]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), mode: 'onBlur' });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Replace with your real auth call
      await new Promise((resolve) => setTimeout(resolve, 900));
      dispatch(loginUser(data));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- theme tokens (matches Homepage / Signup) ----
  const bg = dark ? 'bg-[#0a0e1a]' : 'bg-[#f7f8fb]';
  const surface = dark ? 'bg-[#111827]' : 'bg-white';
  const surfaceAlt = dark ? 'bg-[#0f1420]' : 'bg-[#f1f4f9]';
  const border = dark ? 'border-[#1f2937]' : 'border-slate-200';
  const textPrimary = dark ? 'text-slate-100' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-500' : 'text-slate-400';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const accent = '#3b82f6';

  const inputClasses = (hasError) =>
    `w-full rounded-xl border ${
      hasError ? 'border-rose-400 focus:ring-rose-400' : `${border} focus:ring-blue-500`
    } ${surfaceAlt} ${textPrimary} pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition`;

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 ${bg} transition-colors duration-300`}>
      {/* faint dot-grid backdrop, matches Homepage/Signup */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(${dark ? '#1e293b' : '#e2e8f0'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* theme toggle, top-right */}
      <button
        onClick={() => setTheme(dark ? 'light' : 'dark')}
        aria-label="Toggle theme"
        className={`fixed top-5 right-5 z-20 relative w-14 h-8 rounded-full border ${border} ${surfaceAlt} transition-colors`}
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

      {/* Login card */}
      <div className={`relative w-full max-w-sm overflow-hidden rounded-3xl border ${border} ${surface} shadow-sm px-7 sm:px-8 py-8`}>
        <div
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: accent }}
        />

        <div className="relative flex flex-col items-center mb-7">
          <NavLink to="/" className="flex items-center gap-2.5 group mb-5">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center overflow-hidden font-mono text-white text-sm font-bold leading-none tracking-tighter shadow-lg shadow-blue-500/20">
              <span className="transition-transform duration-300 ease-out group-hover:-translate-x-[3px]">0</span>
              <span className="transition-transform duration-300 ease-out group-hover:translate-x-[3px]">1</span>
            </div>
            <span className={`text-xl font-bold tracking-tight ${textPrimary}`}>
              Zero<span className="text-blue-500">One</span>
            </span>
          </NavLink>
          <p className="font-mono text-xs text-blue-500 tracking-wide"></p>
          <h1 className={`mt-1 text-xl font-bold ${textPrimary}`}>Login</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-col gap-4" noValidate>
          {/* Email */}
          <div>
            <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                className={inputClasses(errors.emailId)}
                {...register('emailId')}
              />
            </div>
            {errors.emailId && (
              <span className="flex items-center gap-1 text-rose-500 text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.emailId.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                Password
              </label>
              <a href="#" className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`${inputClasses(errors.password)} pr-10`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${textMuted} hover:text-blue-500 transition-colors`}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="flex items-center gap-1 text-rose-500 text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-70 text-white text-sm font-semibold py-2.5 shadow-lg shadow-blue-500/20 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Log in
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <p className={`relative text-center text-sm mt-6 ${textSub}`}>
          New to ZeroOne?{' '}
          <NavLink to="/signup" className="font-semibold text-blue-500 hover:text-blue-600 transition-colors">
            Create an account
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;