import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import JoinEventPageClient from '@/features/events/components/JoinEventPageClient'
import { BASE_URL } from '@/_vars/const'
import type { Event } from '@/shared/types'
import { headers } from 'next/headers'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    return {
      title: 'Event Tidak Ditemukan | TDCTF',
    }
  }

  const headersList = headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const dynamicBaseUrl = `${protocol}://${host}`

  const title = `Gabung Event: ${event.name} | TDCTF`
  const description = event.description || 'Ikuti tantangan CTF seru di event ini!'
  const rawImageUrl = event.image_url || 'https://raw.githubusercontent.com/tdctf/assets/refs/heads/main/event/active_tdctf.png'
  
  let imageUrl = rawImageUrl
  if (!/^https?:\/\//i.test(rawImageUrl)) {
    imageUrl = rawImageUrl.startsWith('/')
      ? `${dynamicBaseUrl}${rawImageUrl}`
      : `${dynamicBaseUrl}/${rawImageUrl}`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${dynamicBaseUrl}/join/${id}`,
      siteName: 'TDCTF',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function Page({ params }: Props) {
  const { id } = params

  const { data: eventData, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !eventData) {
    notFound()
  }

  const normalizedEvent: Event = {
    ...eventData,
    join_mode: (eventData.join_mode === 'open' || eventData.join_mode === 'request' || eventData.join_mode === 'key')
      ? eventData.join_mode
      : 'open',
    created_at: eventData.created_at ?? undefined,
    updated_at: eventData.updated_at ?? undefined,
  }

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-gray-100 flex flex-col justify-between overflow-x-hidden">
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      
      <main className="relative flex-1 flex items-center justify-center p-4 md:p-8">
        <JoinEventPageClient event={normalizedEvent} />
      </main>
    </div>
  )
}
