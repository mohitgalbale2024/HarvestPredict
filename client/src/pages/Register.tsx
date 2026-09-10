import React, { useState, type FormEvent, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Sprout, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword, validateName, validateConfirmPassword } from '@/utils/validators';
import type { RegisterFormInput } from '@/types';

const Register: React.FC = () => {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterFormInput>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = <K extends keyof RegisterFormInput>(field: K, value: RegisterFormInput[K]) => {
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
    const newErrors: Partial<RegisterFormInput> = {};
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitError(null);
    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
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
              Create your account
            </h1>
            <p className="text-earth-500">
              Start predicting crop yields in seconds with our AI-powered platform.
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
                label="Full Name"
                type="text"
                name="name"
                placeholder="John Farmer"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                leftIcon={<UserIcon size={16} />}
                error={errors.name as string | undefined}
                autoComplete="name"
              />
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
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                leftIcon={<Lock size={16} />}
                error={errors.password as string | undefined}
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                leftIcon={<Lock size={16} />}
                error={errors.confirmPassword as string | undefined}
                autoComplete="new-password"
              />

            <div className="mt-5 p-4 rounded-xl bg-green-50 border border-green-100">
              <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Free forever plan includes:
              </p>
              <ul className="text-xs text-green-700 space-y-1.5 ml-6">
                <li>• Up to 20 yield predictions per month</li>
                <li>• 50+ crop types supported</li>
                <li>• Feature importance analysis</li>
                <li>• Prediction history tracking</li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
              className="mt-6"
            >
              Create Account
            </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-earth-100 text-center">
              <p className="text-sm text-earth-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </Card>
      </div>
    </div>
  );
};

export default Register;
