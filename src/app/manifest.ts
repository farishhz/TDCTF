import { MetadataRoute } from 'next'
import APP from '@/config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP.shortName} - Capture The Flag Platform`,
    short_name: APP.shortName,
    description: APP.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
