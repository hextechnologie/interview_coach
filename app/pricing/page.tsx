'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui'
import { Sparkles, Check } from 'lucide-react'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    interviews: 3,
    priceId: null,
    tier: 'free',
    features: [
      '3 interviews per month',
      'Basic AI feedback',
      'Limited job roles',
      'Score tracking',
    ],
  },
  {
    name: 'Basic',
    price: 9,
    interviews: 20,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
    tier: 'basic',
    popular: true,
    features: [
      '20 interviews per month',
      'Detailed AI feedback',
      'All job roles',
      'Progress tracking',
      'Session history',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: 19,
    interviews: '∞',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    tier: 'pro',
    features: [
      'Unlimited interviews',
      'Advanced AI feedback',
      'All job roles',
      'Detailed analytics',
      'Export reports',
      'Priority support',
      'Custom interview scenarios',
    ],
  },
]

export default function PricingPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string | null, tier: string) => {
    if (!user) {
      router.push('/signup')
      return
    }

    if (!priceId) {
      return // Free plan, no action needed
    }

    setLoading(tier)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    if (!profile?.stripe_customer_id) return

    setLoading('manage')

    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </Link>
            {user && (
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-400">
            Start practicing with AI-powered interview coaching
          </p>
        </div>

        {profile && profile.subscription_tier !== 'free' && (
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="bg-primary/5 border-primary/30 text-center p-6">
              <p className="text-lg mb-4">
                You're currently on the <strong className="text-primary">{profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)}</strong> plan
              </p>
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                loading={loading === 'manage'}
              >
                Manage Subscription
              </Button>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={`relative p-8 ${
                plan.popular ? 'border-primary shadow-xl shadow-primary/20' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="success">Most Popular</Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">{plan.interviews} interviews/month</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                fullWidth
                onClick={() => handleSubscribe(plan.priceId || null, plan.tier)}
                loading={loading === plan.tier}
                disabled={profile?.subscription_tier === plan.tier}
              >
                {profile?.subscription_tier === plan.tier
                  ? 'Current Plan'
                  : plan.price === 0
                  ? 'Get Started'
                  : 'Subscribe'}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">All plans include:</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>AI-powered feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Score tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Progress analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
