'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge, Button, Card } from '@/components/ui'
import { marketplaceSpecializations, mockCoaches } from '@/lib/coach-marketplace'
import { Search, SlidersHorizontal, Sparkles, Star } from 'lucide-react'

export default function CoachesPage() {
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState(250)
  const [minRating, setMinRating] = useState(0)
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([])
  const [language, setLanguage] = useState('all')
  const [availability, setAvailability] = useState('all')
  const [sortBy, setSortBy] = useState('rating')

  const filteredCoaches = useMemo(() => {
    const results = mockCoaches.filter((coach) => {
      const matchesSearch = [coach.name, coach.title, coach.specializations.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesPrice = coach.price <= maxPrice
      const matchesRating = coach.rating >= minRating
      const matchesSpecs = selectedSpecs.length === 0 || selectedSpecs.every((spec) => coach.specializations.includes(spec))
      const matchesLanguage = language === 'all' || coach.languages.includes(language)
      const matchesAvailability = availability === 'all' || (availability === 'today' ? coach.availableNow : coach.availability.length > 0)

      return matchesSearch && matchesPrice && matchesRating && matchesSpecs && matchesLanguage && matchesAvailability
    })

    return results.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'most-booked') return b.sessionsBooked - a.sessionsBooked
      if (sortBy === 'newest') return a.name.localeCompare(b.name)
      return b.rating - a.rating
    })
  }, [availability, language, maxPrice, minRating, search, selectedSpecs, sortBy])

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) => prev.includes(spec) ? prev.filter((item) => item !== spec) : [...prev, spec])
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold">Find a coach</span>
            </div>
            <h1 className="text-4xl font-bold">Browse expert interview coaches</h1>
            <p className="mt-2 text-gray-400">Search by specialization, availability, language, and rating.</p>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3">
            <Search className="h-5 w-5 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coach, title, or specialization" className="w-full bg-transparent text-white outline-none" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="h-fit bg-card/80 backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Filters</h2>
            </div>

            <div className="space-y-5 text-sm">
              <div>
                <label className="mb-2 block text-gray-300">Price up to ${maxPrice}</label>
                <input type="range" min="50" max="250" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="mb-2 block text-gray-300">Rating</label>
                <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2">
                  <option value={0}>All ratings</option>
                  <option value={4}>4+ stars</option>
                  <option value={3}>3+ stars</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-gray-300">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {marketplaceSpecializations.map((spec) => (
                    <button key={spec} type="button" onClick={() => toggleSpec(spec)} className={`rounded-full px-3 py-2 ${selectedSpecs.includes(spec) ? 'bg-primary text-white' : 'border border-border text-gray-300'}`}>
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-gray-300">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2">
                  <option value="all">All languages</option>
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-gray-300">Availability</label>
                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2">
                  <option value="all">Any time</option>
                  <option value="today">Available today</option>
                  <option value="week">Available this week</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-gray-300">Sort by</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2">
                  <option value="rating">Rating</option>
                  <option value="price">Price</option>
                  <option value="most-booked">Most booked</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCoaches.map((coach, index) => (
              <motion.div key={coach.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="h-full bg-card/80 backdrop-blur border-primary/10">
                  <div className={`mb-4 h-20 rounded-2xl bg-gradient-to-r ${coach.avatar}`} />
                  <div className="-mt-10 mb-4 flex items-end justify-between">
                    <div className="rounded-full border-4 border-background bg-card px-4 py-3 font-bold">{coach.name.split(' ').map((n) => n[0]).join('')}</div>
                    {coach.availableNow && <Badge variant="success">Available Now</Badge>}
                  </div>

                  <h2 className="text-xl font-bold">{coach.name}</h2>
                  <p className="mt-1 text-sm text-gray-400">{coach.title}</p>

                  <div className="mt-3 flex items-center gap-2 text-sm text-yellow-300">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{coach.rating}</span>
                    <span className="text-gray-500">({coach.reviewCount} reviews)</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {coach.specializations.map((spec) => <Badge key={spec}>{spec}</Badge>)}
                  </div>

                  <p className="mt-4 text-sm text-gray-300">{coach.bio}</p>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Price per session</p>
                      <p className="text-2xl font-bold text-primary">${coach.price}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>{coach.languages.join(' • ')}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2">
                    <Link href={`/book/${coach.id}`}>
                      <Button variant="primary" fullWidth>Book Session</Button>
                    </Link>
                    <Link href={`/coaches/${coach.id}`}>
                      <Button variant="outline" fullWidth>View Profile</Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}