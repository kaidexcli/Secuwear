"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Mic, AudioLines, ChevronDown, ArrowUp } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'

// Custom Minimalist "Auxilink" Logo 
// Abstract 'A' connected to a central data node
const AuxilinkLogo = ({ size = 42, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* The 'A' / Auxiliary Peak */}
    <path d="M6 10L12 3L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* The Linking Node */}
    <circle cx="12" cy="15" r="4" stroke="currentColor" strokeWidth="2"/>
    
    {/* The Vertical Connection */}
    <path d="M12 10V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* The Network Base */}
    <path d="M4 15H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 15H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function SurvivalAIPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [prompt, setPrompt] = useState("")

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar - Map props omitted since they are only used on the Dashboard */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      <main className="flex-1 flex flex-col items-center relative h-full">

        {/* Top Right Controls */}
        <div className="absolute top-4 right-8 flex gap-4 text-sm font-medium text-[#7D7B74]">
           <button className="hover:text-orange-600 transition-colors">Emergency Offline Mode</button>
        </div>

        {/* Center Greeting Area with Custom Logo */}
        <div className="flex-1 w-full max-w-3xl flex flex-col justify-center px-4 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-2">
              {/* Using the custom Auxilink logo with a smooth breathing animation */}
              <div className="animate-pulse text-orange-600">
                 <AuxilinkLogo size={46} />
              </div>
              <h1 className="text-[2.75rem] font-serif text-[#2D2B2A] tracking-tight">
                SecuWear Auxilink Agent
              </h1>
            </div>
          </motion.div>
        </div>

        {/* Input Area (Fixed to bottom center) */}
        <div className="absolute bottom-12 w-full max-w-3xl px-4">
          <div className="bg-white border border-[#E5E3D9] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-3 flex flex-col transition-shadow focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="How can I help you survive today?"
              className="w-full bg-transparent resize-none outline-none text-[1.05rem] placeholder:text-[#A09E96] text-[#2D2B2A] min-h-15 p-2"
              rows={2}
            />

            <div className="flex items-center justify-between mt-2">
              {/* Left Attach Button */}
              <button className="p-2 text-[#A09E96] hover:bg-[#F2F0E9] rounded-xl transition-colors">
                <Plus size={22} strokeWidth={2} />
              </button>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2">
                
                {/* Model Selector */}
                <div className="flex items-center gap-1 text-sm text-[#7D7B74] font-medium px-2 py-1.5 hover:bg-[#F2F0E9] rounded-lg cursor-pointer transition-colors mr-2">
                  Rescue Model <ChevronDown size={16} />
                </div>
                
                <button className="p-2 text-[#A09E96] hover:bg-[#F2F0E9] rounded-xl transition-colors">
                  <Mic size={20} />
                </button>
                <button className="p-2 text-[#A09E96] hover:bg-[#F2F0E9] rounded-xl transition-colors">
                  <AudioLines size={20} />
                </button>
                
                {/* Submit Button (Changes color when typing) */}
                <button 
                  className={`p-2 rounded-xl transition-colors ml-1 ${
                    prompt.length > 0 ? 'bg-orange-600 text-white shadow-sm' : 'bg-[#E5E3D9] text-[#A09E96]'
                  }`}
                >
                  <ArrowUp size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>

          </div>
          
          <p className="text-center text-xs text-[#A09E96] mt-4 font-medium">
            Auxilink AI can make mistakes. Always verify critical medical and disaster survival protocols.
          </p>
        </div>

      </main>
    </div>
  )
}
