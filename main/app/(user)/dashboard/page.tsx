"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, Bell, BatteryMedium, Wifi } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import MapWidget from '@/components/dashboard/MapWidget'

export default function UserDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [mapMode, setMapMode] = useState<'default' | 'weather' | 'traffic'>('default')
  const [sosActive, setSosActive] = useState(false)

  const handleSOS = () => {
    setSosActive(true)
    setTimeout(() => setSosActive(false), 5000) 
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
            
            {/* Minimalist SOS Card */}
            <motion.div 
              className={`relative overflow-hidden rounded-3xl border p-8 flex flex-col items-center justify-center text-center transition-colors duration-500 shadow-sm ${
                sosActive ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
              }`}
            >
              <ShieldAlert size={48} className={`mb-4 ${sosActive ? 'text-red-600 animate-bounce' : 'text-slate-800'}`} />
              <h2 className="text-xl font-bold mb-2">Emergency Override</h2>
              <p className="text-sm mb-8 text-slate-500">
                Triggering this will immediately dispatch your GPS coordinates to response authorities.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSOS}
                className={`w-full py-4 rounded-2xl font-bold tracking-widest uppercase transition-all duration-300 ${
                  sosActive 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                }`}
              >
                {sosActive ? 'SOS Dispatched' : 'Trigger SOS'}
              </motion.button>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  )
}
