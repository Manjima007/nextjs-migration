import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DashboardStatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

export function DashboardStatsCard({ title, value, icon, color = 'blue' }: DashboardStatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600', 
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-lg border-2 ${colorClasses[color]}`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}