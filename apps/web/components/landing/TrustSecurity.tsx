'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  Server, 
  CheckCircle,
  Zap,
  Globe
} from 'lucide-react';

const securityFeatures = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'HMAC-SHA256 webhook verification, encrypted data transmission, and comprehensive input validation protect every interaction.',
    badge: 'SOC2 Ready',
  },
  {
    icon: Lock,
    title: 'Zero Data Sharing',
    description: 'Your business ideas, searches, and strategies never leave our secure environment. No third-party analytics or tracking.',
    badge: 'Privacy First',
  },
  {
    icon: Key,
    title: 'JWT Authentication',
    description: 'Military-grade token authentication with refresh rotation and automatic session management for maximum security.',
    badge: 'Bank Level',
  },
  {
    icon: Eye,
    title: 'Complete Transparency',
    description: 'Open about our security practices with regular audits, vulnerability assessments, and transparent incident reporting.',
    badge: 'Audit Ready',
  },
];

const trustIndicators = [
  {
    icon: CheckCircle,
    title: 'GDPR Compliant',
    description: 'Full compliance with European data protection regulations',
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description: 'Hosted on enterprise-grade cloud with 99.9% uptime SLA',
  },
  {
    icon: Zap,
    title: 'Real-time Monitoring',
    description: '24/7 security monitoring and automated threat detection',
  },
  {
    icon: Globe,
    title: 'Global Security',
    description: 'Multi-region deployment with automatic failover protection',
  },
];

export function TrustSecurity() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800" id="security">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-full px-6 py-3">
              <Shield className="mr-3 h-5 w-5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Security-First Platform</span>
              <div className="ml-3 flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Your Ideas Are{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Fort Knox Secure
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-6 text-xl leading-8 text-muted-foreground font-light"
          >
            We take security as seriously as you take your business. Every feature is built with{' '}
            <span className="text-emerald-600 font-medium">enterprise-grade protection</span>,{' '}
            ensuring your competitive advantages remain{' '}
            <span className="text-green-600 font-medium">completely confidential</span>.
          </motion.p>
        </div>

        {/* Security Features Grid */}
        <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:mt-32 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="relative futuristic-card p-8 h-full bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-emerald-500/20 hover:shadow-xl">
                  {/* Security badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {feature.badge}
                  </div>
                  
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow shadow-emerald-500/20">
                      <feature.icon className="h-8 w-8 text-emerald-500 group-hover:text-emerald-400 transition-colors duration-300" />
                    </div>
                    {/* Security pulse effect */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full opacity-75 animate-ping"></div>
                  </div>
                  
                  <h3 className="text-xl font-semibold leading-7 mb-4 text-emerald-700 dark:text-emerald-400">
                    {feature.title}
                  </h3>
                  
                  <p className="text-base leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                  
                  {/* Security glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-green-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:via-green-500/10 group-hover:to-teal-500/10 rounded-2xl transition-all duration-500"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 lg:mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Security-Conscious Entrepreneurs
            </h3>
            <p className="text-lg text-muted-foreground">
              Built with the same security standards used by Fortune 500 companies
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {trustIndicators.map((indicator, index) => (
              <motion.div
                key={indicator.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <indicator.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {indicator.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {indicator.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security commitment statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 lg:mt-32 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-8 py-6 shadow-lg">
            <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <div className="text-left">
              <div className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">
                Security Guarantee
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400">
                We protect your business ideas like our own intellectual property
              </div>
            </div>
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}