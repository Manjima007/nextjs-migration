'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

// Import map component dynamically to avoid SSR issues
const IssueLocationMap = dynamic(
  () => import('@/components/ui/issue-location-map'),
  { ssr: false }
);
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/ui/stats-card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
}

const statusColors = {
  pending: 'text-yellow-400',
  assigned: 'text-blue-400',
  in_progress: 'text-purple-400',
  resolved: 'text-green-400',
  closed: 'text-gray-400',
  rejected: 'text-red-400',
};

const priorityColors = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    inProgressIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
  const response = await apiClient.issues.getAll({ limit: 1000, reportedBy: user?.id });
      setIssues(response.issues || []);
      
      // Calculate stats
      const totalIssues = response.pagination?.total || 0;
      const pendingIssues = response.issues?.filter((issue: Issue) => issue.status === 'pending').length || 0;
      const resolvedIssues = response.issues?.filter((issue: Issue) => issue.status === 'resolved').length || 0;
      const inProgressIssues = response.issues?.filter((issue: Issue) => issue.status === 'in_progress').length || 0;
      
      setStats({
        totalIssues,
        pendingIssues,
        resolvedIssues,
        inProgressIssues,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Force dynamic rendering for the page to avoid hydration issues
  const dynamic = 'force-dynamic';

  return (
    <DashboardLayout
      title="Citizen Dashboard"
      description={`Welcome back, ${user?.name}! Track your reported issues and community activity.`}
    >
      <div className="space-y-8 lg:space-y-10">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-900/20 to-primary-800/20 rounded-2xl p-8 lg:p-10 border border-primary-500/20"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 font-heading">
                Report a New Issue
              </h2>
              <p className="text-gray-400 text-base lg:text-lg font-body">
                Help improve your community by reporting civic issues
              </p>
            </div>
            <Link href="/dashboard/citizen/report">
              <Button className="btn-primary group">
                <Plus className="w-5 h-5 mr-3" />
                Report Issue
                <TrendingUp className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8"
        >
          <motion.div variants={fadeInUp}>
            <StatsCard
              number={stats.totalIssues.toString()}
              label="Total Issues Reported"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StatsCard
              number={stats.pendingIssues.toString()}
              label="Pending Review"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StatsCard
              number={stats.inProgressIssues.toString()}
              label="In Progress"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StatsCard
              number={stats.resolvedIssues.toString()}
              label="Resolved"
            />
          </motion.div>
        </motion.div>

        {/* Recent Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800 rounded-2xl p-8 lg:p-10 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-white font-heading">Recent Issues</h2>
            <Link href="/dashboard/citizen/issues">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : issues.length > 0 ? (
            <div className="space-y-6">
              {issues.map((issue) => (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 lg:p-8 bg-gray-800/50 rounded-xl border border-gray-600/30 hover:border-primary-500/50 transition-colors cursor-pointer"
                >
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-3 font-heading text-lg">
                          {issue.title}
                        </h3>
                        <p className="text-base text-gray-400 mb-4 font-body line-clamp-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {issue.location?.address || 'No location specified'}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-3">
                        <span className={`px-3 py-2 rounded-full text-sm font-medium capitalize bg-gray-700 ${statusColors[issue.status]}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className={`text-sm font-medium capitalize ${priorityColors[issue.priority]}`}>
                          {issue.priority}
                        </span>
                      </div>
                    </div>
                    {issue.location && (
                      <div className="mt-4">
                        <IssueLocationMap location={issue.location} title={issue.title} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-6" />
              <p className="text-gray-400 font-body text-lg mb-6">No issues reported yet</p>
              <Link href="/dashboard/citizen/report">
                <Button className="mt-4">
                  Report Your First Issue
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Community Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-800 rounded-2xl p-8 lg:p-10 border border-gray-700/50"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-8 font-heading">Community Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary-400 mb-3 font-heading">2.5K+</div>
              <div className="text-base text-gray-400 font-body">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-3 font-heading">48hrs</div>
              <div className="text-base text-gray-400 font-body">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-3 font-heading">95%</div>
              <div className="text-base text-gray-400 font-body">Satisfaction Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}