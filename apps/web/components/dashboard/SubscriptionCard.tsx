'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown, Zap, Settings, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'enterprise';
  isActive: boolean;
  endsAt?: string;
  features: string[];
}

interface UsageStats {
  current: {
    ideasViewed: number;
    apiCalls: number;
  };
  limits: {
    ideasViewed: number;
    apiCalls: number;
  };
  resetDate: string;
}

export function SubscriptionCard() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const { toast } = useToast();

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to view subscription details.",
          variant: "destructive",
        });
        return;
      }

      // Fetch subscription status
      const [statusRes, usageRes] = await Promise.all([
        fetch('/api/subscriptions/status', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/subscriptions/usage', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (statusRes.ok && usageRes.ok) {
        const statusData = await statusRes.json();
        const usageData = await usageRes.json();
        
        setSubscription(statusData);
        setUsage(usageData);
      } else {
        throw new Error('Failed to fetch subscription data');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: 'premium' | 'enterprise') => {
    try {
      setUpgrading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to upgrade your subscription.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tier })
      });

      if (response.ok) {
        const { checkoutUrl } = await response.json();
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: "Upgrade failed",
        description: "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setManagingSubscription(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to manage your subscription.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/subscriptions/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      } else {
        throw new Error('Failed to create portal session');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management portal.",
        variant: "destructive",
      });
    } finally {
      setManagingSubscription(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  if (loading) {
    return (
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading subscription...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!subscription || !usage) {
    return (
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-red-400">Subscription data unavailable</CardTitle>
          <CardDescription>
            Unable to load subscription information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchSubscriptionData} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 'enterprise':
        return <Zap className="h-5 w-5 text-purple-400" />;
      default:
        return null;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'enterprise':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Subscription</CardTitle>
            {getTierIcon(subscription.tier)}
          </div>
          <Badge 
            className={`${getTierColor(subscription.tier)} text-white border-none`}
          >
            {subscription.tier.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>
          {subscription.isActive 
            ? subscription.endsAt 
              ? `Active until ${new Date(subscription.endsAt).toLocaleDateString()}`
              : 'Active subscription'
            : 'No active subscription'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Usage Statistics */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Monthly Usage</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ideas Viewed</span>
                <span>
                  {usage.current.ideasViewed} / {usage.limits.ideasViewed === -1 ? '∞' : usage.limits.ideasViewed}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${usage.limits.ideasViewed === -1 ? 20 : getUsagePercentage(usage.current.ideasViewed, usage.limits.ideasViewed)}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>API Calls</span>
                <span>
                  {usage.current.apiCalls} / {usage.limits.apiCalls === -1 ? '∞' : usage.limits.apiCalls}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${usage.limits.apiCalls === -1 ? 20 : getUsagePercentage(usage.current.apiCalls, usage.limits.apiCalls)}%` 
                  }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Usage resets on {new Date(usage.resetDate).toLocaleDateString()}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Current Features</h4>
          <div className="space-y-1">
            {subscription.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {subscription.tier === 'free' && (
            <div className="space-y-2">
              <Button
                onClick={() => handleUpgrade('premium')}
                disabled={upgrading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {upgrading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                Upgrade to Premium - $29/month
              </Button>
              
              <Button
                onClick={() => handleUpgrade('enterprise')}
                disabled={upgrading}
                variant="outline"
                className="w-full border-purple-500/50 hover:bg-purple-500/10"
              >
                {upgrading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Upgrade to Enterprise - $99/month
              </Button>
            </div>
          )}

          {subscription.tier === 'premium' && (
            <Button
              onClick={() => handleUpgrade('enterprise')}
              disabled={upgrading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {upgrading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Upgrade to Enterprise - $99/month
            </Button>
          )}

          {subscription.tier !== 'free' && subscription.isActive && (
            <Button
              onClick={handleManageSubscription}
              disabled={managingSubscription}
              variant="outline"
              className="w-full"
            >
              {managingSubscription ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}