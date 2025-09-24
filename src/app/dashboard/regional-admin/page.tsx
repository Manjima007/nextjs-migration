'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardStatsCard } from '@/components/ui/dashboard-stats-card';
import { apiClient } from '@/lib/api-client';
import { IIssue } from '@/models/Issue';
import { 
  Building, 
  Users, 
  TrendingUp, 
  MapPin,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  Clock,
  Bell,
  Eye,
  Edit3,
  RefreshCw,
  Download,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface RegionalStats {
  totalDepartments: number;
  activeIssues: number;
  resolvedThisWeek: number;
  averageResponseTime: number;
  totalFieldWorkers: number;
  activeFieldWorkers: number;
  pendingAssignments: number;
  satisfactionScore: number;
}

interface Issue {
  _id: string;
  title: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    name: string;
  };
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  } | null;
  ward?: string;
}

interface DepartmentPerformance {
  _id: string;
  name: string;
  activeIssues: number;
  resolvedIssues: number;
  averageTime: number;
  efficiency: number;
  workers: number;
  budget: number;
  head: string;
}

interface FieldWorker {
  _id: string;
  name: string;
  department: string;
  isActive: boolean;
  assignedIssues: number;
  completedToday: number;
  location: string;
  performance: number;
}

interface Notification {
  id: string;
  type: 'issue' | 'worker' | 'department' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'error';
}

export default function RegionalAdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State
  const [stats, setStats] = useState<RegionalStats>({
    totalDepartments: 0,
    activeIssues: 0,
    resolvedThisWeek: 0,
    averageResponseTime: 0,
    totalFieldWorkers: 0,
    activeFieldWorkers: 0,
    pendingAssignments: 0,
    satisfactionScore: 0
  });
  
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);
  const [fieldWorkers, setFieldWorkers] = useState<FieldWorker[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchRegionalData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching regional data for ward:', user?.ward);
      
      // Fetch all issues for this ward, without sending ward parameter since it's handled by the API
      const allIssuesResponse = await apiClient.issues.getAll({
        limit: 1000,
        ward: user?.ward // Always send ward for regional admin
      });
      const allIssues = allIssuesResponse.issues || [];
  // Debug: print all fetched issues for this ward
  console.log('All issues fetched for ward', user?.ward, allIssues);
      // Debug log: print user's ward and all fetched issues
      console.log('Regional Admin Ward:', user?.ward);
      console.log('Fetched Issues:', allIssues);
      // Calculate active issues from the filtered set
      const activeIssues = allIssues.filter((issue: IIssue) => 
        ['pending', 'assigned', 'in_progress'].includes(issue.status)
      ).length;
      
      // Set recent issues to show active ones first
      setRecentIssues(allIssues.sort((a: IIssue, b: IIssue) => {
        // Sort by status (active first) then by date
        const aIsActive = !['resolved', 'closed'].includes(a.status);
        const bIsActive = !['resolved', 'closed'].includes(b.status);
        if (aIsActive !== bIsActive) return bIsActive ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }));

      // Calculate department stats from all issues
      const departmentCounts: { [key: string]: number } = {};
      allIssues.forEach((issue: IIssue) => {
        if (issue.department) {
          departmentCounts[issue.department] = (departmentCounts[issue.department] || 0) + 1;
        }
      });

      // Calculate resolved in the last week
      const resolvedThisWeek = allIssues.filter((i: IIssue) => {
        if (i.status === 'resolved' || i.status === 'closed') {
          const resolvedDate = new Date(i.updatedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return resolvedDate >= weekAgo;
        }
        return false;
      }).length;

      // Update stats
      setStats(prev => ({
        ...prev,
        totalDepartments: Object.keys(departmentCounts).length,
        activeIssues,
        resolvedThisWeek
      }));

      // Mock data for department performance
      setDepartmentPerformance([{
        _id: '1',
        name: 'Sanitation',
        activeIssues: activeIssues,
        resolvedIssues: resolvedThisWeek,
        averageTime: 2.3,
        efficiency: 89,
        workers: 15,
        budget: 250000,
        head: 'John Smith'
      }]);

      // Mock data for field workers
      setFieldWorkers([{
        _id: '1',
        name: 'David Lee',
        department: 'Sanitation',
        isActive: true,
        assignedIssues: 5,
        completedToday: 2,
        location: 'Zone A',
        performance: 92
      }]);

      // Mock notifications
      setNotifications([{
        id: '1',
        type: 'issue',
        message: 'New issue reported in your ward',
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'info'
      }]);

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

  if (loading || isLoading) {
    return <DashboardLayout title="Regional Admin Dashboard">Loading...</DashboardLayout>;
  }

  if (!user) {
    return null;
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout title="Regional Admin Dashboard">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Regional Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
            <Bell className="w-6 h-6" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardStatsCard
          title="Total Departments"
          value={stats.totalDepartments}
          icon={<Building className="w-6 h-6" />}
          color="blue"
        />
        <DashboardStatsCard
          title="Active Issues"
          value={stats.activeIssues}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="yellow"
        />
        <DashboardStatsCard
          title="Resolved This Week"
          value={stats.resolvedThisWeek}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <DashboardStatsCard
          title="Average Response Time"
          value={`${stats.averageResponseTime}d`}
          icon={<Clock className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Recent Issues */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Issues</h2>
          <RefreshCw
            className="w-5 h-5 cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={() => fetchRegionalData()}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Title</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Department</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Priority</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Location</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentIssues.map(issue => (
                <tr key={issue._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{issue.title}</td>
                  <td className="py-3 px-4 text-gray-800">{issue.department}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                      issue.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      issue.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      issue.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                      issue.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                      issue.priority === 'high' ? 'bg-red-100 text-red-700' :
                      issue.priority === 'urgent' ? 'bg-red-200 text-red-800' :
                      issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800">{issue.location?.address || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700 text-xl font-medium"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  !notification.read 
                    ? 'bg-blue-50 border-blue-100 shadow-sm' 
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <p className="text-sm text-gray-800 font-medium">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}