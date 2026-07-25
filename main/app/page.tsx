'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, PresentationControls, ContactShadows, Text, RoundedBox, Sparkles } from '@react-three/drei'
import { motion } from 'framer-motion'
import Link from 'next/link'
import * as THREE from 'three'

// 1. SCROLL MANAGER: Syncs the 3D model's Y-position with DOM scrolling
function ScrollManager({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  const targetY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const height = window.innerHeight
      const scrollPercent = scrollY / height
      targetY.current = scrollPercent * viewport.height
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [viewport.height])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y += (targetY.current - groupRef.current.position.y) * 0.1
    }
  })

  return <group ref={groupRef}>{children}</group>
}

// 2. 3D HARDWARE MODEL: SecuWear Prototype
function SecuWearModel() {
  const width = 1.85;
  const height = 2.2;
  const depth = 0.55;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group rotation={[0.3, -0.6, 0.1]}>
        
        {/* Chassis */}
        <RoundedBox args={[width, height, depth]} radius={0.35} smoothness={8} castShadow receiveShadow>
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
        </RoundedBox>

        {/* Screen Glass Bezel */}
        <RoundedBox args={[width - 0.05, height - 0.05, depth + 0.02]} radius={0.32} smoothness={8}>
          <meshPhysicalMaterial color="#000000" metalness={0.9} roughness={0.05} clearcoat={1} clearcoatRoughness={0.1} />
        </RoundedBox>

        {/* Screen UI */}
        <group position={[0, 0, depth / 2 + 0.012]}>
          <Text position={[0, 0.2, 0]} fontSize={0.22} color="#ffffff" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfAZ9hjp-Ek-_EeA.woff" anchorY="bottom">
            SYSTEM ARMED
          </Text>
          <Text position={[0, -0.1, 0]} fontSize={0.11} color="#ff3333" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfAZ9hjp-Ek-_EeA.woff" anchorY="top">
            CRIME | MED READY
          </Text>
        </group>

        {/* Dual Emergency Triggers */}
        <group position={[width / 2 + 0.08, 0.4, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.15, 32]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.02, 32]} />
            <meshStandardMaterial color="#ff1a1a" emissive="#ff1a1a" emissiveIntensity={2.5} />
          </mesh>
        </group>

        <group position={[width / 2 + 0.08, -0.4, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.15, 32]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.02, 32]} />
            <meshStandardMaterial color="#33ccff" emissive="#33ccff" emissiveIntensity={2.5} />
          </mesh>
        </group>

        {/* Analog Pulse Sensor Array */}
        <group position={[0, 0, -(depth / 2 + 0.02)]} rotation={[Math.PI, 0, 0]}>
          <mesh>
            <circleGeometry args={[0.3, 32]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.15, 32]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
          </mesh>
        </group>

        {/* Tucked Straps */}
        <RoundedBox args={[width - 0.4, 1.8, 0.15]} radius={0.05} smoothness={4} position={[0, 1.6, -0.1]} rotation={[0.25, 0, 0]}>
          <meshStandardMaterial color="#151515" roughness={0.9} />
        </RoundedBox>
        <RoundedBox args={[width - 0.4, 1.8, 0.15]} radius={0.05} smoothness={4} position={[0, -1.6, -0.1]} rotation={[-0.25, 0, 0]}>
          <meshStandardMaterial color="#151515" roughness={0.9} />
        </RoundedBox>
        
      </group>
    </Float>
  )
}

