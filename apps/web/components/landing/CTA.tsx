'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { SecurityBadge } from '@/components/ui/security-badge';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to discover your next big idea?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Join thousands of entrepreneurs who trust us with their{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">most valuable business ideas</span>.
          </p>
          
          {/* Security assurance */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-8 flex justify-center"
          >
            <SecurityBadge />
          </motion.div>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="gradient-primary">
              <Link href="/register">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-8 text-sm text-muted-foreground"
          >
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓</span> No credit card required{' '}
            <span className="mx-2">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓</span> Enterprise security{' '}
            <span className="mx-2">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓</span> Cancel anytime
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}