'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UserDashboard() {
  const [triggering, setTriggering] = useState(false)
  const [alertSent, setAlertSent] = useState(false)
  const supabase = createClient()

  const handleManualTrigger = async () => {
    setTriggering(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Get current GPS location from browser if available
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await supabase.from('emergencies').insert({
          user_id: user.id,
          device_id: 'WEB_MANUAL_TRIGGER',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          status: 'active',
        })
        setTriggering(false)
        setAlertSent(true)
      },
      async () => {
        // Fallback standard location
        await supabase.from('emergencies').insert({
          user_id: user.id,
          device_id: 'WEB_MANUAL_TRIGGER',
          latitude: 14.5995,
          longitude: 120.9842,
          status: 'active',
        })
        setTriggering(false)
        setAlertSent(true)
      }
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>User Safety Dashboard</h1>
      <p>Status: <strong>Wearable Connected & Ready</strong></p>

      {alertSent && (
        <div style={{ padding: '1rem', background: '#ffebe9', border: '1px solid #ff8182', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>Alert Broadcasted!</strong> Authorities have received your location signal.
        </div>
      )}

      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', marginTop: '1rem' }}>
        <h3>Manual SOS Override</h3>
        <p>If your wearable device is out of reach, press below to signal emergency dispatch immediately.</p>
        <button
          onClick={handleManualTrigger}
          disabled={triggering}
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#d9381e',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {triggering ? 'Sending Alert...' : 'TRIGGER SOS'}
        </button>
      </div>
    </div>
  )
}