// 3. MAIN PAGE LAYOUT
export default function LandingPage() {
  return (
    <main className="relative w-full min-h-screen text-white bg-black selection:bg-white/30">
      
      {/* FIXED 3D BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <Environment preset="city" background blur={0.015} />
          <Sparkles count={150} scale={12} size={1.5} speed={0.3} opacity={0.15} color="#ffffff" />
          
          <ambientLight intensity={0.4} />
          <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2.5} castShadow />
          <spotLight position={[-5, 5, 5]} angle={0.2} penumbra={1} intensity={1} color="#ff3333" />
          <directionalLight position={[0, -5, 5]} intensity={0.5} color="#4488ff" />
          
          <ScrollManager>
            <PresentationControls
              global
              snap={true}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.5, Math.PI / 2]}
            >
              <group position={[1.5, 0, 0]}>
                <SecuWearModel />
              </group>
            </PresentationControls>
            
            <ContactShadows position={[1.5, -3, 0]} opacity={0.7} scale={15} blur={3} far={5} />
          </ScrollManager>
        </Canvas>

        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      {/* SCROLLABLE DOM CONTENT */}
      <div className="relative z-10 w-full flex flex-col pointer-events-none">
        
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-md border-b border-white/10 pointer-events-auto">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="font-bold text-2xl tracking-widest text-white">SECUWEAR</div>
            <div className="hidden md:flex gap-8 text-sm font-medium text-neutral-300">
              <Link href="#architecture" className="hover:text-white transition-colors">Architecture</Link>
              <Link href="#about" className="hover:text-white transition-colors">About Us</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">User Portal</Link>
            </div>
            <Link href="/dispatch" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-colors border border-white/20">
              Dispatch Login
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative w-full h-screen flex items-center pointer-events-none">
          <div className="w-full max-w-7xl mx-auto px-6 flex items-center h-full pt-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="max-w-xl pointer-events-auto"
            >
              <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                SecuWear.
              </h1>
              <p className="text-xl md:text-2xl text-neutral-200 mb-8 font-light drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                Continuous emergency monitoring and cross-platform access. Instant GSM alerts. Precision GPS tracking. 
                Safety isn't a reaction—it's a constant state.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-neutral-200 transition-all text-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  User Portal
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="absolute bottom-8 right-12 flex items-center gap-4 text-neutral-300 text-sm tracking-widest uppercase pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <span>Drag device to inspect</span>
            <div className="w-12 h-px bg-neutral-400"></div>
          </motion.div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="relative w-full py-32 pointer-events-auto">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-md">Engineered for Absolute Safety</h2>
              <p className="text-xl text-neutral-300 max-w-2xl mx-auto font-light drop-shadow-md">
                Built from the ground up to integrate real-time biometric scanning with standalone wide range of safety and emergency responses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-black/40 rounded-3xl border border-white/10 hover:border-white/20 transition-colors backdrop-blur-md shadow-2xl">
                <div className="w-12 h-12 bg-[#33ccff]/10 rounded-full flex items-center justify-center mb-6 border border-[#33ccff]/30 shadow-[0_0_15px_rgba(51,204,255,0.3)]">
                  <div className="w-4 h-4 bg-[#33ccff] rounded-full blur-[2px]"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">ESP32 Core Logic</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Low-latency edge computing handles real-time sensor data aggregation, hardware interrupts, and Wi-Fi routing in a highly minimized digital footprint.
                </p>
              </div>

              <div className="p-8 bg-black/40 rounded-3xl border border-white/10 hover:border-white/20 transition-colors backdrop-blur-md shadow-2xl">
                <div className="w-12 h-12 bg-[#ff3333]/10 rounded-full flex items-center justify-center mb-6 border border-[#ff3333]/30 shadow-[0_0_15px_rgba(255,51,51,0.3)]">
                  <div className="w-4 h-4 bg-[#ff3333] rounded-full blur-[2px]"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">SIM800 GSM Integration</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Standalone cellular connectivity independent of a paired smartphone guarantees SMS distress alerts are broadcasted to dispatch servers instantly.
                </p>
              </div>

              <div className="p-8 bg-black/40 rounded-3xl border border-white/10 hover:border-white/20 transition-colors backdrop-blur-md shadow-2xl">
                <div className="w-12 h-12 bg-[#00ff00]/10 rounded-full flex items-center justify-center mb-6 border border-[#00ff00]/30 shadow-[0_0_15px_rgba(0,255,0,0.3)]">
                  <div className="w-4 h-4 bg-[#00ff00] rounded-full blur-[2px]"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Analog Biometric Scan</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Continuous skin-contact pulse rate monitoring instantly detects severe physiological anomalies, capable of triggering automated medical responses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Us & Contacts Section */}
        <section id="about" className="relative w-full py-32 pointer-events-auto">
          <div className="max-w-5xl mx-auto px-6 text-center">
            
            <div className="p-10 md:p-14 bg-black/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">About SecuWear</h2>
              <div className="w-24 h-1 bg-linear-to-r from-[#ff3333] to-[#33ccff] mx-auto mb-10 rounded-full"></div>
              
              <p className="text-base md:text-lg text-neutral-300 leading-relaxed mb-6 font-light text-left md:text-center">
                SecuWear is a prototype wearable safety device developed by a dedicated electronics engineering students at the Polytechnic University of the Philippines (PUP Sta. Mesa). Driven by a commitment to excellence—embodying the spirit of an Iskolar ng Bayan—this project bridges the gap between complex embedded systems and real-world emergency response.
              </p>
              
              <p className="text-base md:text-lg text-neutral-300 leading-relaxed font-light text-left md:text-center">
                What began as a focused thesis framework has evolved into a comprehensive safety ecosystem. By integrating advanced IoT microcontrollers, analog biometric sensors, and reliable telecommunications, SecuWear is designed with a singular, unwavering mission: to protect lives when every second counts.
              </p>

              {/* Enhanced Contacts Area */}
              <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-[#ff3333]/50 transition-colors">
                    <svg className="w-5 h-5 text-[#ff3333]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-1">Email</p>
                    <p className="text-sm text-neutral-200">[benedictfusin99@gmail.com]</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-[#33ccff]/50 transition-colors">
                    <svg className="w-5 h-5 text-[#33ccff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-1">Phone</p>
                    <p className="text-sm text-neutral-200">[09426045796]</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-[#00ff00]/50 transition-colors">
                    <svg className="w-5 h-5 text-[#00ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-1">Network</p>
                    <p className="text-sm text-neutral-200">/in/benedict-fusin</p>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </section>

      </div>
    </main>
  )
}