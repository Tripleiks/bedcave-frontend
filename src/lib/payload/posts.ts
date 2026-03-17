import type { LexicalJSON, PayloadCategory, PayloadPost, PayloadListResponse } from './types'

const PAYLOAD_URL = process.env.PAYLOAD_URL ?? 'http://localhost:3000'

export function lexicalToMarkdown(content: LexicalJSON): string {
  const paragraphs = content.root.children
    .map((paragraph) => paragraph.children.map((node) => node.text ?? '').join(''))
    .filter((text) => text.length > 0)

  return paragraphs.join('\n\n')
}

export function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter((word) => word.length > 0)
  return Math.max(1, Math.ceil(words.length / 200))
}

export function resolveMediaUrl(baseUrl: string, url: string | undefined): string | undefined {
  if (url === undefined) {
    return undefined
  }
  if (url.startsWith('/')) {
    return `${baseUrl.replace(/\/$/, '')}${url}`
  }
  return url
}

export async function getAllPosts(): Promise<PayloadPost[]> {
  try {
    const res = await fetch(
      `${PAYLOAD_URL}/api/blog-posts?where[status][equals]=published&sort=-publishedAt&depth=1&limit=0`
    )
    if (!res.ok) return []
    const response: PayloadListResponse = await res.json() as PayloadListResponse
    return response.docs
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<PayloadPost | null> {
  try {
    const res = await fetch(
      `${PAYLOAD_URL}/api/blog-posts?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&depth=1&limit=1`
    )
    if (!res.ok) return null
    const response: PayloadListResponse = await res.json() as PayloadListResponse
    if (response.docs.length === 0) {
      return null
    }
    return response.docs[0]
  } catch {
    return null
  }
}

export async function getPostsByCategory(category: PayloadCategory): Promise<PayloadPost[]> {
  try {
    const res = await fetch(
      `${PAYLOAD_URL}/api/blog-posts?where[status][equals]=published&where[category][equals]=${category}&sort=-publishedAt&depth=1&limit=0`
    )
    if (!res.ok) return []
    const response: PayloadListResponse = await res.json() as PayloadListResponse
    return response.docs
  } catch {
    return []
  }
}
