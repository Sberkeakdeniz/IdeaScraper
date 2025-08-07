'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function IdeaCardSkeleton() {
  return (
    <Card className="h-full border-white/10 bg-card/80 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg animate-shimmer bg-[length:200%_100%]"></div>
            <div className="h-4 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded w-24 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-full animate-pulse"></div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <div className="h-5 w-16 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-full animate-shimmer bg-[length:200%_100%]"></div>
          <div className="h-5 w-20 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-full animate-shimmer bg-[length:200%_100%]"></div>
          <div className="h-5 w-14 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-full animate-shimmer bg-[length:200%_100%]"></div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded animate-shimmer bg-[length:200%_100%]"></div>
          <div className="h-4 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded w-4/5 animate-shimmer bg-[length:200%_100%]"></div>
          <div className="h-4 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded w-3/5 animate-shimmer bg-[length:200%_100%]"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-3 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded animate-shimmer bg-[length:200%_100%]"></div>
              <div className="h-4 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded animate-shimmer bg-[length:200%_100%]"></div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="h-3 w-16 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded animate-shimmer bg-[length:200%_100%]"></div>
            <div className="h-3 w-20 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded animate-shimmer bg-[length:200%_100%]"></div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-xl animate-shimmer bg-[length:200%_100%]"></div>
          <div className="w-12 h-9 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-xl animate-shimmer bg-[length:200%_100%]"></div>
        </div>
      </CardContent>
    </Card>
  );
}