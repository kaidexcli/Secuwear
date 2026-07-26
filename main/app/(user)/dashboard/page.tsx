"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Siren, LifeBuoy, Bell, BatteryMedium, Wifi } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import MapWidget from '@/components/dashboard/MapWidget'

export default function UserDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [mapMode, setMapMode] = useState<'default' | 'weather' | 'traffic' | 'flood'>('default')
  
  // Tracks which specific emergency is active, or null if none
  const [activeEmergency, setActiveEmergency] = useState<'crime' | 'rescue' | null>(null)

  const handleSOS = (type: 'crime' | 'rescue') => {
    setActiveEmergency(type)
    // Auto-reset after 5 seconds for prototype demonstration
    setTimeout(() => setActiveEmergency(null), 5000) 
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        mapMode={mapMode}
        setMapMode={setMapMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Safety Dashboard</h1>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              SecuWear System Online
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Wifi size={16} className="text-blue-600" />
                <span className="text-slate-700">Connected</span>
              </div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <BatteryMedium size={16} className="text-slate-400" />
                <span className="text-slate-700">88%</span>
              </div>
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors bg-white rounded-full border border-slate-200 shadow-sm">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto z-10">
          
          <MapWidget mapMode={mapMode} />

          {/* Action Sidebar */}
          <div className="space-y-6 flex flex-col">
            
            {/* Split Emergency Override Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-1 text-slate-900">Emergency Dispatch</h2>
              <p className="text-sm mb-6 text-slate-500">
                Select the appropriate emergency type to dispatch your GPS coordinates to authorities.
              </p>

              <div className="space-y-4">
                
                {/* Crime Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSOS('crime')}
                  className={`w-full p-4 flex items-center justify-start gap-4 rounded-2xl transition-all duration-300 border-2 ${
                    activeEmergency === 'crime' 
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30' 
                      : 'bg-white border-red-100 hover:border-red-200 hover:bg-red-50'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${activeEmergency === 'crime' ? 'bg-white/20' : 'bg-red-100'}`}>
                    <Siren size={24} className={activeEmergency === 'crime' ? 'text-white animate-pulse' : 'text-red-600'} />
                  </div>
                  <div className="text-left">
                    <div className={`text-lg font-bold tracking-wide uppercase ${activeEmergency === 'crime' ? 'text-white' : 'text-red-600'}`}>Crime SOS</div>
                    <div className={`text-xs font-medium ${activeEmergency === 'crime' ? 'text-red-100' : 'text-slate-500'}`}>Police & Security Response</div>
                  </div>
                </motion.button>

                {/* Rescue Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSOS('rescue')}
                  className={`w-full p-4 flex items-center justify-start gap-4 rounded-2xl transition-all duration-300 border-2 ${
                    activeEmergency === 'rescue' 
                      ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30' 
                      : 'bg-white border-orange-100 hover:border-orange-200 hover:bg-orange-50'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${activeEmergency === 'rescue' ? 'bg-white/20' : 'bg-orange-100'}`}>
                    <LifeBuoy size={24} className={activeEmergency === 'rescue' ? 'text-white animate-pulse' : 'text-orange-500'} />
                  </div>
                  <div className="text-left">
                    <div className={`text-lg font-bold tracking-wide uppercase ${activeEmergency === 'rescue' ? 'text-white' : 'text-orange-600'}`}>Rescue SOS</div>
                    <div className={`text-xs font-medium ${activeEmergency === 'rescue' ? 'text-orange-100' : 'text-slate-500'}`}>Medical & Disaster Response</div>
                  </div>
                </motion.button>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
