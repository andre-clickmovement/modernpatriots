'use client'

export function ShareRow() {
  const icons = [
    { k: 'x', path: 'M4 4l16 16M20 4L4 20' },
    { k: 'fb', path: 'M13 6h3V3h-3a4 4 0 00-4 4v2H6v3h3v8h3v-8h3l1-3h-4V7a1 1 0 011-1z' },
    { k: 'link', path: 'M9 15l6-6M8 13l-2 2a3 3 0 104 4l2-2M16 11l2-2a3 3 0 10-4-4l-2 2' },
  ]

  return (
    <div className="crg-share">
      {icons.map((i) => (
        <button key={i.k} type="button" aria-label={`Share ${i.k}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d={i.path}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}
