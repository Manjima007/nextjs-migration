"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MapPin, Users, BarChart3, Shield, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { StatsCard } from "@/components/ui/stats-card";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                CivicLink
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 desktop-nav">
              <Link href="#features" className="nav-link text-gray-300 hover:text-white font-heading font-medium px-3 py-2 rounded-md transition-colors">Features</Link>
              <Link href="#how-it-works" className="nav-link text-gray-300 hover:text-white font-heading font-medium px-3 py-2 rounded-md transition-colors">How it Works</Link>
              <Link href="/login" className="nav-link text-gray-300 hover:text-white font-heading font-medium px-3 py-2 rounded-md transition-colors">Login</Link>
              <Link href="/register">
                <Button className="btn-primary ml-2">Get Started</Button>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden mobile-nav">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-dark-900/95 backdrop-blur-sm border-b border-gray-800/50"
          >
            <div className="px-4 py-4 space-y-3">
              <Link 
                href="#features" 
                className="block text-gray-300 hover:text-white font-heading font-medium px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#how-it-works" 
                className="block text-gray-300 hover:text-white font-heading font-medium px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link 
                href="/login" 
                className="block text-gray-300 hover:text-white font-heading font-medium px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="btn-primary w-full mt-2">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative hero-bg pt-28 sm:pt-32 lg:pt-36 pb-24 sm:pb-28 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-12 sm:mb-16 lg:mb-20"
            >
              <div className="inline-flex items-center px-4 py-3 sm:px-5 sm:py-3 rounded-full bg-primary-900/20 border border-primary-500/30 text-primary-300 text-sm sm:text-base font-heading font-medium mb-8 sm:mb-10">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Trusted by 500+ Cities Worldwide
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold mb-8 sm:mb-10 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight hero-text">
                Smart Civic Issue
                <br />
                <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 sm:mb-16 max-w-4xl mx-auto leading-relaxed font-body px-4 sm:px-0">
                Transform your city with intelligent issue tracking, real-time reporting, and seamless collaboration between citizens and administrators.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col sm:flex-row gap-6 sm:gap-4 justify-center mb-20 sm:mb-24 lg:mb-28 px-4 sm:px-0"
            >
              <motion.div variants={fadeInUp}>
                <Link href="/register">
                  <Button size="lg" className="btn-primary btn-responsive text-lg px-8 py-5">
                    Start
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-5 border-gray-600 text-gray-300 hover:border-primary-500 hover:text-white min-w-[200px]">
                    View Live Demo
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto"
            >
              <motion.div variants={fadeInUp}>
                <StatsCard number="500+" label="Cities Using CivicLink" />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <StatsCard number="2.5M+" label="Issues Resolved" />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <StatsCard number="98%" label="User Satisfaction" />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <StatsCard number="24/7" label="Support Available" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-dark-900 to-dark-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Powerful Features for Modern Cities
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-body">
              Everything you need to manage civic issues efficiently and transparently
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="responsive-grid"
          >
            <motion.div variants={fadeInUp}>
              <FeatureCard
                icon={<MapPin className="w-8 h-8" />}
                title="Real-time Issue Mapping"
                description="Interactive maps with live issue tracking, location-based filtering, and geographical analytics for better resource allocation."
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Multi-role Management"
                description="Dedicated dashboards for citizens, field workers, department admins, and city officials with role-based permissions."
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FeatureCard
                icon={<BarChart3 className="w-8 h-8" />}
                title="Advanced Analytics"
                description="Comprehensive reporting with performance metrics, trend analysis, and data-driven insights for better decision making."
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FeatureCard
                icon={<Shield className="w-8 h-8" />}
                title="Enterprise Security"
                description="Bank-level security with encrypted data, secure authentication, and compliance with government standards."
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FeatureCard
                icon={<CheckCircle className="w-8 h-8" />}
                title="Automated Workflows"
                description="Smart assignment algorithms, automated notifications, and workflow optimization for faster issue resolution."
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FeatureCard
                icon={<MapPin className="w-8 h-8" />}
                title="Mobile Optimized"
                description="Fully responsive design with offline capabilities, mobile apps for field workers, and real-time synchronization."
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How CivicLink Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Simple, intuitive workflow designed for maximum efficiency
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "01",
                title: "Report Issues",
                description: "Citizens report issues through web app or mobile with photos, location, and detailed descriptions."
              },
              {
                step: "02", 
                title: "Smart Assignment",
                description: "AI-powered system automatically assigns issues to appropriate departments and field workers based on location and type."
              },
              {
                step: "03",
                title: "Track & Resolve",
                description: "Real-time updates, progress tracking, and transparent communication until complete resolution."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 glow-green">
                  <span className="text-2xl font-heading font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed font-body">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-900/20 to-primary-800/20 border-t border-primary-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Transform Your City?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto font-body">
              Join hundreds of cities already using CivicLink to improve citizen services and operational efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="btn-primary text-lg px-8 py-4 group">
                   Start
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-gray-600 text-gray-300 hover:border-primary-500 hover:text-white">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 border-t border-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-heading font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  CivicLink
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering cities with intelligent civic issue management solutions.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-heading font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 font-body">
                <li><Link href="#features" className="hover:text-primary-400 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-primary-400 transition-colors">Demo</Link></li>
                <li><Link href="/integrations" className="hover:text-primary-400 transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-heading font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 font-body">
                <li><Link href="/about" className="hover:text-primary-400 transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-primary-400 transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-heading font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400 font-body">
                <li><Link href="/help" className="hover:text-primary-400 transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-primary-400 transition-colors">Documentation</Link></li>
                <li><Link href="/status" className="hover:text-primary-400 transition-colors">Status</Link></li>
                <li><Link href="/security" className="hover:text-primary-400 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm font-body">
              © 2024 CivicLink. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-primary-400 text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-primary-400 text-sm">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-primary-400 text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}