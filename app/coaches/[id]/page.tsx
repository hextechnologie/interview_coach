import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge, Button, Card } from '@/components/ui'
import { getCoachById, mockCoaches } from '@/lib/coach-marketplace'
import { Calendar, Clock3, Star } from 'lucide-react'

export default function CoachProfilePage({ params }: { params: { id: string } }) {
  const coach = getCoachById(params.id)

  if (!coach) notFound()

  const similar = mockCoaches.filter((item) => item.id !== coach.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Card className="border-primary/20 bg-card/80">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div>
              <div className={`mb-5 h-28 rounded-3xl bg-gradient-to-r ${coach.avatar}`} />
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-4xl font-bold">{coach.name}</h1>
                  <p className="mt-2 text-lg text-gray-300">{coach.title}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1 text-yellow-300"><Star className="h-4 w-4 fill-current" />{coach.rating} ({coach.reviewCount})</span>
                    <span>{coach.yearsExperience} years experience</span>
                    <span>{coach.sessionsBooked}+ sessions</span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-400">Session price</p>
                  <p className="text-3xl font-bold text-primary">${coach.price}/hr</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {coach.specializations.map((spec) => <Badge key={spec}>{spec}</Badge>)}
                {coach.availableNow && <Badge variant="success">Available Now</Badge>}
              </div>
            </div>

            <Card className="h-fit border-primary/20 bg-background/50 sticky top-6">
              <p className="mb-3 text-sm text-gray-400">Ready to practice with this coach?</p>
              <Link href={`/book/${coach.id}`}>
                <Button variant="primary" fullWidth>Book a Session</Button>
              </Link>
              <Button variant="outline" fullWidth className="mt-3">Free 15-min Intro Call</Button>
            </Card>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card>
              <h2 className="mb-3 text-2xl font-bold">About</h2>
              <p className="text-gray-300">{coach.about}</p>
            </Card>

            <Card>
              <h2 className="mb-4 text-2xl font-bold">Specializations and skills</h2>
              <div className="flex flex-wrap gap-2">
                {coach.specializations.map((spec) => <Badge key={spec}>{spec}</Badge>)}
                {coach.languages.map((lang) => <Badge key={lang} variant="success">{lang}</Badge>)}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-2xl font-bold">Experience timeline</h2>
              <div className="space-y-4">
                {coach.timeline.map((item) => (
                  <div key={`${item.company}-${item.years}`} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.role}</p>
                        <p className="text-sm text-gray-400">{item.company}</p>
                      </div>
                      <Badge>{item.years}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-2xl font-bold">Reviews</h2>
              <div className="space-y-4">
                {coach.reviews.map((review) => (
                  <div key={`${review.author}-${review.comment}`} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-sm text-gray-500">{review.role}</p>
                      </div>
                      <span className="flex items-center gap-1 text-yellow-300"><Star className="h-4 w-4 fill-current" />{review.rating}</span>
                    </div>
                    <p className="text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-xl font-bold">Availability calendar</h2>
              <div className="space-y-3">
                {coach.availability.map((slot) => (
                  <div key={slot.date} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="mb-2 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><span className="font-semibold">{slot.label}</span></div>
                    <div className="flex flex-wrap gap-2">
                      {slot.slots.map((time) => <Badge key={time}>{time}</Badge>)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-bold">Similar coaches</h2>
              <div className="space-y-3">
                {similar.map((item) => (
                  <Link key={item.id} href={`/coaches/${item.id}`} className="block rounded-xl border border-border bg-background/40 p-4 hover:border-primary/40">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-400">{item.title}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-yellow-300">⭐ {item.rating}</span>
                      <span className="text-primary">${item.price}/hr</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-20 px-4 lg:hidden">
        <Link href={`/book/${coach.id}`}>
          <Button variant="primary" fullWidth className="shadow-lg">Book a Session</Button>
        </Link>
      </div>
    </div>
  )
}