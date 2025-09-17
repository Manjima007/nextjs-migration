"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card-hover p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 backdrop-blur-sm h-full"
    >
      <div className="w-16 h-16 lg:w-18 lg:h-18 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-8 glow-green-intense">
        <div className="text-white">
          {icon}
        </div>
      </div>
      
      <h3 className="text-xl lg:text-2xl xl:text-3xl font-heading font-bold text-white mb-6">{title}</h3>
      <p className="text-base lg:text-lg text-gray-300 leading-relaxed font-body">{description}</p>
    </motion.div>
  );
}