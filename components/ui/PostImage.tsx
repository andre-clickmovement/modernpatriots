import Image from 'next/image'
import { cn } from '@/lib/cn'

type PostImageProps = {
  src?: string | null
  alt: string
  ratio?: string
  rounded?: boolean
  className?: string
  priority?: boolean
}

export function PostImage({
  src,
  alt,
  ratio = '16 / 9',
  rounded = false,
  className,
  priority = false,
}: PostImageProps) {
  if (!src) {
    return (
      <div
        className={cn('relative w-full overflow-hidden bg-paper-2', className)}
        style={{
          aspectRatio: ratio,
          borderRadius: rounded ? '6px' : 0,
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(15,28,58,.10) 0 1px, transparent 1px 11px)',
        }}
      >
        <span className="absolute bottom-2.5 left-2.5 font-ui text-[10px] font-semibold uppercase tracking-wider text-muted bg-white/80 px-2 py-1 rounded-sm">
          {alt}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: ratio, borderRadius: rounded ? '6px' : 0 }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 720px"
        priority={priority}
      />
    </div>
  )
}
