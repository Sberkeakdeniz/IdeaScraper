'use client';

import { Shield, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityBadgeProps {
  variant?: 'default' | 'compact' | 'full';
  className?: string;
}

export function SecurityBadge({ variant = 'default', className = '' }: SecurityBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5 text-xs font-medium ${className}`}>
        <Shield className="h-3 w-3 text-emerald-500" />
        <span className="text-emerald-700 dark:text-emerald-300">Secured</span>
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-6 shadow-lg ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">
                Enterprise Security Verified
              </h3>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3">
              Your data is protected with military-grade encryption, HMAC-SHA256 verification, and zero third-party access
            </p>
            <div className="flex items-center gap-4 text-xs text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>SOC2 Ready</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className={`inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 shadow-lg ${className}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-sm">
        <Shield className="h-4 w-4 text-white" />
      </div>
      <div>
        <div className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">
          Enterprise Secured
        </div>
        <div className="text-xs text-emerald-600 dark:text-emerald-400">
          Bank-level protection
        </div>
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
}

// Security stats component for use in various sections
export function SecurityStats() {
  const stats = [
    { label: '256-bit Encryption', value: 'AES-256' },
    { label: 'Uptime SLA', value: '99.9%' },
    { label: 'Security Audits', value: 'Monthly' },
    { label: 'Data Centers', value: 'Multi-region' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="text-center p-4 bg-gradient-to-br from-emerald-500/5 to-green-500/5 border border-emerald-500/20 rounded-xl"
        >
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}