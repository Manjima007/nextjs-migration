'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardStatsCard } from '@/components/ui/dashboard-stats-card';
import { 
  Building, 
  Users, 
  TrendingUp, 
  MapPin,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface RegionalStats {
  totalDepartments: number;
  activeIssues: number;
  resolvedThisWeek: number;
  averageResponseTime: number;
}

interface Issue {
  _id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  createdAt: string;
  assignedTo?: {
    name: string;
  };
}

interface DepartmentPerformance {
  name: string;
  activeIssues: number;
  resolvedIssues: number;
  averageTime: number;
  efficiency: number;
}

export default function RegionalAdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<RegionalStats>({
    totalDepartments: 0,
    activeIssues: 0,
    resolvedThisWeek: 0,
    averageResponseTime: 0
  });
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegionalData = useCallback(async () => {
    try {
      // Fetch regional issues
      const issuesResponse = await fetch(`/api/issues?ward=${user?.ward}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('civicflow_token')}`
        }
      });
      
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json();
        const issues = issuesData.issues || [];
        setRecentIssues(issues.slice(0, 10));
        calculateStats(issues);
      }

      // Mock department performance data
      setDepartmentPerformance([
        { name: 'Sanitation', activeIssues: 12, resolvedIssues: 45, averageTime: 2.3, efficiency: 89 },
        { name: 'Public Works', activeIssues: 8, resolvedIssues: 32, averageTime: 3.1, efficiency: 82 },
        { name: 'Traffic', activeIssues: 15, resolvedIssues: 28, averageTime: 1.8, efficiency: 75 },
      ]);

    } catch (error) {
      console.error('Error fetching regional data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.ward]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'regional_admin')) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchRegionalData();
    }
  }, [user, loading, router, fetchRegionalData]);

  const calculateStats = (issues: Issue[]) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const activeIssues = issues.filter(issue => issue.status !== 'resolved').length;
    const resolvedThisWeek = issues.filter(issue => 
      issue.status === 'resolved' && 
      new Date(issue.createdAt) >= oneWeekAgo
    ).length;

    setStats({
      totalDepartments: 5, // Mock data
      activeIssues,
      resolvedThisWeek,
      averageResponseTime: 2.7 // Mock: average hours
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

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600 bg-green-100';
    if (efficiency >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout title="Regional Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Regional Admin Dashboard"
      description="Oversee departmental performance and regional issue management"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Regional Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Oversee departmental performance and regional issue management
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className="text-sm text-gray-500">Ward:</span>
            <span className="font-medium text-gray-900">{user?.ward || 'Not assigned'}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatsCard
            title="Total Departments"
            value={stats.totalDepartments}
            icon={<Building className="h-6 w-6" />}
            color="blue"
          />
          <DashboardStatsCard
            title="Active Issues"
            value={stats.activeIssues}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="yellow"
          />
          <DashboardStatsCard
            title="Resolved This Week"
            value={stats.resolvedThisWeek}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
          <DashboardStatsCard
            title="Avg Response (Hours)"
            value={stats.averageResponseTime}
            icon={<Clock className="h-6 w-6" />}
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
            <BarChart3 className="h-4 w-4" />
            <span>Regional Analytics</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Performance Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>Ward Overview</span>
          </motion.button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Performance */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Department Performance</h2>
              <p className="text-gray-600 mt-1">Monitor departmental efficiency and metrics</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {departmentPerformance.map((dept, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{dept.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEfficiencyColor(dept.efficiency)}`}>
                      {dept.efficiency}% Efficiency
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Active</p>
                      <p className="font-semibold text-gray-900">{dept.activeIssues}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Resolved</p>
                      <p className="font-semibold text-gray-900">{dept.resolvedIssues}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Time</p>
                      <p className="font-semibold text-gray-900">{dept.averageTime}d</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Regional Issues */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Regional Issues</h2>
              <p className="text-gray-600 mt-1">Latest issues across all departments in your ward</p>
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
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className="text-gray-500">{issue.department}</span>
                      </div>
                      <div className="text-gray-500">
                        {issue.assignedTo ? `Assigned to ${issue.assignedTo.name}` : 'Unassigned'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Management Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Manage Departments</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
              <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">View Detailed Analytics</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Generate Ward Report</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors">
              <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Regional Settings</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}