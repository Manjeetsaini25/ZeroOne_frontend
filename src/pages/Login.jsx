import { useState,useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import {loginUser} from "../authSlice"

const loginSchema = z.object({
  emailId: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated,} = useSelector((state) => state.auth);

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-200 via-base-100 to-base-200 relative overflow-hidden">
      {/* Ambient background accents */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />

      <div className="card w-full max-w-sm bg-base-100/80 backdrop-blur-xl shadow-2xl border border-base-content/5 relative">
        <div className="card-body p-8">
          {/* Brand */}
          <div className="flex flex-col items-center gap-1 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">ZeroOne</h2>
            <p className="text-sm text-base-content/50">Welcome back, sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
            {/* Email */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="john@example.com"
                  className={`input input-bordered w-full pl-10 transition-colors ${
                    errors.emailId ? 'input-error' : 'focus:border-primary'
                  }`}
                  {...register('emailId')}
                />
              </div>
              {errors.emailId && (
                <span className="flex items-center gap-1 text-error text-xs mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <div className="flex items-center justify-between pb-1">
                <label className="label p-0">
                  <span className="label-text font-medium">Password</span>
                </label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input input-bordered w-full pl-10 pr-10 transition-colors ${
                    errors.password ? 'input-error' : 'focus:border-primary'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="flex items-center gap-1 text-error text-xs mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full mt-2 group"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/50 mt-6">
            New to ZeroOne?{' '}
            <a href="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;