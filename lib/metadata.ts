import { Metadata } from 'next'

const siteConfig = {
  name: 'Interview Coach — AI Practice + Expert Human Coaches',
  description: 'Practice with AI mock interviews and book 1-on-1 sessions with real expert coaches. Get instant feedback, improve faster, and land your dream job.',
  url: 'https://interview-coach.vercel.app',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/interviewcoach',
    github: 'https://github.com/interviewcoach',
  },
}

export function createMetadata({
  title,
  description,
  image,
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const metaDescription = description || siteConfig.description
  const metaImage = image || siteConfig.ogImage

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [
      'interview preparation',
      'AI interview coach',
      'mock interviews',
      'job interview practice',
      'interview feedback',
      'AI coaching',
      'human coaching',
      'career coaching',
      'career preparation',
      'interview simulator',
      'Claude AI',
      'technical interview',
      'behavioral interview',
      'interview coach',
      'expert coach',
      'Google interview prep',
      'Amazon interview prep',
      'remote jobs',
    ],
    authors: [{ name: 'Interview Coach' }],
    creator: 'Interview Coach',
    publisher: 'Interview Coach',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@interviewcoach',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export { siteConfig }
