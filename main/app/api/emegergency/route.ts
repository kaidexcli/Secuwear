import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client to bypass RLS for hardware webhooks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-api-key')
    
    // Simple secret token check to prevent unauthorized spam
    if (authHeader !== process.env.HARDWARE_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized hardware payload' }, { status: 401 })
    }

    const body = await request.json()
    const { device_id, latitude, longitude, heart_rate } = body

    if (!device_id || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Look up user associated with this device_id
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('device_id', device_id)
      .single()

    // Insert emergency record
    const { data: emergency, error } = await supabaseAdmin
      .from('emergencies')
      .insert({
        user_id: profile?.id || null,
        device_id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        heart_rate: heart_rate ? parseInt(heart_rate) : null,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, emergencyId: emergency.id }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}