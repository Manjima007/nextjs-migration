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
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  createdAt: string;
  assignedTo?: {
    name: string;
  };
  location?: string;
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
      const issuesResponse = await fetch(`/api/issues?ward=${user?.ward}`, {
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

      // Mock enhanced data
      setDepartmentPerformance([
        { 
          _id: '1',
          name: 'Sanitation', 
          activeIssues: 12, 
          resolvedIssues: 45, 
          averageTime: 2.3, 
          efficiency: 89,
          workers: 15,
          budget: 250000,
          head: 'John Smith'
        },
        { 
          _id: '2',
          name: 'Public Works', 
          activeIssues: 8, 
          resolvedIssues: 32, 
          averageTime: 3.1, 
          efficiency: 82,
          workers: 12,
          budget: 180000,
          head: 'Sarah Johnson'
        },
        { 
          _id: '3',
          name: 'Traffic', 
          activeIssues: 15, 
          resolvedIssues: 28, 
          averageTime: 1.8, 
          efficiency: 75,
          workers: 8,
          budget: 120000,
          head: 'Mike Wilson'
        }
      ]);

      setFieldWorkers([
        {
          _id: '1',
          name: 'David Lee',
          department: 'Sanitation',
          isActive: true,
          assignedIssues: 5,
          completedToday: 2,
          location: 'Zone A',
          performance: 92
        },
        {
          _id: '2',
          name: 'Maria Garcia',
          department: 'Public Works',
          isActive: true,
          assignedIssues: 3,
          completedToday: 1,
          location: 'Zone B',
          performance: 88
        }
      ]);

      setNotifications([
        {
          id: '1',
          type: 'issue',
          message: 'Critical water leak reported in Zone A - requires immediate attention',
          timestamp: '2024-12-17T14:30:00Z',
          read: false,
          severity: 'error'
        },
        {
          id: '2',
          type: 'worker',
          message: 'Field worker David Lee completed 3 issues ahead of schedule',
          timestamp: '2024-12-17T13:15:00Z',
          read: false,
          severity: 'info'
        }
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
  }, [user, loading, router]); // Removed fetchRegionalData from dependencies

  const calculateStats = (issues: Issue[]) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const activeIssues = issues.filter(issue => issue.status !== 'resolved').length;
    const resolvedThisWeek = issues.filter(issue => 
      issue.status === 'resolved' && 
      new Date(issue.createdAt) >= oneWeekAgo
    ).length;

    setStats({
      totalDepartments: 3,
      activeIssues,
      resolvedThisWeek,
      averageResponseTime: 2.7,
      totalFieldWorkers: 15,
      activeFieldWorkers: 12,
      pendingAssignments: 8,
      satisfactionScore: 4.2
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout title="Regional Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

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
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Ward:</span>
              <span className="font-medium text-gray-900">{user?.ward || 'Not assigned'}</span>
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-10">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={fetchRegionalData}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
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
            title="Avg Response Time"
            value={`${stats.averageResponseTime}h`}
            icon={<Clock className="h-6 w-6" />}
            color="purple"
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'departments', label: 'Departments', icon: Building },
              { id: 'workers', label: 'Field Workers', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </motion.button>
            </div>

            {/* Overview Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Performance */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Department Performance</h2>
                      <p className="text-gray-600 mt-1">Monitor departmental efficiency and metrics</p>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {departmentPerformance.map((dept) => (
                    <div key={dept._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{dept.name}</h3>
                          <p className="text-sm text-gray-500">Head: {dept.head}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEfficiencyColor(dept.efficiency)}`}>
                          {dept.efficiency}% Efficiency
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Active</p>
                          <p className="font-semibold text-gray-900">{dept.activeIssues}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Resolved</p>
                          <p className="font-semibold text-gray-900">{dept.resolvedIssues}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Workers</p>
                          <p className="font-semibold text-gray-900">{dept.workers}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg Time</p>
                          <p className="font-semibold text-gray-900">{dept.averageTime}d</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Budget: ₹{dept.budget.toLocaleString()}</span>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-800">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Issues */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Regional Issues</h2>
                  <p className="text-gray-600 mt-1">Latest issues across all departments</p>
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
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 truncate">{issue.title}</h3>
                            {issue.location && (
                              <p className="text-sm text-gray-500 mt-1">{issue.location}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                              {issue.status.replace('_', ' ')}
                            </span>
                            <span className="text-gray-500">{issue.department}</span>
                          </div>
                          <span className="text-gray-500">
                            {issue.assignedTo ? `Assigned to ${issue.assignedTo.name}` : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workers' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Field Workers Management</h2>
                  <p className="text-gray-600 mt-1">Monitor and manage field worker performance</p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Worker
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Today's Work
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fieldWorkers.map((worker) => (
                    <tr key={worker._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                            <div className="text-sm text-gray-500">{worker.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {worker.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          worker.isActive ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                        }`}>
                          {worker.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{worker.performance}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Completed: {worker.completedToday}</div>
                        <div>Assigned: {worker.assignedIssues}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Management Tools */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Management Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors group">
              <Users className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-indigo-700">Manage Departments</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group">
              <BarChart3 className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-700">View Analytics</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group">
              <FileText className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-purple-700">Generate Report</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors group">
              <Settings className="h-8 w-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-orange-700">Regional Settings</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}