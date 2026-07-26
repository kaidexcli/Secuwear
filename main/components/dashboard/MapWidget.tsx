"use client"

import { useState, useEffect } from 'react'

export default function MapWidget({ mapMode }: { mapMode: 'default' | 'weather' | 'traffic' | 'flood' }) {
  // Defaults to Quezon City before GPS lock is acquired
  const [location, setLocation] = useState({ lat: 14.6760, lon: 121.0437 })
  const [loading, setLoading] = useState(true)
  const [gpsError, setGpsError] = useState<string | null>(null)

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          setLoading(false)
          setGpsError(null)
        },
        (error) => {
          console.error("GPS Error:", error)
          setGpsError("Enable location services to track your device.")
          setLoading(false)
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      )

      return () => navigator.geolocation.clearWatch(watchId)
    } else {
      setGpsError("Geolocation is not supported by your browser.")
      setLoading(false)
    }
  }, [])

  let iframeSrc = ""
  const offset = 0.015

  if (mapMode === 'weather') {
    // Windy.com Live Weather Radar
    iframeSrc = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=11&overlay=rain&product=ecmwf&level=surface&lat=${location.lat}&lon=${location.lon}`
  } else if (mapMode === 'traffic') {
    // Waze Live Traffic Flow
    iframeSrc = `https://embed.waze.com/iframe?zoom=15&lat=${location.lat}&lon=${location.lon}&ct=livemap`
  } else if (mapMode === 'flood') {
    // Reverted: Windy.com Rain Accumulation (Proxy for Flood Risk/Inundation)
    iframeSrc = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=11&overlay=rainAccu&product=ecmwf&level=surface&lat=${location.lat}&lon=${location.lon}`
  } else {
    // Default OpenStreetMap
    iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lon - offset}%2C${location.lat - offset}%2C${location.lon + offset}%2C${location.lat + offset}&layer=mapnik&marker=${location.lat}%2C${location.lon}`
  }

  return (
    <div className="lg:col-span-2 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative group h-125 lg:h-auto">
      
      {/* Map Status Overlay (Fixed at bottom-6) */}
      <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm pointer-events-none">
        {loading ? (
          <>
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">Acquiring GPS Lock...</span>
          </>
        ) : gpsError ? (
          <>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-slate-700">{gpsError}</span>
          </>
        ) : (
          <>
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping"></div>
            <span className="text-sm font-medium text-slate-700">Live GPS Active</span>
          </>
        )}
      </div>

      <iframe 
        width="100%" 
        height="100%" 
        className="flex-1 border-0"
        src={iframeSrc}
        title="Live Location Map"
      ></iframe>
    </div>
  )
}
