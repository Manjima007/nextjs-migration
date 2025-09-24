'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardStatsCard } from '@/components/ui/dashboard-stats-card';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Globe,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  Shield,
  MapPin,
  Clock,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface CityStats {
  totalWards: number;
  totalIssues: number;
  resolvedToday: number;
  citizenSatisfaction: number;
}

interface SystemMetrics {
  activeUsers: number;
  responseTime: number;
  systemUptime: number;
  dataProcessed: number;
}

interface WardPerformance {
  ward: string;
  activeIssues: number;
  resolvedIssues: number;
  efficiency: number;
  satisfaction: number;
}

export default function CityAdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<CityStats>({
    totalWards: 0,
    totalIssues: 0,
    resolvedToday: 0,
    citizenSatisfaction: 0
  });
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    responseTime: 0,
    systemUptime: 0,
    dataProcessed: 0
  });
  const [wardPerformance, setWardPerformance] = useState<WardPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCityData = useCallback(async () => {
    try {
      // Fetch city-wide issues
      const issuesResponse = await fetch('/api/issues');
      
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json();
        const issues = issuesData.issues || [];
        calculateStats(issues);
      }

      // Mock system metrics
      setSystemMetrics({
        activeUsers: 1247,
        responseTime: 1.8,
        systemUptime: 99.7,
        dataProcessed: 15.6
      });

      // Mock ward performance data
      setWardPerformance([
        { ward: 'Ward 1', activeIssues: 23, resolvedIssues: 145, efficiency: 91, satisfaction: 4.2 },
        { ward: 'Ward 2', activeIssues: 18, resolvedIssues: 132, efficiency: 88, satisfaction: 4.1 },
        { ward: 'Ward 3', activeIssues: 31, resolvedIssues: 98, efficiency: 76, satisfaction: 3.8 },
        { ward: 'Ward 4', activeIssues: 15, resolvedIssues: 167, efficiency: 94, satisfaction: 4.5 },
        { ward: 'Ward 5', activeIssues: 27, resolvedIssues: 121, efficiency: 82, satisfaction: 3.9 },
      ]);

    } catch (error) {
      console.error('Error fetching city data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCityData();
    }
  }, [user, fetchCityData]);

  const calculateStats = (issues: any[]) => {
    const today = new Date().toDateString();
    const resolvedToday = issues.filter(issue => 
      issue.status === 'resolved' && 
      new Date(issue.updatedAt).toDateString() === today
    ).length;

    setStats({
      totalWards: 15, // Mock data
      totalIssues: issues.length,
      resolvedToday,
      citizenSatisfaction: 4.1 // Mock: average rating
    });
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600 bg-green-100';
    if (efficiency >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 4.0) return 'text-green-600 bg-green-100';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <DashboardLayout title="City Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="City Admin Dashboard"
      description="Comprehensive city-wide management and oversight"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">City Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive city-wide management and oversight
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Active</span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* City-wide Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatsCard
            title="Total Wards"
            value={stats.totalWards}
            icon={<Building2 className="h-6 w-6" />}
            color="blue"
          />
          <DashboardStatsCard
            title="Total Issues"
            value={stats.totalIssues}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="yellow"
          />
          <DashboardStatsCard
            title="Resolved Today"
            value={stats.resolvedToday}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
          <DashboardStatsCard
            title="Satisfaction Rating"
            value={`${stats.citizenSatisfaction}/5`}
            icon={<Target className="h-6 w-6" />}
            color="purple"
          />
        </div>

        {/* System Metrics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health & Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.activeUsers}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.responseTime}s</p>
              <p className="text-sm text-gray-600">Avg Response Time</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.systemUptime}%</p>
              <p className="text-sm text-gray-600">System Uptime</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Globe className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.dataProcessed}GB</p>
              <p className="text-sm text-gray-600">Data Processed Today</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>City Analytics</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>City Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>System Settings</span>
          </motion.button>
        </div>

        {/* Ward Performance Overview */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Ward Performance Overview</h2>
                <p className="text-gray-600 mt-1">Monitor performance across all city wards</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Detailed Report
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {wardPerformance.map((ward, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{ward.ward}</h3>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEfficiencyColor(ward.efficiency)}`}>
                      {ward.efficiency}% Efficiency
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSatisfactionColor(ward.satisfaction)}`}>
                      ⭐ {ward.satisfaction}/5
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Active Issues</p>
                    <p className="text-xl font-bold text-gray-900">{ward.activeIssues}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Resolved Issues</p>
                    <p className="text-xl font-bold text-gray-900">{ward.resolvedIssues}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Resolution Rate</p>
                    <p className="text-xl font-bold text-gray-900">{Math.round((ward.resolvedIssues / (ward.activeIssues + ward.resolvedIssues)) * 100)}%</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Satisfaction</p>
                    <p className="text-xl font-bold text-gray-900">{ward.satisfaction}/5</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Management Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">City Management Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Ward Management</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">User Administration</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Advanced Analytics</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors">
              <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">System Configuration</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}