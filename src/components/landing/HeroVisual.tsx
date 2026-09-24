/** Ilustración SVG del producto: personaje en cuadrícula + bloques — ancla visual del hero */
export function HeroVisual({ calm = false }: { calm?: boolean }) {
  return (
    <svg
      viewBox="0 0 640 420"
      role="img"
      aria-label="Personaje moviéndose en una cuadrícula guiado por bloques de programación"
      className="h-auto w-full max-w-xl"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={calm ? '#E8EEF5' : '#DCEBFF'} />
          <stop offset="100%" stopColor={calm ? '#EFF3F8' : '#E8F8EA'} />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#2E2E3A" floodOpacity="0.12" />
        </filter>
      </defs>

      <rect width="640" height="420" rx="36" fill="url(#sky)" />

      {/* Cuadrícula de juego */}
      <g transform="translate(48 56)">
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <rect
              key={`${row}-${col}`}
              x={col * 52}
              y={row * 52}
              width="48"
              height="48"
              rx="10"
              fill="#FFFFFF"
              stroke="#E2E8F2"
              strokeWidth="2"
            />
          )),
        )}

        {/* Meta */}
        <rect x={5 * 52 + 6} y={4 * 52 + 6} width="36" height="36" rx="10" fill="#FFD93D" />
        <path
          d="M278 228 l6 12 14 2 -10 10 2 14 -12 -6 -12 6 2 -14 -10 -10 14 -2 z"
          fill="#FFFFFF"
          transform="translate(6 6)"
        />

        {/* Camino suave */}
        <path
          d="M40 40 H144 V144 H248 V248 H300"
          fill="none"
          stroke="#4D96FF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="240"
          className={calm ? '' : 'origin-left'}
          style={
            calm
              ? undefined
              : {
                  animation: 'path-draw 1.6s var(--ease-calm) both',
                }
          }
        />

        {/* Personaje */}
        <g
          filter="url(#softShadow)"
          className={calm ? '' : 'animate-float'}
          transform="translate(16 8)"
        >
          <circle cx="40" cy="36" r="22" fill="#4D96FF" />
          <circle cx="33" cy="32" r="3.5" fill="#FFFFFF" />
          <circle cx="47" cy="32" r="3.5" fill="#FFFFFF" />
          <path
            d="M32 44 Q40 50 48 44"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="28" y="56" width="24" height="18" rx="8" fill="#6BCB77" />
        </g>
      </g>

      {/* Bloques de código */}
      <g filter="url(#softShadow)" transform="translate(390 90)">
        <rect width="190" height="52" rx="14" fill="#4D96FF" />
        <text x="24" y="33" fill="#FFFFFF" fontFamily="Nunito, sans-serif" fontSize="20" fontWeight="800">
          avanzar
        </text>
        <rect y="68" width="190" height="52" rx="14" fill="#6BCB77" />
        <text x="24" y="101" fill="#FFFFFF" fontFamily="Nunito, sans-serif" fontSize="20" fontWeight="800">
          girar derecha
        </text>
        <rect y="136" width="190" height="52" rx="14" fill="#FFD93D" />
        <text x="24" y="169" fill="#2E2E3A" fontFamily="Nunito, sans-serif" fontSize="20" fontWeight="800">
          repetir 3
        </text>
        <rect y="204" width="190" height="52" rx="14" fill="#FF9F5A" />
        <text x="24" y="237" fill="#FFFFFF" fontFamily="Nunito, sans-serif" fontSize="20" fontWeight="800">
          si hay camino
        </text>
      </g>
    </svg>
  )
}
