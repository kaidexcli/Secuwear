"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Map as MapIcon, User, Settings, LogOut, Menu, CloudRain, Car, Waves, Sparkles, Shield } from 'lucide-react'

export default function Sidebar({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  mapMode, 
  setMapMode 
}: any) {
  const pathname = usePathname()

  return (
    <motion.nav 
      animate={{ width: isSidebarOpen ? 260 : 80 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="h-full bg-white border-r border-slate-200 flex flex-col z-20 relative shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
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
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl pb-1">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">SecuWear</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0 text-slate-500 hover:text-slate-900"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        
        {/* Main Application Modules */}
        <div className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {isSidebarOpen ? "Modules" : ""}
        </div>
        <NavLink 
          href="/dashboard" 
          icon={<Shield size={20} />} 
          label="Safety Dashboard" 
          isOpen={isSidebarOpen} 
          active={pathname === '/dashboard'} 
        />
        <NavLink 
          href="/ai" 
          icon={<Sparkles size={20} />} 
          label="Survival AI" 
          isOpen={isSidebarOpen} 
          active={pathname === '/ai'} 
        />

        {/* Map Layers (Only visible when on the dashboard) */}
        {pathname === '/dashboard' && (
          <>
            <div className="px-3 pt-6 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isSidebarOpen ? "Map Layers" : ""}
            </div>
            <NavItem icon={<MapIcon size={20} />} label="Standard Tracking" isOpen={isSidebarOpen} active={mapMode === 'default'} onClick={() => setMapMode('default')} />
            <NavItem icon={<CloudRain size={20} />} label="Live Weather" isOpen={isSidebarOpen} active={mapMode === 'weather'} onClick={() => setMapMode('weather')} />
            <NavItem icon={<Waves size={20} />} label="Flood Risk" isOpen={isSidebarOpen} active={mapMode === 'flood'} onClick={() => setMapMode('flood')} />
            <NavItem icon={<Car size={20} />} label="Traffic Flow" isOpen={isSidebarOpen} active={mapMode === 'traffic'} onClick={() => setMapMode('traffic')} />
          </>
        )}

        {/* Account Settings */}
        <div className="px-3 pt-6 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {isSidebarOpen ? "Account" : ""}
        </div>
        <NavItem icon={<User size={20} />} label="Profile" isOpen={isSidebarOpen} />
        <NavItem icon={<Settings size={20} />} label="Settings" isOpen={isSidebarOpen} />
      </div>

      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <NavItem icon={<LogOut size={20} />} label="Sign Out" isOpen={isSidebarOpen} textClass="text-slate-500 hover:text-red-600" />
      </div>
    </motion.nav>
  )
}

// Used for switching Map Modes (No URL change)
function NavItem({ icon, label, isOpen, active = false, onClick, textClass = "" }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'} ${textClass}`}>
      <div className="shrink-0">{icon}</div>
      <AnimatePresence>
        {isOpen && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap text-sm">{label}</motion.span>}
      </AnimatePresence>
    </button>
  )
}

// Used for switching Pages (URL change)
function NavLink({ href, icon, label, isOpen, active = false }: any) {
  return (
    <Link href={href} className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
      <div className="shrink-0">{icon}</div>
      <AnimatePresence>
        {isOpen && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap text-sm">{label}</motion.span>}
      </AnimatePresence>
    </Link>
  )
}
