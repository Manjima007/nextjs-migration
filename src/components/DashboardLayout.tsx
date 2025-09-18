'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Home,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  BarChart3,
  Users,
  Wrench,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const roleIcons = {
  citizen: User,
  field_worker: Wrench,
  department_admin: Shield,
  regional_admin: BarChart3,
  city_admin: Users,
};

const roleColors = {
  citizen: 'from-blue-500 to-blue-600',
  field_worker: 'from-orange-500 to-orange-600',
  department_admin: 'from-purple-500 to-purple-600',
  regional_admin: 'from-indigo-500 to-indigo-600',
  city_admin: 'from-red-500 to-red-600',
};

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'citizen': return 'citizen';
      case 'field_worker': return 'field-worker';
      case 'department_admin': return 'department-admin';
      case 'regional_admin': return 'regional-admin';
      case 'city_admin': return 'city-admin';
      default: return 'citizen';
    }
  };

  const getNavigationItems = () => {
    const dashboardPath = getDashboardPath(user.role);
    const baseItems = [
      { name: 'Dashboard', href: `/dashboard/${dashboardPath}`, icon: Home },
      { name: 'Issues', href: `/dashboard/${dashboardPath}/issues`, icon: FileText },
    ];

    // Role-specific navigation items
    switch (user.role) {
      case 'citizen':
        return [
          ...baseItems,
          { name: 'Report Issue', href: '/dashboard/citizen/report', icon: AlertCircle },
          { name: 'My Issues', href: '/dashboard/citizen/issues', icon: FileText },
        ];
      
      case 'field_worker':
        return [
          ...baseItems,
          { name: 'Assigned Issues', href: '/dashboard/worker/assigned', icon: FileText },
          { name: 'Work History', href: '/dashboard/worker/history', icon: BarChart3 },
        ];
      
      case 'department_admin':
        return [
          ...baseItems,
          { name: 'Team Management', href: '/dashboard/admin/team', icon: Users },
          { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
        ];
      
      case 'regional_admin':
        return [
          ...baseItems,
          { name: 'Ward Overview', href: '/dashboard/regional/overview', icon: BarChart3 },
          { name: 'Departments', href: '/dashboard/regional/departments', icon: Shield },
        ];
      
      case 'city_admin':
        return [
          ...baseItems,
          { name: 'City Overview', href: '/dashboard/city/overview', icon: BarChart3 },
          { name: 'All Departments', href: '/dashboard/city/departments', icon: Shield },
          { name: 'User Management', href: '/dashboard/city/users', icon: Users },
        ];
      
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();
  const RoleIcon = roleIcons[user.role];
  const roleColorClass = roleColors[user.role];

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                CivicLink
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${roleColorClass} rounded-xl flex items-center justify-center shadow-lg`}>
                <RoleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-white truncate font-heading mb-1">
                  {user.name}
                </p>
                <p className="text-sm text-gray-400 capitalize font-body">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-300 hover:bg-gray-700/60 hover:text-white transition-all duration-200 font-heading"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-4 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-700 space-y-2">
            <Link
              href="/dashboard/settings"
              className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-300 hover:bg-gray-700/60 hover:text-white transition-all duration-200 font-heading"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="mr-4 h-5 w-5 flex-shrink-0" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-300 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200 font-heading"
            >
              <LogOut className="mr-4 h-5 w-5 flex-shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-dark-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between lg:px-8">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white font-heading mb-1">{title}</h1>
              {description && (
                <p className="text-sm lg:text-base text-gray-400 font-body">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}