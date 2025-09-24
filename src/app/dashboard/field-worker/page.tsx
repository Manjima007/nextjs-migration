'use client';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Calendar,
  User,
  Wrench
} from 'lucide-react';

interface Issue {
  _id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  createdAt: string;
  assignedTo?: string;
  reportedBy: {
    name: string;
    email: string;
  };
}

export default function FieldWorkerDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  const fetchAssignedIssues = useCallback(async () => {
    try {
      const response = await fetch('/api/issues?assignedTo=me');
      
      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
        
        // Calculate stats
        const total = data.issues?.length || 0;
        const pending = data.issues?.filter((issue: Issue) => issue.status === 'pending').length || 0;
        const inProgress = data.issues?.filter((issue: Issue) => issue.status === 'in_progress').length || 0;
        const resolved = data.issues?.filter((issue: Issue) => issue.status === 'resolved').length || 0;
        
        setStats({ total, pending, inProgress, resolved });
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setIssues([]);
    } finally {
      setIsLoadingIssues(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAssignedIssues();
    }
  }, [user, fetchAssignedIssues]);

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('civiclink_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh the issues list
        fetchAssignedIssues();
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  const getLocationString = (location: { address: string; coordinates?: { latitude: number; longitude: number; } }): string => {
    return location?.address || 'Location not specified';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'in_progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'resolved': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (!user) {
    return (
      <DashboardLayout title="Field Worker Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Field Worker Dashboard" description="Manage your assigned issues">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-dark-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Welcome back, {user?.name}!</h2>
              <p className="text-gray-400">Department: {user?.department || 'General Services'}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dark-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Issues</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-dark-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-dark-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-dark-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-dark-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Assigned Issues</h3>
            <p className="text-sm text-gray-400">Manage and update your assigned issues</p>
          </div>

          {isLoadingIssues ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : issues.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400">No issues assigned to you yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {issues.map((issue) => (
                <div key={issue._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-white">{issue.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{issue.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{getLocationString(issue.location)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>Reporter: {issue.reportedBy.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 space-y-2">
                      {issue.status === 'pending' && (
                        <button
                          onClick={() => updateIssueStatus(issue._id, 'in_progress')}
                          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Start Work
                        </button>
                      )}
                      
                      {issue.status === 'in_progress' && (
                        <button
                          onClick={() => updateIssueStatus(issue._id, 'resolved')}
                          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
