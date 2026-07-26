"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldAlert, 
  Map as MapIcon, 
  Activity, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  Bell, 
  BatteryMedium, 
  Wifi 
} from 'lucide-react'

export default function UserDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sosActive, setSosActive] = useState(false)

  const handleSOS = () => {
    setSosActive(true)
    // Add future webhook trigger here to alert dispatch
    setTimeout(() => setSosActive(false), 5000) // Auto-reset for demo purposes
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      
      {/* Sidebar */}
      <motion.nav 
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="h-full bg-zinc-950 border-r border-white/10 flex flex-col z-20 relative"
      >
        <div className="p-4 flex items-center justify-between mt-2">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
              >
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xl pb-1">
                  S
                </div>
                <span className="text-xl font-bold tracking-tight">SecuWear</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-zinc-800 rounded-xl transition-colors shrink-0 text-zinc-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 py-6 px-3 space-y-2">
          <NavItem icon={<MapIcon size={20} />} label="Live Map" isOpen={isSidebarOpen} active />
          <NavItem icon={<Activity size={20} />} label="Vitals History" isOpen={isSidebarOpen} />
          <NavItem icon={<User size={20} />} label="Profile" isOpen={isSidebarOpen} />
          <NavItem icon={<Settings size={20} />} label="Device Settings" isOpen={isSidebarOpen} />
        </div>

        <div className="p-3 border-t border-white/10">
          <NavItem icon={<LogOut size={20} />} label="Sign Out" isOpen={isSidebarOpen} textClass="text-zinc-400 hover:text-red-400" />
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>

        {/* Top Header */}
        <header className="h-20 bg-zinc-950/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Safety Dashboard</h1>
            <p className="text-sm text-zinc-400 flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Online & Monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Hardware Status Indicators */}
            <div className="flex items-center gap-4 bg-zinc-900/80 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity size={16} className="text-red-400" />
                <span>72 BPM</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Wifi size={16} className="text-green-400" />
                <span className="text-zinc-400">Connected</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <BatteryMedium size={16} className="text-zinc-300" />
                <span className="text-zinc-400">88%</span>
              </div>
            </div>
            
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors bg-zinc-900 rounded-full border border-white/5">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto z-10">
          
          {/* Map Container (Spans 2 columns) */}
          <div className="lg:col-span-2 flex flex-col bg-zinc-900/40 border border-white/10 rounded-4xl overflow-hidden shadow-2xl relative group">
            <div className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping"></div>
               <span className="text-sm font-medium">Tracking Active</span>
            </div>
            
            {/* Interactive Dark Mode Map Embedded (Quezon City Default) */}
            <iframe 
              width="100%" 
              height="100%" 
              style={{ filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
              className="flex-1 border-0"
              src="https://www.openstreetmap.org/export/embed.html?bbox=120.9702%2C14.5958%2C121.1172%2C14.7562&layer=mapnik&marker=14.6760%2C121.0437"
              title="Live Location Map"
            ></iframe>
          </div>

          {/* Action & Status Sidebar */}
          <div className="space-y-6 flex flex-col">
            
            {/* SOS Trigger Card */}
            <motion.div 
              className={`relative overflow-hidden rounded-4xl border p-8 flex flex-col items-center justify-center text-center transition-colors duration-500 ${
                sosActive ? 'bg-red-600 border-red-500' : 'bg-zinc-900/80 border-red-500/30'
              }`}
            >
              {/* Pulsing background effect */}
              <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
              
              <ShieldAlert size={48} className={`mb-4 ${sosActive ? 'text-white' : 'text-red-500'}`} />
              <h2 className="text-xl font-bold mb-2">Manual Override</h2>
              <p className={`text-sm mb-8 ${sosActive ? 'text-red-100' : 'text-zinc-400'}`}>
                Triggering this will immediately dispatch your current GPS coordinates and vital metrics to authorities.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSOS}
                className={`w-full py-4 rounded-2xl font-bold tracking-widest uppercase transition-all duration-300 shadow-xl ${
                  sosActive 
                    ? 'bg-white text-red-600' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                }`}
              >
                {sosActive ? 'SOS Dispatched' : 'Trigger SOS'}
              </motion.button>
            </motion.div>

            {/* Hardware Metrics Summary Card */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-4xl p-6 flex-1">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Settings size={18} className="text-zinc-400" />
                Device Diagnostics
              </h3>
              
              <div className="space-y-4">
                <MetricRow label="Pulse Sensor" value="Active (Analog)" status="good" />
                <MetricRow label="GPS Module" value="Lock Acquired" status="good" />
                <MetricRow label="GSM Network" value="Signal Strong" status="good" />
                <MetricRow label="Last Sync" value="Just now" status="neutral" />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

// Reusable Sidebar Item Component
function NavItem({ icon, label, isOpen, active = false, textClass = "" }: any) {
  return (
    <button className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
    } ${textClass}`}>
      <div className="shrink-0">{icon}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.span 
            initial={{ opacity: 0, width: 0 }} 
            animate={{ opacity: 1, width: 'auto' }} 
            exit={{ opacity: 0, width: 0 }}
            className="whitespace-nowrap font-medium text-sm"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

// Reusable Metric Row Component
function MetricRow({ label, value, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white">{value}</span>
        <div className={`w-2 h-2 rounded-full ${
          status === 'good' ? 'bg-green-500' : 
          status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
        }`}></div>
      </div>
    </div>
  )
}
