'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardStatsCard } from '@/components/ui/dashboard-stats-card';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Camera,
  Route,
  Users,
  TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Issue {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  reporter: {
    name: string;
    email: string;
  };
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export default function FieldWorkerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    todayCompleted: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignedIssues = useCallback(async () => {
    try {
      const response = await fetch('/api/issues?assignedTo=me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('civicflow_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
        calculateStats(data.issues || []);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'field_worker')) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchAssignedIssues();
    }
  }, [user, loading, router, fetchAssignedIssues]);

  const calculateStats = (issuesList: Issue[]) => {
    const today = new Date().toDateString();
    
    setStats({
      assigned: issuesList.length,
      inProgress: issuesList.filter(issue => issue.status === 'in_progress').length,
      completed: issuesList.filter(issue => issue.status === 'resolved').length,
      todayCompleted: issuesList.filter(issue => 
        issue.status === 'resolved' && 
        new Date(issue.updatedAt).toDateString() === today
      ).length
    });
  };

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('civicflow_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchAssignedIssues(); // Refresh the data
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
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
      <DashboardLayout title="Field Worker Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Field Worker Dashboard"
      description="Manage your assigned issues and track work progress"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Field Worker Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your assigned issues and track work progress
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
            title="Assigned Issues"
            value={stats.assigned}
            icon={<CheckCircle className="h-6 w-6" />}
            color="blue"
          />
          <DashboardStatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Clock className="h-6 w-6" />}
            color="yellow"
          />
          <DashboardStatsCard
            title="Completed"
            value={stats.completed}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
          <DashboardStatsCard
            title="Today's Completed"
            value={stats.todayCompleted}
            icon={<Users className="h-6 w-6" />}
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
            <MapPin className="h-4 w-4" />
            <span>View Map</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Camera className="h-4 w-4" />
            <span>Quick Photo Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Route className="h-4 w-4" />
            <span>Optimize Route</span>
          </motion.button>
        </div>

        {/* Assigned Issues */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Assigned Issues</h2>
            <p className="text-gray-600 mt-1">Issues assigned to you for resolution</p>
          </div>
          
          {issues.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No issues assigned to you yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {issues.map((issue) => (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{issue.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{issue.location.address}</span>
                        </div>
                        <div>Category: {issue.category}</div>
                        <div>Reporter: {issue.reporter.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4 md:mt-0 md:ml-6">
                      {issue.status === 'pending' && (
                        <button
                          onClick={() => updateIssueStatus(issue._id, 'in_progress')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Start Work
                        </button>
                      )}
                      {issue.status === 'in_progress' && (
                        <button
                          onClick={() => updateIssueStatus(issue._id, 'resolved')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}