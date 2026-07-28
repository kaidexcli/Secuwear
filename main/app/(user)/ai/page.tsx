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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown server error" }));
        
        if (res.status === 503 && errorData.error?.includes('loading')) {
           throw new Error(`Model is waking up. Estimated time: ${errorData.estimated_time || 20}s. Please try again shortly.`);
        }
        // Catch 500s directly so they don't just say "internal error"
        throw new Error(errorData.error || errorData.message || "Server returned an internal error.");
      }

      if (!res.body) throw new Error("No response body received.")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data:')) continue
          
          const data = trimmedLine.slice(5).trim()
          if (data === '[DONE]') continue
          
          try {
            const parsed = JSON.parse(data)
            
            // New parsing logic for standard /v1/chat/completions format
            const textDelta = parsed.choices?.[0]?.delta?.content
            if (textDelta) {
               assistantContent += textDelta
            }
          } catch (e) {
            console.warn("Could not parse stream chunk:", data)
          }
        }
        
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
          content: `Error: ${error.message || "Unknown error occurred."}`
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }
