"use client";

import { motion } from "framer-motion";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

export function TestimonialCard({ quote, author, role, avatar }: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card-hover p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 backdrop-blur-sm h-full"
    >
      <div className="flex items-start space-x-1 mb-4 sm:mb-6 text-primary-400">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      <blockquote className="text-gray-200 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 text-formal italic">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
          <span className="text-white font-heading font-bold text-base sm:text-lg">{author.charAt(0)}</span>
        </div>
        <div>
          <div className="font-heading font-semibold text-white text-sm sm:text-base">{author}</div>
          <div className="text-gray-400 text-xs sm:text-sm font-body">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}