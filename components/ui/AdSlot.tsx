const AD_SIZES = {
  leaderboard: { label: 'Leaderboard · 728×90', h: 90, max: 728 },
  inline: { label: 'In-Article · responsive', h: 124, max: 680 },
  box: { label: 'Medium Rectangle · 300×250', h: 250, max: 300 },
  halfpage: { label: 'Half Page · 300×600', h: 600, max: 300 },
} as const

type AdVariant = keyof typeof AD_SIZES

export function AdSlot({
  variant = 'box',
  sticky = false,
}: {
  variant?: AdVariant
  sticky?: boolean
}) {
  const s = AD_SIZES[variant] || AD_SIZES.box

  return (
    <div
      className="crg-ad"
      data-ad={variant}
      style={{
        position: sticky ? 'sticky' : 'static',
        top: sticky ? '92px' : 'auto',
        width: '100%',
        maxWidth: s.max,
        margin: '0 auto',
      }}
    >
      <div className="crg-ad__tag">Advertisement</div>
      <div className="crg-ad__box" style={{ minHeight: s.h }}>
        <div className="crg-ad__inner">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.2" opacity=".35" />
            <rect x="3.5" y="3.5" width="17" height="17" rx="2" stroke="currentColor" strokeWidth="1.2" opacity=".35" />
          </svg>
          <span className="crg-ad__size">{s.label}</span>
          <span className="crg-ad__by">Google AdSense</span>
        </div>
      </div>
    </div>
  )
}
