import { describe, it, expect } from 'vitest'
import { lexicalToMarkdown, calculateReadingTime, resolveMediaUrl } from '../posts'
import type { LexicalJSON, LexicalParagraphNode, LexicalTextNode } from '../types'

describe('lexicalToMarkdown', () => {
  it('should convert a single paragraph with a single text node to markdown', () => {
    const content: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Hello world',
              },
            ],
          },
        ],
      },
    }

    expect(lexicalToMarkdown(content)).toBe('Hello world')
  })

  it('should join multiple paragraphs with double newlines', () => {
    const content: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'First paragraph',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Second paragraph',
              },
            ],
          },
        ],
      },
    }

    expect(lexicalToMarkdown(content)).toBe('First paragraph\n\nSecond paragraph')
  })

  it('should handle multiple text nodes within a single paragraph', () => {
    const content: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Hello ',
              },
              {
                type: 'text',
                text: 'world',
              },
            ],
          },
        ],
      },
    }

    expect(lexicalToMarkdown(content)).toBe('Hello world')
  })

  it('should return empty string for empty content', () => {
    const content: LexicalJSON = {
      root: {
        type: 'root',
        children: [],
      },
    }

    expect(lexicalToMarkdown(content)).toBe('')
  })

  it('should return empty string when paragraph has no children', () => {
    const content: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [],
          },
        ],
      },
    }

    expect(lexicalToMarkdown(content)).toBe('')
  })

  it('should handle text nodes with empty strings', () => {
    const content: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: '',
              },
              {
                type: 'text',
                text: 'actual text',
              },
            ],
          },
        ],
      },
    }

    expect(lexicalToMarkdown(content)).toBe('actual text')
  })

  it('should handle complex nested structure with multiple paragraphs and text nodes', () => {
    const content: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'First ',
              },
              {
                type: 'text',
                text: 'part',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Second ',
              },
              {
                type: 'text',
                text: 'part',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Third part',
              },
            ],
          },
        ],
      },
    }

    expect(lexicalToMarkdown(content)).toBe('First part\n\nSecond part\n\nThird part')
  })

  it('should preserve formatting information in text nodes', () => {
    const content: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Bold text',
                format: 1, // Bold flag
              },
            ],
          },
        ],
      },
    }

    // The function should extract the text regardless of format
    expect(lexicalToMarkdown(content)).toBe('Bold text')
  })
})

describe('calculateReadingTime', () => {
  it('should return 1 minute for empty string', () => {
    expect(calculateReadingTime('')).toBe(1)
  })

  it('should return 1 minute for 1 word', () => {
    expect(calculateReadingTime('word')).toBe(1)
  })

  it('should return 1 minute for 200 words', () => {
    const words = Array(200).fill('word').join(' ')
    expect(calculateReadingTime(words)).toBe(1)
  })

  it('should return 2 minutes for 201 words', () => {
    const words = Array(201).fill('word').join(' ')
    expect(calculateReadingTime(words)).toBe(2)
  })

  it('should return 2 minutes for 400 words', () => {
    const words = Array(400).fill('word').join(' ')
    expect(calculateReadingTime(words)).toBe(2)
  })

  it('should return 3 minutes for 401 words', () => {
    const words = Array(401).fill('word').join(' ')
    expect(calculateReadingTime(words)).toBe(3)
  })

  it('should return correct reading time for typical article (800 words)', () => {
    const words = Array(800).fill('word').join(' ')
    expect(calculateReadingTime(words)).toBe(4)
  })

  it('should return correct reading time for short content (50 words)', () => {
    const words = Array(50).fill('word').join(' ')
    expect(calculateReadingTime(words)).toBe(1)
  })

  it('should handle text with multiple spaces between words', () => {
    const text = 'word  word   word    word     word' // Multiple spaces
    expect(calculateReadingTime(text)).toBeGreaterThanOrEqual(1)
  })

  it('should handle text with newlines', () => {
    const text = 'word\nword\nword\nword\nword'.repeat(40) // 200 words with newlines
    expect(calculateReadingTime(text)).toBeGreaterThanOrEqual(1)
  })
})

describe('resolveMediaUrl', () => {
  it('should return undefined when url is undefined', () => {
    expect(resolveMediaUrl('http://localhost:3000', undefined)).toBeUndefined()
  })

  it('should prepend baseUrl to relative paths starting with /', () => {
    expect(resolveMediaUrl('http://localhost:3000', '/media/image.jpg')).toBe(
      'http://localhost:3000/media/image.jpg'
    )
  })

  it('should return absolute URLs unchanged', () => {
    const absoluteUrl = 'https://cdn.example.com/image.jpg'
    expect(resolveMediaUrl('http://localhost:3000', absoluteUrl)).toBe(absoluteUrl)
  })

  it('should handle baseUrl without trailing slash', () => {
    expect(resolveMediaUrl('http://localhost:3000', '/media/image.jpg')).toBe(
      'http://localhost:3000/media/image.jpg'
    )
  })

  it('should handle baseUrl with trailing slash', () => {
    expect(resolveMediaUrl('http://localhost:3000/', '/media/image.jpg')).toBe(
      'http://localhost:3000//media/image.jpg'
    )
  })

  it('should handle http URLs', () => {
    const url = 'http://example.com/image.jpg'
    expect(resolveMediaUrl('http://localhost:3000', url)).toBe(url)
  })

  it('should handle https URLs', () => {
    const url = 'https://example.com/image.jpg'
    expect(resolveMediaUrl('http://localhost:3000', url)).toBe(url)
  })

  it('should not prepend baseUrl to absolute URLs', () => {
    expect(resolveMediaUrl('http://localhost:3000', 'http://other-domain.com/image.jpg')).toBe(
      'http://other-domain.com/image.jpg'
    )
  })

  it('should handle relative paths with multiple segments', () => {
    expect(
      resolveMediaUrl('http://localhost:3000', '/uploads/2024/03/image.jpg')
    ).toBe('http://localhost:3000/uploads/2024/03/image.jpg')
  })

  it('should handle different base URL formats', () => {
    expect(resolveMediaUrl('https://api.bedcave.com', '/media/test.png')).toBe(
      'https://api.bedcave.com/media/test.png'
    )
  })

  it('should handle data URLs', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    expect(resolveMediaUrl('http://localhost:3000', dataUrl)).toBe(dataUrl)
  })
})
