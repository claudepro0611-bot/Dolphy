const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#FFF3E0', text: '#E65100' },
  accepted:  { bg: '#E3F2FD', text: '#1565C0' },
  on_way:    { bg: '#EEF9CC', text: '#5A7A00' },
  completed: { bg: '#E8F5E9', text: '#2E7D32' },
  delivered: { bg: '#E8F5E9', text: '#2E7D32' },
  cancelled: { bg: '#FFEBEE', text: '#C62828' },
}

const STATUS_TEXT: Record<string, string> = {
  pending:   'Kutilmoqda',
  accepted:  'Qabul qilindi',
  on_way:    'Yo\'lda',
  completed: 'Yetkazildi',
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
      }}
      className={className}
    >
      {STATUS_TEXT[status] ?? status}
    </span>
  )
}
