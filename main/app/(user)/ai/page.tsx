"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mic, AudioLines, ChevronDown, ArrowUp, PhoneCall, Loader2, Sparkles } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const AuxilinkLogo = ({ size = 42, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 10L12 3L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="15" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 10V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 15H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 15H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function SurvivalAIPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setPrompt("")
    setIsLoading(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: "" }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      })

      // Check if the backend sent an error code
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown server error" }));
        
        // Specifically handle the Hugging Face "Model is loading" 503 error
        if (res.status === 503 && errorData.error?.includes('loading')) {
           throw new Error(`Model is waking up. Estimated time: ${errorData.estimated_time || 20}s. Please try again shortly.`);
        }
        throw new Error(errorData.error || "Server returned an error.");
      }

      if (!res.body) throw new Error("No response body received.")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      let buffer = "" // Buffer to handle network chunks splitting halfway through a JSON string

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last incomplete line in the buffer for the next pass
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data:')) continue
          
          const data = trimmedLine.slice(5).trim()
          if (data === '[DONE]') continue
          
          try {
            const parsed = JSON.parse(data)
            
            // Hugging Face sends text inside parsed.token.text. We ignore special tokens like </s>
            if (parsed.token?.text && !parsed.token.special) {
               assistantContent += parsed.token.text
            }
          } catch (e) {
            console.warn("Could not parse stream chunk:", data)
          }
        }
        
        // Update state outside the inner loop to batch renders
        setMessages(prev => prev.map(msg => 
          msg.id === assistantId ? { ...msg, content: assistantContent } : msg
        ))
      }
    } catch (error: any) {
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== assistantId),
        {
          id: assistantId,
          role: 'assistant',
          content: `Backend Error: ${error.message || "Unknown error occurred."}`
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const renderMessageContent = (text: string) => {
    const phoneRegex = /(\b9-1-1\b|\b911\b|\b\d{3,4}[-\s]?\d{3,4}[-\s]?\d{3,4}\b|\(02\)\s?\d{4}[-\s]?\d{4}|\b09\d{9}\b|\b143\b|\b1555\b|\b117\b)/g
    const matches = text.match(phoneRegex)

    return (
      <div className="space-y-4">
        <div className="text-[#2D2B2A] text-[0.98rem] leading-relaxed">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({...props}) => <p className="mb-3 last:mb-0" {...props} />,
              ul: ({...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
              ol: ({...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
              li: ({...props}) => <li className="pl-1" {...props} />,
              strong: ({...props}) => <strong className="font-semibold text-slate-900" {...props} />,
              h1: ({...props}) => <h1 className="text-xl font-bold mb-3 mt-4" {...props} />,
              h2: ({...props}) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
              h3: ({...props}) => <h3 className="text-md font-bold mb-2 mt-3" {...props} />,
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
        
        {matches && matches.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60 mt-2">
            {Array.from(new Set(matches)).map((num, idx) => (
              <a
                key={idx}
                href={`tel:${num.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors shadow-sm"
              >
                <PhoneCall size={14} className="animate-pulse" />
                <span>Call Hotline: {num}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-slate-800 font-sans overflow-hidden">
      
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      <main className="flex-1 flex flex-col items-center relative h-full">
        <div className="flex-1 w-full max-w-3xl flex flex-col px-4 pt-16 pb-36 overflow-y-auto scrollbar-thin">
          
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col justify-center items-center my-auto">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="animate-pulse text-orange-600">
                    <AuxilinkLogo size={46} />
                  </div>
                  <h1 className="text-[2.75rem] font-serif text-[#2D2B2A] tracking-tight">
                    SecuWear Auxilink Agent
                  </h1>
                </div>
                <p className="text-[#7D7B74] text-sm font-medium max-w-md mt-2">
                  Powered by Zephyr-7B. Integrated with Philippine emergency response frameworks and life-safety protocols.
                </p>
              </motion.div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-6 pt-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200 mt-1">
                        <AuxilinkLogo size={20} />
                      </div>
                    )}

                    <div className={`max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-[#2D2B2A] text-white px-4 py-3 rounded-2xl rounded-tr-xs text-[0.98rem] shadow-sm'
                        : 'text-[#2D2B2A] py-1'
                    }`}>
                      {msg.role === 'assistant' ? (
                        renderMessageContent(msg.content)
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 items-center text-[#A09E96]"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
                    <AuxilinkLogo size={20} />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#7D7B74]">
                    <Loader2 size={16} className="animate-spin text-orange-600" />
                    <span>Auxilink connecting to emergency database...</span>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="absolute bottom-6 w-full max-w-3xl px-4 bg-linear-to-t from-[#FAF9F6] via-[#FAF9F6] to-transparent pt-6">
          <div className="bg-white border border-[#E5E3D9] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-3 flex flex-col transition-shadow focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you survive today?"
              className="w-full bg-transparent resize-none outline-none text-[1.05rem] placeholder:text-[#A09E96] text-[#2D2B2A] min-h-12 max-h-36 p-2 scrollbar-none"
              rows={2}
            />

            <div className="flex items-center justify-between mt-2">
              <button className="p-2 text-[#A09E96] hover:bg-[#F2F0E9] rounded-xl transition-colors">
                <Plus size={22} strokeWidth={2} />
              </button>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-orange-700 font-semibold px-2.5 py-1.5 bg-orange-50 border border-orange-200/60 rounded-lg cursor-pointer transition-colors mr-2">
                  <Sparkles size={14} className="text-orange-600" />
                  Zephyr-7B <ChevronDown size={14} />
                </div>
                
                <button className="p-2 text-[#A09E96] hover:bg-[#F2F0E9] rounded-xl transition-colors">
                  <Mic size={20} />
                </button>
                <button className="p-2 text-[#A09E96] hover:bg-[#F2F0E9] rounded-xl transition-colors">
                  <AudioLines size={20} />
                </button>
                
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading || prompt.trim().length === 0}
                  className={`p-2 rounded-xl transition-all ml-1 ${
                    prompt.trim().length > 0 && !isLoading
                      ? 'bg-orange-600 text-white shadow-sm hover:bg-orange-700 cursor-pointer' 
                      : 'bg-[#E5E3D9] text-[#A09E96] cursor-not-allowed'
                  }`}
                >
                  <ArrowUp size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>

          </div>
          
          <p className="text-center text-xs text-[#A09E96] mt-3 font-medium pb-2">
            Auxilink AI can make mistakes. Always verify critical medical and disaster survival protocols.
          </p>
        </div>

      </main>
    </div>
  )
}
