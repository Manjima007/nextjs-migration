"use client";

import { motion } from "framer-motion";

interface StatsCardProps {
  number: string;
  label: string;
}

export function StatsCard({ number, label }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="text-center p-6 sm:p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-primary-500/20 backdrop-blur-sm"
    >
      <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-3 sm:mb-4">
        {number}
      </div>
      <div className="text-gray-300 text-sm sm:text-base lg:text-lg font-body font-medium">{label}</div>
    </motion.div>
  );
}