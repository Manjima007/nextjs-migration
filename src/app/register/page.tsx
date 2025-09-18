'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Mail, Lock, Eye, EyeOff, User, Phone, MapIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['citizen', 'field_worker', 'department_admin', 'regional_admin', 'city_admin']),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  ward: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const roles = [
  { value: 'citizen', label: 'Citizen', description: 'Report and track civic issues' },
  { value: 'field_worker', label: 'Field Worker', description: 'Resolve assigned issues', requiresDepartment: true },
  { value: 'department_admin', label: 'Department Admin', description: 'Manage department operations', requiresDepartment: true },
  { value: 'regional_admin', label: 'Regional Admin', description: 'Oversee ward activities', requiresWard: true },
  { value: 'city_admin', label: 'City Administrator', description: 'Full system access' },
];

const departments = [
  'Public Works',
  'Sanitation',
  'Water Management', 
  'Transportation',
  'Environmental Services',
  'Public Safety',
  'Parks & Recreation',
];

const wards = [
  'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5',
  'Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10',
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: authRegister, user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const selectedRole = watch('role');
  const requiresDepartment = roles.find(r => r.value === selectedRole)?.requiresDepartment;
  const requiresWard = roles.find(r => r.value === selectedRole)?.requiresWard;

  const onSubmit = async (data: RegisterForm) => {
    try {
      const result = await authRegister(data);
      
      if (result.success) {
        toast.success('Registration successful! Welcome to CivicLink!');
        // Router redirect will be handled by useEffect above
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  if (user && !loading) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 hero-bg">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Link href="/" className="inline-flex items-center space-x-2 mb-6 sm:mb-8 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center glow-green-intense group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              CivicLink
            </span>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-400 font-body">
            Join CivicLink to help improve your community
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2 font-heading">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register('name')}
                  className="pl-10"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-400 font-body">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 font-heading">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400 font-body">{errors.email.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2 font-heading">
                Role *
              </label>
              <select
                id="role"
                {...register('role')}
                className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select your role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-2 text-sm text-red-400 font-body">{errors.role.message}</p>
              )}
            </div>

            {/* Department (conditional) */}
            {requiresDepartment && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2 font-heading">
                  Department *
                </label>
                <select
                  id="department"
                  {...register('department')}
                  className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-2 text-sm text-red-400 font-body">{errors.department.message}</p>
                )}
              </div>
            )}

            {/* Ward (conditional) */}
            {requiresWard && (
              <div>
                <label htmlFor="ward" className="block text-sm font-medium text-gray-300 mb-2 font-heading">
                  Ward *
                </label>
                <select
                  id="ward"
                  {...register('ward')}
                  className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select ward</option>
                  {wards.map((ward) => (
                    <option key={ward} value={ward}>
                      {ward}
                    </option>
                  ))}
                </select>
                {errors.ward && (
                  <p className="mt-2 text-sm text-red-400 font-body">{errors.ward.message}</p>
                )}
              </div>
            )}

            {/* Phone (optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2 font-heading">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  {...register('phone')}
                  className="pl-10"
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-400 font-body">{errors.phone.message}</p>
              )}
            </div>

            {/* Address (optional) */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2 font-heading">
                Address
              </label>
              <div className="relative">
                <MapIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your address"
                  {...register('address')}
                  className="pl-10"
                />
              </div>
              {errors.address && (
                <p className="mt-2 text-sm text-red-400 font-body">{errors.address.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2 font-heading">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  {...register('password')}
                  className="pl-10 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 font-body">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2 font-heading">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  className="pl-10 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400 font-body">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" loading={loading} fullWidth className="group">
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 font-body">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary-400 hover:text-primary-300 transition-colors font-heading"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}