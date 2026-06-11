export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`crg-kicker ${className || ''}`}>{children}</span>
}
