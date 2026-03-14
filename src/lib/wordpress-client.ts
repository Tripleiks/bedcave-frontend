import { WordPressPost, WordPressCategory, WordPressAuthor } from './wordpress-types';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || '/api/wp';

class WordPressClient {
  private baseUrl: string;

  constructor(baseUrl: string = WP_API_URL) {
    this.baseUrl = baseUrl;
  }

  async getPosts(params: {
    page?: number;
    per_page?: number;
    categories?: number[];
    tags?: number[];
    author?: number;
    search?: string;
    orderby?: 'date' | 'modified' | 'title' | 'relevance';
    order?: 'asc' | 'desc';
    sticky?: boolean;
    _embed?: boolean;
  } = {}): Promise<{ posts: WordPressPost[]; total: number; totalPages: number }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.categories?.length) queryParams.set('categories', params.categories.join(','));
    if (params.tags?.length) queryParams.set('tags', params.tags.join(','));
    if (params.author) queryParams.set('author', params.author.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.orderby) queryParams.set('orderby', params.orderby);
    if (params.order) queryParams.set('order', params.order);
    if (params.sticky !== undefined) queryParams.set('sticky', params.sticky.toString());
    queryParams.set('_embed', params._embed !== false ? 'true' : 'false');

    queryParams.set('endpoint', 'posts');

    const response = await fetch(`${this.baseUrl}?${queryParams}`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const posts = await response.json() as WordPressPost[];
    const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

    return { posts, total, totalPages };
  }

  async getPostBySlug(slug: string): Promise<WordPressPost | null> {
    const response = await fetch(
      `${this.baseUrl}?endpoint=posts&slug=${encodeURIComponent(slug)}&_embed=true`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) return null;

    const posts = await response.json() as WordPressPost[];
    return posts[0] || null;
  }

  async getCategories(): Promise<WordPressCategory[]> {
    const response = await fetch(`${this.baseUrl}?endpoint=categories&per_page=100`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return await response.json() as WordPressCategory[];
  }

  async getCategoryBySlug(slug: string): Promise<WordPressCategory | null> {
    const response = await fetch(
      `${this.baseUrl}?endpoint=categories&slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;

    const categories = await response.json() as WordPressCategory[];
    return categories[0] || null;
  }

  async getAuthor(id: number): Promise<WordPressAuthor | null> {
    const response = await fetch(`${this.baseUrl}?endpoint=users&id=${id}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;
    return await response.json() as WordPressAuthor;
  }

  async getStickyPosts(perPage: number = 5): Promise<WordPressPost[]> {
    const { posts } = await this.getPosts({
      sticky: true,
      per_page: perPage,
      _embed: true,
    });
    return posts;
  }

  // WordPress Pages (About, Imprint, Privacy)
  async getPageBySlug(slug: string): Promise<any | null> {
    const response = await fetch(
      `${this.baseUrl}?endpoint=pages&slug=${encodeURIComponent(slug)}&_embed=true`,
      { next: { revalidate: 3600 } } // Cache pages for 1 hour
    );

    if (!response.ok) return null;

    const pages = await response.json();
    return pages[0] || null;
  }
}

export const wpClient = new WordPressClient();
export default wpClient;
