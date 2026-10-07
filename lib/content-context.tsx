"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface TextContent {
  text: string
  style?: React.CSSProperties
  className?: string
}

export interface ContentState {
  [key: string]: TextContent
}

interface ContentContextType {
  content: ContentState
  isEditMode: boolean
  selectedElementId: string | null
  toggleEditMode: () => void
  selectElement: (id: string | null) => void
  updateContent: (id: string, data: Partial<TextContent>) => void
  getContent: (id: string, defaultText: string) => string
  restoreContent: (newContent: ContentState) => void
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

const STORAGE_KEY = "security1_content"

export function ContentProvider({ children, initialContent = {} }: { children: ReactNode, initialContent?: ContentState }) {
  const [content, setContent] = useState<ContentState>(initialContent)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set())

  // Load from localStorage only if no initial content or as fallback/merge
  useEffect(() => {
    const loadContent = () => {
      // If we have initialContent (SSR), we use it.
      // We can check localStorage for unsaved drafts if needed, but user wants "direct code edit" behavior.
      // So we prioritize the file-based content.
      setIsInitialized(true)
    }

    loadContent()
  }, [])

  // Listen for messages from parent (Admin Panel)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return

      switch (event.data.type) {
        case "GET_CONTENT":
          // Send current content to parent
          window.parent.postMessage({
            type: "CONTENT_DATA",
            content: content,
            changedIds: Array.from(changedIds)
          }, "*")
          break
          
        case "APPLY_CONTENT":
          // Save content to API and update state
          if (event.data.content) {
            const newContent = event.data.content
            setContent(newContent)
            setChangedIds(new Set())
            
            // Save to server
            try {
              await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContent)
              })
            } catch (err) {
              console.error("Failed to save content to server:", err)
            }
          }
          break
          
        case "RESET_CONTENT":
          // Reload from server
          try {
            const res = await fetch('/api/content')
            const data = await res.json()
            setContent(data)
          } catch (e) {
            console.error("Failed to fetch content:", e)
            // Fallback to initial
            setContent(initialContent)
          }
          break

        case "RESTORE_CONTENT":
           if (event.data.content) {
             setContent(event.data.content)
             // Also save to server to persist the restoration
             try {
               await fetch('/api/content', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(event.data.content)
               })
             } catch (err) {
               console.error("Failed to save restored content:", err)
             }
           }
           break

        case "SET_EDIT_MODE":
          setIsEditMode(!!event.data.enabled)
          break
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [content])

  // Removed auto-save useEffect


  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev)
    setSelectedElementId(null) // Clear selection when toggling
  }

  const selectElement = (id: string | null) => {
    setSelectedElementId(id)
  }

  const updateContent = (id: string, data: Partial<TextContent>) => {
    setContent((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...data,
      },
    }))
    setChangedIds((prev) => new Set(prev).add(id))
    // Notify parent about content change
    window.parent.postMessage({ type: "CONTENT_CHANGED" }, "*")
  }

  const getContent = (id: string, defaultText: string) => {
    return content[id]?.text || defaultText
  }

  const restoreContent = async (newContent: ContentState) => {
    setContent(newContent)
    setChangedIds(new Set())
    
    // Save to server
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent)
      })
    } catch (err) {
      console.error("Failed to save restored content to server:", err)
    }
  }

  return (
    <ContentContext.Provider
      value={{
        content,
        isEditMode,
        selectedElementId,
        toggleEditMode,
        selectElement,
        updateContent,
        getContent,
        restoreContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider")
  }
  return context
}
