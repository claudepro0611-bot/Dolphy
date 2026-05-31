'use client'
import { useRouter } from 'next/navigation'

export default function TgHome() {
  const router = useRouter()

  const select = (role: string) => {
    localStorage.setItem('tg_role', role)
    router.push(`/tg/${role}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>

      <div style={{ width: 64, height: 64, background: '#C8F135', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#000', marginBottom: 16 }}>D</div>

      <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Dolphy</h1>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 48 }}>Yuk tashish platformasi</p>

      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={() => select('client')}
          style={{ padding: '20px 24px', background: '#C8F135', color: '#000', borderRadius: 16, border: 'none', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Mijoz</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>Buyurtma bering</div>
        </button>

        <button onClick={() => select('driver')}
          style={{ padding: '20px 24px', background: '#1A1A1A', color: '#fff', borderRadius: 16, border: '0.5px solid #2A2A2A', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Haydovchi</div>
          <div style={{ fontSize: 12, opacity: 0.4 }}>Zakaz qabul qiling</div>
        </button>
      </div>
    </div>
  )
}
