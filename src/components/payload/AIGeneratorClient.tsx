'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Image as ImageIcon,
  FileText,
  Loader2,
  Wand2,
  Download,
  Database,
  Library,
  X,
  Check,
  Search,
} from 'lucide-react'

interface GeneratedPost {
  title: string
  excerpt: string
  content: string
  tags: string[]
  keywords: string[]
  sources?: string[]
}

interface GeneratedImage {
  id: string
  url: string
  thumb: string
  author: string
  authorUrl: string
  description: string
}

interface LibraryImage {
  id: string
  url: string
  title: string
  prompt: string
  tags: string[]
  category: string
  createdAt: string
}

const categories = [
  { value: 'docker', label: 'Docker', icon: '🐳' },
  { value: 'hardware', label: 'Hardware', icon: '🔧' },
  { value: 'homelab', label: 'Homelab', icon: '🏠' },
  { value: 'news', label: 'News', icon: '📰' },
  { value: 'tutorial', label: 'Tutorial', icon: '📚' },
]

export function AIGeneratorClient() {
  const [prompt, setPrompt] = useState('')
  const [category, setCategory] = useState('docker')
  const [sticky, setSticky] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null)
  const [image, setImage] = useState<GeneratedImage | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  // Library state
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([])
  const [showLibrary, setShowLibrary] = useState(false)
  const [librarySearch, setLibrarySearch] = useState('')

  useEffect(() => {
    fetchLibraryImages()
  }, [])

  const fetchLibraryImages = async () => {
    try {
      const response = await fetch('/api/images/library')
      const data = await response.json()
      if (data.success) setLibraryImages(data.images)
    } catch (error) {
      console.error('Failed to load library images:', error)
    }
  }

  const selectFromLibrary = (libraryImage: LibraryImage) => {
    setImage({
      id: libraryImage.id,
      url: libraryImage.url,
      thumb: libraryImage.url,
      author: 'Image Library',
      authorUrl: '#',
      description: libraryImage.title,
    })
    setShowLibrary(false)
  }

  const generateContent = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setSaved(false)
    setPublished(false)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setGeneratedPost(data.data)

      // Search for cover image
      setImageLoading(true)
      try {
        const imageResponse = await fetch(
          `/api/unsplash/search?query=${encodeURIComponent(data.data.title)}&orientation=landscape`,
        )
        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          if (imageData.success && imageData.data) {
            setImage(imageData.data)
          } else {
            setImage(null)
          }
        } else {
          setImage(null)
        }
      } catch {
        setImage(null)
      } finally {
        setImageLoading(false)
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
      setImageLoading(false)
    }
  }

  const downloadMDX = () => {
    if (!generatedPost) return
    const date = new Date().toISOString().split('T')[0]
    const frontmatter = `---
title: "${generatedPost.title}"
date: "${date}"
excerpt: "${generatedPost.excerpt}"
category: "${category}"
coverImage: "${image?.url || ''}"
tags: [${generatedPost.tags.map((t: string) => `"${t}"`).join(', ')}]
sticky: ${sticky}
sources: ${JSON.stringify(generatedPost.sources || [])}
---`
    const blob = new Blob([`${frontmatter}\n\n${generatedPost.content}`], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const slug = generatedPost.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    a.href = url
    a.download = `${slug}.mdx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setSaved(true)
  }

  const regenerateImage = async () => {
    if (!generatedPost?.title) return
    setImageLoading(true)
    try {
      const imageResponse = await fetch(
        `/api/grok/search?query=${encodeURIComponent(generatedPost.title)}&orientation=landscape`,
      )
      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        setImage(imageData.data)
      }
    } catch (error) {
      console.error('Image search error:', error)
    } finally {
      setImageLoading(false)
    }
  }

  const publishPost = async () => {
    if (!generatedPost) return
    setPublishing(true)
    try {
      const response = await fetch('/api/payload/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedPost.title,
          content: generatedPost.content,
          category,
          tags: generatedPost.tags,
          excerpt: generatedPost.excerpt,
          imageUrl: image?.url,
          sticky,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish')
      }

      const data = await response.json()
      setPublished(true)
      alert(`✅ Gespeichert! Slug: ${data.slug}`)
    } catch (error: any) {
      console.error('Publish error:', error)
      alert(`❌ Fehler: ${error.message}`)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem',
          }}
        >
          <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#ffbe0b' }} />
          AI Blog Generator
        </h1>
        <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
          Powered by Perplexity AI — generiert Beiträge direkt in Payload CMS
        </p>
      </div>

      {/* Input Card */}
      <div
        style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          background: 'var(--theme-elevation-50)',
        }}
      >
        {/* Card Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--theme-elevation-200)',
            background: 'var(--theme-elevation-100)',
          }}
        >
          <Wand2 style={{ width: '1rem', height: '1rem', color: '#8338ec' }} />
          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>$ ai.generate --prompt</span>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Category Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '0.25rem',
                  border: `1px solid ${category === cat.value ? 'var(--theme-success-500)' : 'var(--theme-elevation-300)'}`,
                  background:
                    category === cat.value ? 'var(--theme-success-500)' : 'transparent',
                  color:
                    category === cat.value ? '#000' : 'var(--theme-elevation-800)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {cat.icon} {cat.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sticky Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setSticky(!sticky)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '0.25rem',
                border: `1px solid ${sticky ? '#ffbe0b' : 'var(--theme-elevation-300)'}`,
                background: sticky ? 'rgba(255,190,11,0.15)' : 'transparent',
                color: sticky ? '#ffbe0b' : 'var(--theme-elevation-600)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {sticky ? '📌 FEATURED' : '📍 Als Featured markieren'}
            </button>
          </div>

          {/* Prompt Textarea */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Thema eingeben... z.B. 'Docker Compose für Einsteiger', 'Intel NUC 13 Review', 'Homelab Netzwerk Setup'"
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.25rem',
                border: '1px solid var(--theme-elevation-300)',
                background: 'var(--theme-input-bg)',
                color: 'var(--theme-text)',
                fontSize: '0.875rem',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '0.5rem',
                right: '0.75rem',
                fontSize: '0.7rem',
                opacity: 0.4,
              }}
            >
              {prompt.length} Zeichen
            </span>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateContent}
            disabled={loading || !prompt.trim()}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.25rem',
              border: 'none',
              background: loading || !prompt.trim() ? 'var(--theme-elevation-300)' : '#8338ec',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.15s',
            }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: '1.1rem', height: '1.1rem', animation: 'spin 1s linear infinite' }} />
                GENERIERE INHALT...
              </>
            ) : (
              <>
                <Sparkles style={{ width: '1.1rem', height: '1.1rem' }} />
                BEITRAG GENERIEREN
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {generatedPost && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {/* Generated Content Card */}
          <div
            style={{
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              background: 'var(--theme-elevation-50)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--theme-elevation-200)',
                background: 'var(--theme-elevation-100)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText style={{ width: '1rem', height: '1rem', color: '#39ff14' }} />
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Generierter Inhalt</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={publishPost}
                  disabled={publishing || published}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.875rem',
                    borderRadius: '0.25rem',
                    border: 'none',
                    background: published ? '#39ff14' : 'var(--theme-success-500, #00d4ff)',
                    color: '#000',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    cursor: publishing || published ? 'not-allowed' : 'pointer',
                    opacity: publishing ? 0.7 : 1,
                  }}
                >
                  {publishing ? (
                    <>
                      <Loader2 style={{ width: '0.875rem', height: '0.875rem' }} />
                      SPEICHERN...
                    </>
                  ) : published ? (
                    <>
                      <Check style={{ width: '0.875rem', height: '0.875rem' }} />
                      GESPEICHERT!
                    </>
                  ) : (
                    <>
                      <Database style={{ width: '0.875rem', height: '0.875rem' }} />
                      IN PAYLOAD SPEICHERN
                    </>
                  )}
                </button>
                <button
                  onClick={downloadMDX}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.875rem',
                    borderRadius: '0.25rem',
                    border: '1px solid var(--theme-elevation-300)',
                    background: 'transparent',
                    color: 'var(--theme-elevation-800)',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  <Download style={{ width: '0.875rem', height: '0.875rem' }} />
                  MDX
                </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.25rem' }}>
                  Titel
                </label>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                  {generatedPost.title}
                </h2>
              </div>

              {/* Excerpt */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.25rem' }}>
                  Zusammenfassung
                </label>
                <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>{generatedPost.excerpt}</p>
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.375rem' }}>
                  Tags
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {generatedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        border: '1px solid var(--theme-elevation-300)',
                        fontSize: '0.7rem',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.375rem' }}>
                  Vorschau (erste 1000 Zeichen)
                </label>
                <pre
                  style={{
                    background: 'var(--theme-elevation-100)',
                    borderRadius: '0.25rem',
                    padding: '1rem',
                    fontSize: '0.75rem',
                    maxHeight: '16rem',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                    opacity: 0.8,
                  }}
                >
                  {generatedPost.content.substring(0, 1000)}...
                </pre>
              </div>

              {/* Sources */}
              {generatedPost.sources && generatedPost.sources.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.375rem' }}>
                    Quellen
                  </label>
                  <div
                    style={{
                      background: 'var(--theme-elevation-100)',
                      borderRadius: '0.25rem',
                      padding: '0.75rem',
                    }}
                  >
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {generatedPost.sources.map((source, index) => (
                        <li key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.75rem' }}>
                          <span style={{ opacity: 0.5, flexShrink: 0 }}>[{index + 1}]</span>
                          <a
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--theme-success-500)', wordBreak: 'break-all' }}
                          >
                            {source}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover Image Card */}
          <div
            style={{
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              background: 'var(--theme-elevation-50)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--theme-elevation-200)',
                background: 'var(--theme-elevation-100)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon style={{ width: '1rem', height: '1rem', color: '#ff006e' }} />
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Cover Bild</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowLibrary(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.25rem',
                    border: '1px solid var(--theme-elevation-300)',
                    background: 'transparent',
                    color: 'var(--theme-elevation-700)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  <Library style={{ width: '0.75rem', height: '0.75rem' }} />
                  BIBLIOTHEK
                </button>
                <button
                  onClick={regenerateImage}
                  disabled={imageLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.25rem',
                    border: '1px solid var(--theme-elevation-300)',
                    background: 'transparent',
                    color: 'var(--theme-elevation-700)',
                    fontSize: '0.7rem',
                    cursor: imageLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {imageLoading ? (
                    <Loader2 style={{ width: '0.75rem', height: '0.75rem' }} />
                  ) : (
                    <>
                      <Sparkles style={{ width: '0.75rem', height: '0.75rem' }} />
                      NEUES BILD
                    </>
                  )}
                </button>
              </div>
            </div>

            <div style={{ padding: '1rem' }}>
              {image ? (
                <div>
                  <img
                    src={image.url}
                    alt={image.description || 'Cover'}
                    style={{ width: '100%', height: '16rem', objectFit: 'cover', borderRadius: '0.25rem' }}
                  />
                  <p style={{ textAlign: 'center', fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem' }}>
                    Bild von{' '}
                    <a href={image.authorUrl} target="_blank" rel="noopener noreferrer">
                      {image.author}
                    </a>
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    height: '16rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    background: 'var(--theme-elevation-100)',
                    borderRadius: '0.25rem',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', opacity: 0.5 }}>Kein Bild ausgewählt</p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => setShowLibrary(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        border: '1px solid var(--theme-elevation-400)',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      <Library style={{ width: '1rem', height: '1rem' }} />
                      Aus Bibliothek
                    </button>
                    <button
                      onClick={regenerateImage}
                      disabled={imageLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        border: 'none',
                        background: '#ff006e',
                        color: '#fff',
                        cursor: imageLoading ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      {imageLoading ? (
                        <Loader2 style={{ width: '1rem', height: '1rem' }} />
                      ) : (
                        <>
                          <Sparkles style={{ width: '1rem', height: '1rem' }} />
                          Generieren
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          {published && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.25rem',
                border: '1px solid #39ff14',
                background: 'rgba(57,255,20,0.08)',
                fontSize: '0.875rem',
                color: '#39ff14',
              }}
            >
              ✓ Beitrag wurde in Payload CMS gespeichert und ist sofort live unter /blog verfügbar.
            </div>
          )}
        </motion.div>
      )}

      {/* Image Library Modal */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                width: '100%',
                maxWidth: '56rem',
                maxHeight: '80vh',
                borderRadius: '0.5rem',
                border: '1px solid var(--theme-elevation-300)',
                background: 'var(--theme-bg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--theme-elevation-200)',
                  background: 'var(--theme-elevation-100)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Library style={{ width: '1rem', height: '1rem' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Bild-Bibliothek</span>
                </div>
                <button
                  onClick={() => setShowLibrary(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                >
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              {/* Search */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--theme-elevation-200)' }}>
                <div style={{ position: 'relative' }}>
                  <Search
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1rem',
                      height: '1rem',
                      opacity: 0.5,
                    }}
                  />
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Bilder suchen..."
                    style={{
                      width: '100%',
                      paddingLeft: '2.25rem',
                      paddingRight: '1rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--theme-elevation-300)',
                      background: 'var(--theme-input-bg)',
                      color: 'var(--theme-text)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {libraryImages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                    <p style={{ marginBottom: '1rem' }}>Noch keine Bilder in der Bibliothek</p>
                    <button
                      onClick={() => { setShowLibrary(false); regenerateImage() }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        border: 'none',
                        background: 'var(--theme-success-500)',
                        color: '#000',
                        cursor: 'pointer',
                      }}
                    >
                      Erstes Bild generieren →
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.75rem',
                    }}
                  >
                    {libraryImages
                      .filter(
                        (img) =>
                          img.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
                          img.tags.some((tag) => tag.toLowerCase().includes(librarySearch.toLowerCase())),
                      )
                      .map((libraryImage) => (
                        <button
                          key={libraryImage.id}
                          onClick={() => selectFromLibrary(libraryImage)}
                          style={{
                            position: 'relative',
                            borderRadius: '0.375rem',
                            border: `1px solid ${image?.id === libraryImage.id ? 'var(--theme-success-500)' : 'var(--theme-elevation-300)'}`,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            background: 'none',
                            textAlign: 'left',
                            padding: 0,
                          }}
                        >
                          <div style={{ aspectRatio: '16/9' }}>
                            <img
                              src={libraryImage.url}
                              alt={libraryImage.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ padding: '0.375rem 0.5rem' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 'bold', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {libraryImage.title}
                            </p>
                            <p style={{ fontSize: '0.65rem', opacity: 0.5, margin: 0 }}>
                              {new Date(libraryImage.createdAt).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          {image?.id === libraryImage.id && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '0.375rem',
                                right: '0.375rem',
                                width: '1.25rem',
                                height: '1.25rem',
                                borderRadius: '50%',
                                background: 'var(--theme-success-500)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Check style={{ width: '0.75rem', height: '0.75rem', color: '#000' }} />
                            </div>
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderTop: '1px solid var(--theme-elevation-200)',
                  background: 'var(--theme-elevation-100)',
                }}
              >
                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                  {libraryImages.length} Bilder in der Bibliothek
                </span>
                <button
                  onClick={() => setShowLibrary(false)}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: '0.25rem',
                    border: '1px solid var(--theme-elevation-300)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Schließen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
