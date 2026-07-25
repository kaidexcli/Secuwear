'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EmergencyAlert {
  id: string
  device_id: string
  latitude: number
  longitude: number
  heart_rate: number | null
  status: string
  created_at: string
}

export default function AuthorityDispatch() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([])
  const supabase = createClient()

  useEffect(() => {
    // 1. Fetch existing active alerts
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('emergencies')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setAlerts(data)
    }

    fetchAlerts()

    // 2. Subscribe to Realtime emergency updates
    const channel = supabase
      .channel('realtime_emergencies')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergencies' },
        (payload) => {
          setAlerts((prev) => [payload.new as EmergencyAlert, ...prev])
          // Optional: Trigger audio alarm sound here
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emergencies' },
        (payload) => {
          setAlerts((prev) =>
            prev.map((item) => (item.id === payload.new.id ? (payload.new as EmergencyAlert) : item))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase
      .from('emergencies')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Authority Dispatch Command Center</h1>
      <p>Live Monitoring Feed (Supabase Realtime Active)</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#222', color: '#fff', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem' }}>Time</th>
            <th style={{ padding: '0.75rem' }}>Device ID</th>
            <th style={{ padding: '0.75rem' }}>GPS Coordinates</th>
            <th style={{ padding: '0.75rem' }}>BPM (Pulse)</th>
            <th style={{ padding: '0.75rem' }}>Status</th>
            <th style={{ padding: '0.75rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} style={{ borderBottom: '1px solid #ddd', background: alert.status === 'active' ? '#fff0f0' : '#fff' }}>
              <td style={{ padding: '0.75rem' }}>{new Date(alert.created_at).toLocaleTimeString()}</td>
              <td style={{ padding: '0.75rem' }}>{alert.device_id}</td>
              <td style={{ padding: '0.75rem' }}>
                <a 
                  href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: '#0066cc', textDecoration: 'underline' }}
                >
                  {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                </a>
              </td>
              <td style={{ padding: '0.75rem' }}>{alert.heart_rate ? `${alert.heart_rate} BPM` : 'N/A'}</td>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{alert.status.toUpperCase()}</td>
              <td style={{ padding: '0.75rem' }}>
                {alert.status === 'active' && (
                  <button onClick={() => updateStatus(alert.id, 'dispatched')}>Dispatch Unit</button>
                )}
                {alert.status === 'dispatched' && (
                  <button onClick={() => updateStatus(alert.id, 'resolved')}>Mark Resolved</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}