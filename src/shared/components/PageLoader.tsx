import Loader from './Loader'

type PageLoaderProps = {
  color?: string
}

export default function PageLoader({ color = 'text-blue-500' }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100dvh - 220px)' }}>
      <Loader color={color} />
    </div>
  )
}
