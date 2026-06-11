import { cn } from '@/lib/cn'

export function Container({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('crg-wrap', className)}>{children}</div>
}
