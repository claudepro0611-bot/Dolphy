const STEPS = [
  { key: 'accepted',  label: 'Qabul' },
  { key: 'on_way',   label: 'Yo\'lda' },
  { key: 'completed', label: 'Yetkazildi' },
]

interface OrderProgressProps {
  status: string
  className?: string
}

export function OrderProgress({ status, className }: OrderProgressProps) {
  const current = STEPS.findIndex(s => s.key === status)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className={className}>
      {STEPS.map((step, i) => (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: i <= current ? '#0A0A0A' : '#E5E5E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.3s',
          }}>
            {i <= current ? (
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#BBBBBB', display: 'block' }} />
            )}
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1,
              height: 2,
              background: i < current ? '#0A0A0A' : '#E5E5E5',
              margin: '0 4px',
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}
