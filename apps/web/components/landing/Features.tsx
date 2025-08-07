'use client';

import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Filter, 
  BookmarkIcon, 
  Zap, 
  BarChart3,
  Shield,
  Lock
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Security First',
    description: 'Enterprise-grade security with HMAC-SHA256 webhook verification, encrypted data transmission, and GDPR compliance. Your business ideas are protected with the same standards used by Fortune 500 companies.',
    highlight: true,
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced algorithms analyze 50,000+ daily conversations with 92% accuracy to identify genuine business opportunities in minutes, not weeks.',
  },
  {
    icon: TrendingUp,
    title: 'Market Validation',
    description: 'Every idea includes real engagement data from 1M+ users, reducing market research costs by 85% and validation time by 90%.',
  },
  {
    icon: Filter,
    title: 'Niche-Specific Discovery',
    description: 'Find untapped opportunities in 200+ industries with 3x higher success rates than broad market approaches.',
  },
  {
    icon: Lock,
    title: 'Privacy Protected',
    description: 'Your searches, bookmarks, and business strategies remain completely private. Zero data sharing, zero tracking, maximum confidentiality.',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Receive 50+ validated ideas weekly, saving you 40+ hours of manual research and keeping you ahead of trends.',
  },
];

export function Features() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" id="features">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent"></div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Everything you need to find your{' '}
            <span className="gradient-text">next big idea</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-xl leading-8 text-muted-foreground font-light"
          >
            Replace expensive consultants and time-consuming surveys with AI that delivers{' '}
            <span className="text-green-400 font-medium">3x more accurate insights</span>{' '}
            in specialized markets while cutting research costs by{' '}
            <span className="text-indigo-400 font-medium">90%</span>.
          </motion.p>
        </div>

        <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:mt-32 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className={`futuristic-card p-8 h-full transition-all duration-500 ${
                  feature.highlight 
                    ? 'bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border-2 border-emerald-500/30 shadow-emerald-500/20 shadow-xl hover:shadow-emerald-500/30 hover:shadow-2xl' 
                    : 'hover:bg-gradient-to-br hover:from-indigo-500/5 hover:to-purple-500/5'
                }`}>
                  {/* Security badge for highlighted feature */}
                  {feature.highlight && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse-glow">
                      SECURED
                    </div>
                  )}
                  
                  {/* Animated icon container */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow ${
                      feature.highlight 
                        ? 'bg-gradient-to-br from-emerald-500/30 to-green-500/30 shadow-emerald-500/20' 
                        : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                    }`}>
                      <feature.icon className={`h-8 w-8 transition-colors duration-300 ${
                        feature.highlight 
                          ? 'text-emerald-400 group-hover:text-emerald-300' 
                          : 'text-indigo-400 group-hover:text-indigo-300'
                      }`} />
                    </div>
                    {/* Floating particles around icon */}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300 ${
                      feature.highlight 
                        ? 'bg-gradient-to-r from-emerald-400 to-green-400' 
                        : 'bg-gradient-to-r from-indigo-400 to-purple-400'
                    }`}></div>
                  </div>
                  
                  <h3 className="text-xl font-semibold leading-7 mb-4 group-hover:gradient-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-base leading-7 text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-20 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-30 animate-pulse-glow"></div>
      </div>
    </section>
  );
}