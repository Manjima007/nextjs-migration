'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardStatsCard } from '@/components/ui/dashboard-stats-card';
import { 
  Globe2, 
  Users, 
  User,
  TrendingUp, 
  Shield,
  AlertTriangle,
  BarChart3,
  Database,
  Settings,
  Building2,
  MapPin,
  Clock,
  Activity,
  UserCheck,
  Server,
  Zap,
  Lock,
  FileText,
  Mail,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SuperAdminStats {
  totalUsers: number;
  totalCities: number;
  totalIssues: number;
  systemUptime: number;
  activeConnections: number;
  dataProcessed: number;
  securityThreats: number;
  performanceScore: number;
}

interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: 'citizen' | 'field_worker' | 'department_admin' | 'regional_admin' | 'city_admin';
  isActive: boolean;
  lastLogin: string;
  city: string;
  ward?: string;
  department?: string;
  createdAt: string;
}

interface City {
  _id: string;
  name: string;
  totalUsers: number;
  totalIssues: number;
  resolvedIssues: number;
  efficiency: number;
  lastActivity: string;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface SecurityAlert {
  id: string;
  type: 'login_attempt' | 'data_breach' | 'suspicious_activity' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function SuperAdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State management
  const [stats, setStats] = useState<SuperAdminStats>({
    totalUsers: 0,
    totalCities: 0,
    totalIssues: 0,
    systemUptime: 0,
    activeConnections: 0,
    dataProcessed: 0,
    securityThreats: 0,
    performanceScore: 0
  });
  
  const [users, setUsers] = useState<AppUser[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter and pagination states
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  const fetchSuperAdminData = useCallback(async () => {
    try {
      // Simulating API calls with mock data
      // In real implementation, these would be actual API calls
      
      setStats({
        totalUsers: 25847,
        totalCities: 127,
        totalIssues: 89523,
        systemUptime: 99.97,
        activeConnections: 1247,
        dataProcessed: 45.8,
        securityThreats: 3,
        performanceScore: 94
      });

      // Mock users data
      setUsers([
        {
          _id: '1',
          name: 'John Smith',
          email: 'john.smith@cityauth.gov',
          role: 'city_admin',
          isActive: true,
          lastLogin: '2024-12-17T10:30:00Z',
          city: 'Mumbai',
          createdAt: '2024-01-15T09:00:00Z'
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@region.gov',
          role: 'regional_admin',
          isActive: true,
          lastLogin: '2024-12-17T14:15:00Z',
          city: 'Delhi',
          ward: 'Ward 12',
          createdAt: '2024-02-20T11:30:00Z'
        },
        {
          _id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@dept.gov',
          role: 'department_admin',
          isActive: false,
          lastLogin: '2024-12-15T16:45:00Z',
          city: 'Bangalore',
          department: 'Sanitation',
          createdAt: '2024-03-10T14:20:00Z'
        }
      ]);

      // Mock cities data
      setCities([
        {
          _id: '1',
          name: 'Mumbai',
          totalUsers: 4521,
          totalIssues: 15230,
          resolvedIssues: 12847,
          efficiency: 84.4,
          lastActivity: '2024-12-17T15:30:00Z'
        },
        {
          _id: '2',
          name: 'Delhi',
          totalUsers: 3892,
          totalIssues: 12456,
          resolvedIssues: 10234,
          efficiency: 82.2,
          lastActivity: '2024-12-17T15:25:00Z'
        }
      ]);

      // Mock system metrics
      setSystemMetrics([
        { name: 'CPU Usage', value: 45, unit: '%', status: 'good', trend: 'stable' },
        { name: 'Memory Usage', value: 67, unit: '%', status: 'warning', trend: 'up' },
        { name: 'Disk Space', value: 23, unit: '%', status: 'good', trend: 'down' },
        { name: 'Network I/O', value: 89, unit: 'Mbps', status: 'good', trend: 'up' }
      ]);

      // Mock security alerts
      setSecurityAlerts([
        {
          id: '1',
          type: 'login_attempt',
          severity: 'medium',
          message: 'Multiple failed login attempts from IP 192.168.1.45',
          timestamp: '2024-12-17T14:30:00Z',
          resolved: false
        },
        {
          id: '2',
          type: 'suspicious_activity',
          severity: 'high',
          message: 'Unusual data access pattern detected in Mumbai region',
          timestamp: '2024-12-17T13:15:00Z',
          resolved: false
        }
      ]);

    } catch (error) {
      console.error('Error fetching super admin data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'super_admin')) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchSuperAdminData();
    }
  }, [user, loading, router]); // Removed fetchSuperAdminData from dependencies

  // Utility functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-red-600 bg-red-100';
      case 'city_admin': return 'text-purple-600 bg-purple-100';
      case 'regional_admin': return 'text-indigo-600 bg-indigo-100';
      case 'department_admin': return 'text-blue-600 bg-blue-100';
      case 'field_worker': return 'text-orange-600 bg-orange-100';
      case 'citizen': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatDataSize = (size: number) => {
    return `${size.toFixed(1)} TB`;
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) return;
    
    console.log(`Performing ${action} on users:`, selectedUsers);
    // Implement bulk actions here
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout title="Super Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Super Admin Dashboard"
      description="Complete system oversight and platform administration"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Complete system oversight and platform administration
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
            <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Critical Alerts */}
        {securityAlerts.filter(alert => !alert.resolved && alert.severity === 'high').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-lg font-medium text-red-800">Critical Security Alerts</h3>
            </div>
            <p className="text-red-700 mt-1">
              {securityAlerts.filter(alert => !alert.resolved && alert.severity === 'high').length} high-priority security issues require immediate attention.
            </p>
          </motion.div>
        )}

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<Users className="h-6 w-6" />}
            color="blue"
          />
          <DashboardStatsCard
            title="Active Cities"
            value={stats.totalCities}
            icon={<Building2 className="h-6 w-6" />}
            color="green"
          />
          <DashboardStatsCard
            title="Total Issues"
            value={stats.totalIssues.toLocaleString()}
            icon={<FileText className="h-6 w-6" />}
            color="purple"
          />
          <DashboardStatsCard
            title="System Uptime"
            value={formatUptime(stats.systemUptime)}
            icon={<Activity className="h-6 w-6" />}
            color="yellow"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatsCard
            title="Active Connections"
            value={stats.activeConnections.toLocaleString()}
            icon={<Globe2 className="h-6 w-6" />}
            color="blue"
          />
          <DashboardStatsCard
            title="Data Processed"
            value={formatDataSize(stats.dataProcessed)}
            icon={<Database className="h-6 w-6" />}
            color="green"
          />
          <DashboardStatsCard
            title="Security Threats"
            value={stats.securityThreats}
            icon={<Shield className="h-6 w-6" />}
            color="red"
          />
          <DashboardStatsCard
            title="Performance Score"
            value={`${stats.performanceScore}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>Manage Users</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Building2 className="h-4 w-4" />
            <span>City Management</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>System Analytics</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Platform Settings</span>
          </motion.button>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* System Metrics */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">System Metrics</h2>
              <p className="text-gray-600 mt-1">Real-time system performance</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {systemMetrics.map((metric, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{metric.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {metric.value}{metric.unit}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {metric.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                      {metric.trend === 'stable' && <div className="h-1 w-4 bg-gray-400 rounded"></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Cities Performance */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Top Cities</h2>
              <p className="text-gray-600 mt-1">Performance by city</p>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {cities.map((city) => (
                <div key={city._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{city.name}</h3>
                    <span className="text-sm font-medium text-green-600">
                      {city.efficiency.toFixed(1)}% efficiency
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Users</p>
                      <p className="font-semibold text-gray-900">{city.totalUsers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Issues</p>
                      <p className="font-semibold text-gray-900">{city.totalIssues.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${city.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Security Alerts</h2>
              <p className="text-gray-600 mt-1">Recent security events</p>
            </div>
            
            {securityAlerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No active security alerts.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2">{alert.message}</p>
                    
                    {!alert.resolved && (
                      <div className="flex space-x-2">
                        <button className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors">
                          Investigate
                        </button>
                        <button className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <p className="text-gray-600 mt-1">Manage platform users and administrators</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <select 
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="city_admin">City Admins</option>
                  <option value="regional_admin">Regional Admins</option>
                  <option value="department_admin">Department Admins</option>
                  <option value="field_worker">Field Workers</option>
                </select>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleBulkAction('activate')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Activate
                  </button>
                  <button 
                    onClick={() => handleBulkAction('deactivate')}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Deactivate
                  </button>
                  <button 
                    onClick={() => handleBulkAction('delete')}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.map(u => u._id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                          }
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{user.city}</div>
                      {user.ward && <div className="text-gray-500">{user.ward}</div>}
                      {user.department && <div className="text-gray-500">{user.department}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Administration */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Administration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors group">
              <Database className="h-8 w-8 text-gray-400 group-hover:text-red-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-red-700">Database Management</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
              <Server className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-blue-700">Server Configuration</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group">
              <Download className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-700">System Backups</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group">
              <Lock className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-purple-700">Security Settings</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}