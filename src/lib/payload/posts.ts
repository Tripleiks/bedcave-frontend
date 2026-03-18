import { getPayload } from 'payload'
import config from '@payload-config'
import type { PayloadCategory, PayloadPost } from './types'

export function lexicalToMarkdown(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  const root = (content as { root?: { children?: Array<{ children?: Array<{ text?: string }> }> } }).root
  if (!root?.children) return ''
  return root.children
    .map((paragraph) =>
      (paragraph.children ?? []).map((node) => node.text ?? '').join('')
    )
    .filter((text) => text.length > 0)
    .join('\n\n')
}

export function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter((word) => word.length > 0)
  return Math.max(1, Math.ceil(words.length / 200))
}

const BLOB_BASE = process.env.BLOB_PUBLIC_BASE_URL ?? ''

export function resolveMediaUrl(_baseUrl: string, url: string | undefined): string | undefined {
  if (!url) return undefined
  // Payload returns local paths like /api/media/file/filename.jpg in production
  // when the Vercel Blob plugin overrides the stored URL — rewrite to Blob URL
  if (BLOB_BASE && url.startsWith('/api/media/file/')) {
    const filename = url.slice('/api/media/file/'.length)
    return `${BLOB_BASE}/media/${filename}`
  }
  return url
}

export async function getAllPosts(): Promise<PayloadPost[]> {
  try {
    const payload = await getPayload({ config })
    const response = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 1,
      limit: 0,
      overrideAccess: true,
    })
    return response.docs as unknown as PayloadPost[]
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<PayloadPost | null> {
  try {
    const payload = await getPayload({ config })
    const response = await payload.find({
      collection: 'blog-posts',
      where: {
        and: [
          { slug: { equals: slug } },
          { status: { equals: 'published' } },
        ],
      },
      depth: 1,
      limit: 1,
      overrideAccess: true,
    })
    return response.docs.length > 0 ? response.docs[0] as unknown as PayloadPost : null
  } catch {
    return null
  }
}

export async function getPostsByCategory(category: PayloadCategory): Promise<PayloadPost[]> {
  try {
    const payload = await getPayload({ config })
    const response = await payload.find({
      collection: 'blog-posts',
      where: {
        and: [
          { status: { equals: 'published' } },
          { category: { equals: category } },
        ],
      },
      sort: '-publishedAt',
      depth: 1,
      limit: 0,
      overrideAccess: true,
    })
    return response.docs as unknown as PayloadPost[]
  } catch {
    return []
  }
}
