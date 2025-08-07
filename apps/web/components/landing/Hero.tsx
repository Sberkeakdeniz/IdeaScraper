'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Brain, Zap, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 lg:px-8 py-24 sm:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-30"
            initial={{ 
              x: Math.random() * 1200, 
              y: Math.random() * 800,
              scale: 0 
            }}
            animate={{ 
              y: [-100, 0, -100],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col items-center gap-4"
        >
          <div className="inline-flex items-center glass rounded-full px-6 py-3 text-sm font-medium backdrop-blur-xl border border-white/20 shadow-glow">
            <Sparkles className="mr-2 h-4 w-4 text-indigo-400 animate-pulse-glow" />
            <span className="gradient-text font-semibold">AI-Powered Business Intelligence</span>
            <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* Security badge */}
          <div className="inline-flex items-center glass rounded-full px-6 py-3 text-sm font-medium backdrop-blur-xl border border-emerald-500/30 shadow-glow bg-gradient-to-r from-emerald-500/10 to-green-500/10">
            <Shield className="mr-2 h-4 w-4 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">Enterprise Security</span>
            <div className="ml-2 flex space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-8xl leading-none"
        >
          <span className="block">Discover</span>
          <span className="block gradient-text animate-shimmer bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-[length:200%_100%]">
            Validated
          </span>
          <span className="block">Business Ideas</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-xl leading-relaxed text-muted-foreground max-w-3xl mx-auto font-light"
        >
          Stop spending weeks on market research. Our AI reduces idea discovery from{' '}
          <span className="text-red-400 font-medium line-through">hours to days</span>{' '}
          to{' '}
          <span className="text-green-400 font-bold">minutes</span>, delivering{' '}
          <span className="text-indigo-400 font-medium">76% more consistent</span>{' '}
          results than manual research while being{' '}
          <span className="text-purple-400 font-medium">10x faster</span>{' '}
          at identifying niche opportunities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <Button asChild size="lg" className="btn-futuristic gradient-primary text-white border-0 shadow-glow hover:shadow-glow-lg px-8 py-4 text-lg font-semibold">
            <Link href="/dashboard">
              <Zap className="mr-2 h-5 w-5" />
              Start Exploring Ideas
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="glass border-white/20 hover:bg-white/5 px-8 py-4 text-lg font-medium backdrop-blur-xl">
            <Link href="/pricing" className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              View Pricing
            </Link>
          </Button>
        </motion.div>

        {/* Feature indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
        >
          {[
            { icon: Shield, text: "Fort Knox Security", highlight: true },
            { icon: Brain, text: "AI-Powered Analysis" },
            { icon: Sparkles, text: "Real-time Insights" },
            { icon: TrendingUp, text: "Market Validation" }
          ].map(({ icon: Icon, text, highlight }, index) => (
            <div key={text} className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
              highlight 
                ? 'glass bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30 shadow-emerald-500/20 shadow-glow' 
                : 'glass border-white/10'
            }`}>
              <Icon className={`h-4 w-4 ${highlight ? 'text-emerald-400' : 'text-indigo-400'}`} />
              <span className={`font-medium ${highlight ? 'text-emerald-300' : ''}`}>{text}</span>
              {highlight && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></div>}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20"
        >
          <div className="relative futuristic-card p-4 lg:p-8 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"></div>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&auto=format"
                alt="Dashboard Preview"
                className="relative w-full h-auto rounded-xl opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}