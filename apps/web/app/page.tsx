import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { TrustSecurity } from '@/components/landing/TrustSecurity';
import { Pricing } from '@/components/landing/Pricing';
import { CTA } from '@/components/landing/CTA';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <TrustSecurity />
      <Pricing />
      <CTA />
    </div>
  );
}