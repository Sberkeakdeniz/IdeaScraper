'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for exploring the platform',
    features: [
      'View up to 50 ideas per month',
      'Basic filtering',
      'Email notifications',
      'Community support',
    ],
    cta: 'Get Started',
    href: '/register',
    popular: false,
  },
  {
    name: 'Premium',
    price: '$29',
    description: 'Best for serious entrepreneurs',
    features: [
      'Unlimited idea views',
      'Advanced filtering and search',
      'Export to PDF/CSV',
      'Priority email support',
      'Bookmark ideas',
      'Market trend insights',
    ],
    cta: 'Start Free Trial',
    href: '/register?plan=premium',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    description: 'For teams and agencies',
    features: [
      'All premium features',
      'Custom industry targeting',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" id="pricing">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Choose the{' '}
            <span className="gradient-text">right plan</span>{' '}
            for you
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-xl leading-8 text-muted-foreground font-light"
          >
            Start with our free plan and upgrade as your needs grow. All plans include access to our AI-powered idea discovery platform.
          </motion.p>
        </div>

        <div className="isolate mx-auto mt-20 grid max-w-md grid-cols-1 gap-8 sm:mt-24 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8 xl:gap-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <Card className={`relative h-full transition-all duration-500 ${
                plan.popular 
                  ? 'border-gradient shadow-glow-lg hover:shadow-glow-xl scale-105' 
                  : 'hover:border-white/30 hover:shadow-glow'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="gradient-primary px-6 py-2 rounded-full text-sm font-semibold text-white shadow-glow animate-pulse-glow">
                      Most Popular
                    </div>
                  </div>
                )}
                
                {/* Animated border for popular plan */}
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 animate-rotate-glow" style={{ padding: '1px' }}>
                    <div className="w-full h-full bg-card rounded-2xl"></div>
                  </div>
                )}
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-2xl font-bold ${plan.popular ? 'gradient-text' : ''}`}>
                      {plan.name}
                    </CardTitle>
                    <div className={`w-3 h-3 rounded-full ${plan.popular ? 'bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse' : 'bg-muted'}`}></div>
                  </div>
                  <CardDescription className="text-base font-medium">{plan.description}</CardDescription>
                  <div className="mt-6 flex items-baseline">
                    <span className={`text-5xl font-bold tracking-tight ${plan.popular ? 'gradient-text' : ''}`}>
                      {plan.price}
                    </span>
                    {plan.price !== '$0' && (
                      <span className="ml-1 text-lg font-semibold text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 flex-1">
                  <ul role="list" className="space-y-4 text-sm leading-6">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={feature} 
                        className="flex gap-x-3 items-start"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index * 0.1) + (featureIndex * 0.05) }}
                        viewport={{ once: true }}
                      >
                        <div className="flex-none mt-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <span className="font-medium">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="relative z-10">
                  <Button 
                    asChild 
                    className="w-full" 
                    variant={plan.popular ? 'gradient' : 'outline'}
                    size="lg"
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}