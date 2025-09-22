'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardStatsCard } from '@/components/ui/dashboard-stats-card';
import { 
  Users, 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle,
  UserPlus,
  FileText,
  BarChart3,
  Settings 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface DepartmentStats {
  totalWorkers: number;
  activeIssues: number;
  resolvedToday: number;
  averageResolutionTime: number;
}

interface Issue {
  _id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  assignedTo?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Worker {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  assignedIssues: number;
}

export default function DepartmentAdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DepartmentStats>({
    totalWorkers: 0,
    activeIssues: 0,
    resolvedToday: 0,
    averageResolutionTime: 0
  });
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [departmentWorkers, setDepartmentWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDepartmentData = useCallback(async () => {
    try {
      // Fetch department issues
      const issuesResponse = await fetch(`/api/issues?department=${user?.department}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('civiclink_token')}`
        }
      });
      
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json();
        const issues = issuesData.issues || [];
        setRecentIssues(issues.slice(0, 10));
        calculateStats(issues);
      }

      // Fetch department workers (mock for now)
      setDepartmentWorkers([
        { _id: '1', name: 'John Smith', email: 'john@contractor.com', isActive: true, assignedIssues: 5 },
        { _id: '2', name: 'Sarah Johnson', email: 'sarah@contractor.com', isActive: true, assignedIssues: 3 },
        { _id: '3', name: 'Mike Davis', email: 'mike@contractor.com', isActive: false, assignedIssues: 0 },
      ]);

    } catch (error) {
      console.error('Error fetching department data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.department]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'department_admin')) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchDepartmentData();
    }
  }, [user, loading, router]); // Removed fetchDepartmentData from dependencies

  const calculateStats = (issues: Issue[]) => {
    const today = new Date().toDateString();
    const activeIssues = issues.filter(issue => issue.status !== 'resolved').length;
    const resolvedToday = issues.filter(issue => 
      issue.status === 'resolved' && 
      new Date(issue.updatedAt).toDateString() === today
    ).length;

    setStats({
      totalWorkers: 8, // Mock data
      activeIssues,
      resolvedToday,
      averageResolutionTime: 2.4 // Mock: average days
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout title="Department Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Department Admin Dashboard"
      description="Manage your department's operations and team performance"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Department Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your department's operations and team performance
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className="text-sm text-gray-500">Department:</span>
            <span className="font-medium text-gray-900">{user?.department || 'Not assigned'}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatsCard
            title="Total Workers"
            value={stats.totalWorkers}
            icon={<Users className="h-6 w-6" />}
            color="blue"
          />
          <DashboardStatsCard
            title="Active Issues"
            value={stats.activeIssues}
            icon={<ClipboardList className="h-6 w-6" />}
            color="yellow"
          />
          <DashboardStatsCard
            title="Resolved Today"
            value={stats.resolvedToday}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
          <DashboardStatsCard
            title="Avg Resolution (Days)"
            value={stats.averageResolutionTime}
            icon={<BarChart3 className="h-6 w-6" />}
            color="purple"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Worker</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Generate Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Department Settings</span>
          </motion.button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Issues */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Issues</h2>
              <p className="text-gray-600 mt-1">Latest issues in your department</p>
            </div>
            
            {recentIssues.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent issues.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {recentIssues.map((issue) => (
                  <div key={issue._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate flex-1">{issue.title}</h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                      <div className="text-gray-500">
                        {issue.assignedTo ? `Assigned to ${issue.assignedTo.name}` : 'Unassigned'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Workers */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Department Workers</h2>
              <p className="text-gray-600 mt-1">Manage your team members</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {departmentWorkers.map((worker) => (
                <div key={worker._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {worker.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{worker.name}</p>
                        <p className="text-sm text-gray-500">{worker.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{worker.assignedIssues} issues</p>
                        <p className={`text-xs ${worker.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {worker.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <UserPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Assign Issue to Worker</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Create Performance Report</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">View Analytics</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}