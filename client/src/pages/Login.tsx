import React, { useState, type FormEvent, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Sprout, Mail, Lock, ArrowRight } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword } from '@/utils/validators';
import type { LoginFormInput } from '@/types';

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginFormInput>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = <K extends keyof LoginFormInput>(field: K, value: LoginFormInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submitError) setSubmitError(null);
  };

  const validateForm = () => {
    const newErrors: Partial<LoginFormInput> = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitError(null);
    try {
      await login(formData);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setSubmitError(err.message || 'Invalid email or password. Please try again.');
    }
  };

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                <Sprout size={24} className="text-white" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-earth-800 tracking-tight block">HarvestPredict</span>
                <span className="text-[10px] text-earth-500 font-medium tracking-wider uppercase">AI Yield Platform</span>
              </div>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold text-earth-800 mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-earth-500">
              Sign in to your account to continue predicting harvests.
            </p>
          </div>

          <Card padding="lg">
            {submitError && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="farmer@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                leftIcon={<Mail size={16} />}
                error={errors.email as string | undefined}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                leftIcon={<Lock size={16} />}
                error={errors.password as string | undefined}
                autoComplete="current-password"
              />
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-earth-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-earth-600">Remember me</span>
                </label>
                <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
                  Forgot password?
                </button>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                rightIcon={<ArrowRight size={18} />}
                className="mt-2"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-earth-100">
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-earth-100" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-earth-400">Or</span>
                </div>
              </div>
              <button
                type="button"
                onClick={guestLogin}
                className="w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-earth-300 text-earth-600 text-sm font-medium hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
              >
                🚀 Continue as Guest (Demo Mode)
              </button>
              <p className="mt-3 text-center text-xs text-earth-500">
                No account yet?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </Card>
      </div>
    </div>
  );
};

export default Login;
