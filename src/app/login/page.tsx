"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginForm = z.infer<typeof loginSchema>;

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { login, user, loading, mounted } = useAuth();
  const router = useRouter();

  // Redirect if already logged in, but with a delay to avoid flashing
  useEffect(() => {
    if (mounted && user && !loading) {
      // Add a small delay to ensure the page has rendered
      const redirectTimer = setTimeout(() => {
        setShouldRedirect(true);
        // Redirect based on role
        switch (user.role) {
          case 'citizen':
            router.push('/dashboard/citizen');
            break;
          case 'field_worker':
            router.push('/dashboard/field-worker');
            break;
          case 'department_admin':
            router.push('/dashboard/department-admin');
            break;
          case 'regional_admin':
            router.push('/dashboard/regional-admin');
            break;
          case 'city_admin':
            router.push('/dashboard/city-admin');
            break;
          default:
            router.push('/dashboard/citizen');
        }
      }, 100);

      return () => clearTimeout(redirectTimer);
    }
  }, [user, loading, mounted, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const demoAccounts = [
    { role: "Citizen", email: "citizen1@email.com", password: "demo123", color: "from-blue-500 to-blue-600" },
    { role: "Field Worker", email: "worker1@contractor.com", password: "demo123", color: "from-orange-500 to-orange-600" },
    { role: "Department Admin", email: "sanitation.head@city.gov", password: "demo123", color: "from-purple-500 to-purple-600" },
    { role: "Regional Admin", email: "ward1.admin@city.gov", password: "demo123", color: "from-indigo-500 to-indigo-600" },
    { role: "Super Admin", email: "admin@city.gov", password: "demo123", color: "from-red-500 to-red-600" }
  ];

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success("Welcome back!");
        // Router redirect will be handled by useEffect above
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleDemoLogin = async (email: string, password: string, role: string) => {
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success(`Logged in as ${role}`);
        // Router redirect will be handled by useEffect above
      } else {
        toast.error(result.error || "Demo login failed");
      }
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error("Demo login failed");
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 hero-bg">
      <div className="max-w-lg w-full space-y-8 lg:space-y-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Link href="/" className="inline-flex items-center space-x-3 mb-8 lg:mb-12 group">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center glow-green-intense group-hover:scale-110 transition-transform">
              <MapPin className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <span className="text-2xl lg:text-3xl font-heading font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              CivicLink
            </span>
          </Link>
          
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-4">Welcome Back</h2>
          <p className="text-base lg:text-lg text-gray-400 font-body">Sign in to manage civic issues efficiently</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="glass-light rounded-2xl p-8 lg:p-10 shadow-2xl border border-gray-700/50"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-8">
            <div>
              <Input
                {...register("email")}
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                leftIcon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                error={errors.password?.message}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-gray-900"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>

              <Link href="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth className="group">
              Sign In
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-transparent text-gray-400">Or try demo accounts</span>
              </div>
            </div>
          </div>

          {/* Demo Accounts */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mt-6 space-y-3"
          >
            {demoAccounts.map((account, index) => (
              <motion.button
                key={account.email}
                variants={fadeInUp}
                onClick={() => handleDemoLogin(account.email, account.password, account.role)}
                disabled={loading}
                className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-gray-800/60 to-gray-700/40 border border-gray-600/50 hover:border-primary-500/50 transition-all duration-200 disabled:opacity-50 card-hover group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${account.color} rounded-lg flex items-center justify-center`}>
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-heading font-semibold text-white group-hover:text-primary-300 transition-colors">
                        {account.role}
                      </span>
                      <p className="text-sm text-gray-400 font-body">{account.email}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 font-body">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-heading font-semibold text-primary-400 hover:text-primary-300 transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-900/20 border border-primary-500/30 text-primary-300 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Trusted by 500+ Cities • 98% User Satisfaction
          </div>
        </motion.div>
      </div>
    </div>
  );
}