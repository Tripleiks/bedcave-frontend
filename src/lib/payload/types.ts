export interface LexicalTextNode {
  type: 'text'
  text: string
  format?: number
}

export interface LexicalParagraphNode {
  type: 'paragraph'
  children: LexicalTextNode[]
}

export interface LexicalRoot {
  type: 'root'
  children: LexicalParagraphNode[]
}

export interface LexicalJSON {
  root: LexicalRoot
}

export interface PayloadMediaObject {
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface PayloadAuthor {
  id: string
  name: string
  email: string
}

export type PayloadCategory =
  | 'ai-tools'
  | 'development'
  | 'design'
  | 'news'
  | 'tutorial'
  | 'homelab'
  | 'docker'
  | 'hardware'

export interface PayloadPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: LexicalJSON
  category: PayloadCategory
  /** Payload array field — always access as (tags ?? []).map(t => t.tag) */
  tags: { tag: string }[]
  status: 'draft' | 'published' | 'archived'
  publishedAt: string
  /** Replaces MDX sticky field */
  featured: boolean
  /** Object when depth >= 1, string (id) at depth 0 */
  author: PayloadAuthor | string
  /** Payload returns relative paths like /media/image.jpg */
  featuredImage?: PayloadMediaObject | string | null
  metaTitle?: string
  metaDescription?: string
}

/** Shape of a Payload REST list response */
export interface PayloadListResponse {
  docs: PayloadPost[]
  totalDocs: number
  limit: number
  page: number
}
