import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Revalidate every 5 minutes

interface NewsItem {
  id: string;
  text: string;
  category: "docker" | "unraid" | "homelab" | "m365" | "azure" | "general" | "github" | "tech" | "ai";
  icon: string;
  color: string;
  isNew?: boolean;
  url?: string;
  source: string;
}

// Enhanced fallback data with more items and better categorization
const fallbackNews: NewsItem[] = [
  // Docker & Containers
  { id: "fb-1", text: "Docker Desktop 4.38 released with AI-assisted debugging", category: "docker", icon: "Container", color: "#2496ed", source: "Docker", isNew: true },
  { id: "fb-2", text: "Kubernetes 1.32 introduces sidecar container enhancements", category: "docker", icon: "Container", color: "#2496ed", source: "K8s" },
  { id: "fb-3", text: "Docker Compose 2.24 adds parallel build support", category: "docker", icon: "Container", color: "#2496ed", source: "Docker", isNew: true },
  { id: "fb-4", text: "Podman 5.0 reaches feature parity with Docker", category: "docker", icon: "Container", color: "#892ca0", source: "Podman" },
  
  // Azure & Cloud
  { id: "fb-5", text: "Azure Container Apps now supports GPU workloads for AI", category: "azure", icon: "Cloud", color: "#0089d6", source: "Azure", isNew: true },
  { id: "fb-6", text: "Microsoft Azure AI Foundry simplifies model deployment", category: "azure", icon: "Cloud", color: "#0089d6", source: "Azure", isNew: true },
  { id: "fb-7", text: "Azure Static Web Apps adds Node.js 22 support", category: "azure", icon: "Cloud", color: "#0089d6", source: "Azure" },
  { id: "fb-8", text: "Azure DevOps updates pipeline YAML validation", category: "azure", icon: "Cloud", color: "#0078d4", source: "Azure DevOps" },
  { id: "fb-9", text: "Terraform 1.10 improves Azure provider performance", category: "azure", icon: "Cloud", color: "#8b5cf6", source: "HashiCorp" },
  
  // M365 & Microsoft
  { id: "fb-10", text: "Microsoft 365 Copilot gets custom agent support", category: "m365", icon: "Cloud", color: "#0078d4", source: "Microsoft", isNew: true },
  { id: "fb-11", text: "Exchange Online adds enhanced email encryption", category: "m365", icon: "Mail", color: "#0078d4", source: "Microsoft", isNew: true },
  { id: "fb-12", text: "Teams Premium introduces AI-powered recaps", category: "m365", icon: "MessageSquare", color: "#7c83db", source: "Microsoft Teams" },
  { id: "fb-13", text: "SharePoint Online boosts file sync performance", category: "m365", icon: "Folder", color: "#0078d4", source: "SharePoint" },
  { id: "fb-14", text: "Microsoft Intune adds macOS compliance policies", category: "m365", icon: "Shield", color: "#0078d4", source: "Intune" },
  { id: "fb-15", text: "Power Platform integrates GPT-4 Turbo", category: "m365", icon: "Zap", color: "#742774", source: "Power Platform", isNew: true },
  
  // Homelab & Self-Hosting
  { id: "fb-16", text: "Proxmox VE 8.3 adds enhanced backup compression", category: "homelab", icon: "Server", color: "#e57000", source: "Proxmox" },
  { id: "fb-17", text: "Home Assistant 2025.3 with new Matter support", category: "homelab", icon: "Home", color: "#00d4ff", source: "HA", isNew: true },
  { id: "fb-18", text: "TrueNAS Scale 24.10 improves container management", category: "homelab", icon: "Database", color: "#0095d5", source: "TrueNAS" },
  { id: "fb-19", text: "Pi-hole 6.0 introduces native DoH support", category: "homelab", icon: "Shield", color: "#96060c", source: "Pi-hole", isNew: true },
  { id: "fb-20", text: "OpenWrt 23.05.5 adds WiFi 7 preliminary support", category: "homelab", icon: "Wifi", color: "#00c853", source: "OpenWrt" },
  { id: "fb-21", text: "Nginx Proxy Manager v3 beta now available", category: "homelab", icon: "Globe", color: "#ff6c00", source: "NPM" },
  
  // Unraid
  { id: "fb-22", text: "Unraid 7.0 stable release announced with ZFS support", category: "unraid", icon: "HardDrive", color: "#ff6c00", source: "Unraid", isNew: true },
  { id: "fb-23", text: "Unraid adds official WireGuard VPN integration", category: "unraid", icon: "Shield", color: "#ff6c00", source: "Unraid" },
  { id: "fb-24", text: "Community Apps plugin reaches 1000+ containers", category: "unraid", icon: "Package", color: "#ff6c00", source: "CA" },
  { id: "fb-25", text: "Unraid Cloud Backup now supports Backblaze B2", category: "unraid", icon: "Cloud", color: "#ff6c00", source: "Unraid", isNew: true },
  
  // AI & Machine Learning
  { id: "fb-26", text: "OpenAI GPT-5 preview announced for developers", category: "ai", icon: "Brain", color: "#10a37f", source: "OpenAI", isNew: true },
  { id: "fb-27", text: "Claude 3.7 Sonnet introduces extended thinking mode", category: "ai", icon: "Brain", color: "#d97757", source: "Anthropic", isNew: true },
  { id: "fb-28", text: "Meta LLaMA 3 70B now available for commercial use", category: "ai", icon: "Brain", color: "#0081fb", source: "Meta" },
  { id: "fb-29", text: "Google Gemini 2.0 adds native image generation", category: "ai", icon: "Brain", color: "#4285f4", source: "Google", isNew: true },
  { id: "fb-30", text: "Mistral Large 2 outperforms GPT-4 on code tasks", category: "ai", icon: "Brain", color: "#ff7000", source: "Mistral" },
  { id: "fb-31", text: "Ollama 0.3 adds vision model support", category: "ai", icon: "Eye", color: "#ff6b6b", source: "Ollama", isNew: true },
  
  // GitHub & Dev Tools
  { id: "fb-32", text: "GitHub Actions now supports ARM64 runners natively", category: "github", icon: "GitBranch", color: "#39ff14", source: "GitHub", isNew: true },
  { id: "fb-33", text: "GitHub Copilot Workspace enters public beta", category: "github", icon: "Code", color: "#39ff14", source: "GitHub", isNew: true },
  { id: "fb-34", text: "GitHub Packages adds vulnerability scanning", category: "github", icon: "Package", color: "#39ff14", source: "GitHub" },
  
  // General Tech
  { id: "fb-35", text: "RustDesk: New open-source remote desktop alternative", category: "tech", icon: "Monitor", color: "#39ff14", source: "GitHub", isNew: true },
  { id: "fb-36", text: "Next.js 15 brings Turbopack for faster builds", category: "tech", icon: "Layers", color: "#ffffff", source: "Vercel", isNew: true },
  { id: "fb-37", text: "Tailwind CSS 4.0 with performance improvements", category: "tech", icon: "Paintbrush", color: "#38bdf8", source: "Tailwind" },
  { id: "fb-38", text: "PostgreSQL 17 beta with enhanced JSON support", category: "tech", icon: "Database", color: "#336791", source: "PostgreSQL" },
];

// AI-Powered Categorization using OpenAI
async function categorizeWithAI(text: string, title: string): Promise<{ category: NewsItem["category"]; icon: string; color: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fallback to keyword matching if no API key
    return categorizeWithKeywords(text, title);
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a tech news categorizer. Analyze the text and return ONLY a JSON object with: category (one of: docker, unraid, homelab, m365, azure, github, ai, tech), icon (Container, HardDrive, Server, Cloud, GitBranch, Brain, Cpu, or Layers), and color (hex code). Categories: docker=container tech, unraid=NAS/storage, homelab=self-hosting, m365=Microsoft 365, azure=Microsoft cloud, github=development/FOSS, ai=AI/ML, tech=general tech.`
          },
          {
            role: "user",
            content: `Title: "${title}"\nContent: "${text.substring(0, 500)}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        category: result.category || "tech",
        icon: result.icon || "Cpu",
        color: result.color || "#64748b",
      };
    }
    
    return categorizeWithKeywords(text, title);
  } catch (error) {
    console.error("[News API] AI categorization failed:", error);
    return categorizeWithKeywords(text, title);
  }
}

// Fallback keyword-based categorization
function categorizeWithKeywords(text: string, title: string): { category: NewsItem["category"]; icon: string; color: string } {
  const fullText = `${title} ${text}`.toLowerCase();
  
  if (fullText.includes("docker") || fullText.includes("kubernetes") || fullText.includes("container") || fullText.includes("k8s") || fullText.includes("podman")) {
    return { category: "docker", icon: "Container", color: "#2496ed" };
  }
  if (fullText.includes("unraid") || fullText.includes("truenas") || fullText.includes("nas")) {
    return { category: "unraid", icon: "HardDrive", color: "#ff6c00" };
  }
  if (fullText.includes("homelab") || fullText.includes("self-host") || fullText.includes("proxmox") || fullText.includes("pihole") || fullText.includes("server")) {
    return { category: "homelab", icon: "Server", color: "#e57000" };
  }
  if (fullText.includes("m365") || fullText.includes("microsoft 365") || fullText.includes("teams") || fullText.includes("exchange") || fullText.includes("sharepoint")) {
    return { category: "m365", icon: "Cloud", color: "#0078d4" };
  }
  if (fullText.includes("azure") || fullText.includes("aws") || fullText.includes("gcp") || fullText.includes("cloud")) {
    return { category: "azure", icon: "Cloud", color: "#0089d6" };
  }
  if (fullText.includes("github") || fullText.includes("git") || fullText.includes("open source") || fullText.includes("repository")) {
    return { category: "github", icon: "GitBranch", color: "#39ff14" };
  }
  if (fullText.includes("ai") || fullText.includes("gpt") || fullText.includes("llm") || fullText.includes("openai") || fullText.includes("claude") || fullText.includes("machine learning") || fullText.includes("neural")) {
    return { category: "ai", icon: "Brain", color: "#10a37f" };
  }
  
  return { category: "tech", icon: "Cpu", color: "#64748b" };
}

// Fetch GitHub Trending Repositories
async function fetchGitHubTrending(): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Fetch trending repos from GitHub API
    const response = await fetch(
      "https://api.github.com/search/repositories?q=created:>2024-01-01&sort=stars&order=desc&per_page=10",
      { 
        signal: controller.signal,
        headers: { "Accept": "application/vnd.github.v3+json" }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error("Failed to fetch GitHub trending");
    
    const data = await response.json();
    
    return data.items.slice(0, 8).map((repo: any) => {
      const title = repo.name || "";
      const description = repo.description || "";
      const fullText = `${title} ${description}`;
      
      // Use AI categorization if available, fallback to keywords
      const { category, icon, color } = categorizeWithKeywords(fullText, title);
      
      return {
        id: `gh-${repo.id}`,
        text: `⭐ ${repo.stargazers_count.toLocaleString()} | ${repo.name}: ${repo.description?.substring(0, 60) || "No description"}${repo.description?.length > 60 ? "..." : ""}`,
        category,
        icon,
        color,
        url: repo.html_url,
        source: "GitHub",
        isNew: repo.stargazers_count > 1000,
      };
    });
  } catch (error) {
    console.error("[News API] GitHub trending fetch failed:", error);
    return [];
  }
}

// Fetch Dev.to Tech Articles
async function fetchDevTo(): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      "https://dev.to/api/articles?top=1&per_page=10",
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error("Failed to fetch Dev.to articles");
    
    const articles = await response.json();
    
    return articles.slice(0, 8).map((article: any) => {
      const title = article.title?.toLowerCase() || "";
      const tags = article.tag_list?.join(" ").toLowerCase() || "";
      const fullText = `${title} ${tags}`;
      
      let category: NewsItem["category"] = "tech";
      let icon = "Cpu";
      let color = "#64748b";
      
      if (fullText.includes("docker") || fullText.includes("kubernetes") || fullText.includes("container")) {
        category = "docker";
        icon = "Container";
        color = "#2496ed";
      } else if (fullText.includes("react") || fullText.includes("nextjs") || fullText.includes("vue") || fullText.includes("angular") || fullText.includes("javascript") || fullText.includes("typescript")) {
        category = "github";
        icon = "Code";
        color = "#39ff14";
      } else if (fullText.includes("ai") || fullText.includes("machine learning") || fullText.includes("python")) {
        category = "ai";
        icon = "Brain";
        color = "#10a37f";
      } else if (fullText.includes("cloud") || fullText.includes("aws") || fullText.includes("azure")) {
        category = "azure";
        icon = "Cloud";
        color = "#0089d6";
      }
      
      return {
        id: `dev-${article.id}`,
        text: article.title,
        category,
        icon,
        color,
        url: article.url,
        source: "Dev.to",
        isNew: article.positive_reactions_count > 50,
      };
    });
  } catch (error) {
    console.error("[News API] Dev.to fetch failed:", error);
    return [];
  }
}

// Fetch Product Hunt
async function fetchProductHunt(): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Product Hunt API requires authentication
    // Using their public GraphQL endpoint
    const response = await fetch(
      "https://www.producthunt.com/frontend/graphql",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              posts(first: 8) {
                edges {
                  node {
                    id
                    name
                    tagline
                    url
                    votesCount
                    topics {
                      edges {
                        node {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          `
        })
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Product Hunt requires auth, fallback to placeholder
      console.log("[News API] Product Hunt requires authentication, skipping");
      return [];
    }
    
    const data = await response.json();
    
    if (!data.data?.posts?.edges) return [];
    
    return data.data.posts.edges.slice(0, 6).map((edge: any) => {
      const node = edge.node;
      const tagline = node.tagline?.toLowerCase() || "";
      const topics = node.topics?.edges?.map((e: any) => e.node.name.toLowerCase()).join(" ") || "";
      const fullText = `${tagline} ${topics}`;
      
      let category: NewsItem["category"] = "tech";
      let icon = "Layers";
      let color = "#ffffff";
      
      if (fullText.includes("ai") || fullText.includes("gpt") || fullText.includes("machine learning")) {
        category = "ai";
        icon = "Brain";
        color = "#10a37f";
      } else if (fullText.includes("dev") || fullText.includes("code") || fullText.includes("developer")) {
        category = "github";
        icon = "Code";
        color = "#39ff14";
      } else if (fullText.includes("cloud") || fullText.includes("hosting")) {
        category = "azure";
        icon = "Cloud";
        color = "#0089d6";
      }
      
      return {
        id: `ph-${node.id}`,
        text: `🔥 ${node.votesCount} | ${node.name}: ${node.tagline}`,
        category,
        icon,
        color,
        url: node.url,
        source: "Product Hunt",
        isNew: node.votesCount > 100,
      };
    });
  } catch (error) {
    console.error("[News API] Product Hunt fetch failed:", error);
    return [];
  }
}

// Fetch Mastodon Tech Posts (from popular tech instances)
async function fetchMastodon(): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Try to fetch from mastodon.social tech hashtag
    const response = await fetch(
      "https://mastodon.social/api/v1/timelines/tag/tech?limit=8",
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error("Failed to fetch Mastodon");
    
    const posts = await response.json();
    
    return posts.slice(0, 6).map((post: any) => {
      const content = post.content?.toLowerCase() || "";
      
      let category: NewsItem["category"] = "tech";
      let icon = "MessageSquare";
      let color = "#6364ff";
      
      if (content.includes("docker") || content.includes("kubernetes")) {
        category = "docker";
        icon = "Container";
        color = "#2496ed";
      } else if (content.includes("linux") || content.includes("server") || content.includes("homelab")) {
        category = "homelab";
        icon = "Server";
        color = "#e57000";
      } else if (content.includes("ai") || content.includes("gpt") || content.includes("claude")) {
        category = "ai";
        icon = "Brain";
        color = "#10a37f";
      }
      
      // Strip HTML tags from content
      const text = post.content?.replace(/<[^>]*>/g, "").substring(0, 100) || "";
      
      return {
        id: `masto-${post.id}`,
        text: `${text}${text.length >= 100 ? "..." : ""}`,
        category,
        icon,
        color,
        url: post.url,
        source: "Mastodon",
        isNew: post.reblogged || post.favourited,
      };
    });
  } catch (error) {
    console.error("[News API] Mastodon fetch failed:", error);
    return [];
  }
}

// Fetch HackerNews Top Stories
async function fetchHackerNews(): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const topStoriesRes = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!topStoriesRes.ok) throw new Error("Failed to fetch HN top stories");
    
    const storyIds: number[] = await topStoriesRes.json();
    const topIds = storyIds.slice(0, 12);
    
    const stories = await Promise.all(
      topIds.map(async (id) => {
        try {
          const storyRes = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
            { signal: controller.signal }
          );
          if (!storyRes.ok) return null;
          const story = await storyRes.json();
          
          const title = story.title?.toLowerCase() || "";
          let category: NewsItem["category"] = "tech";
          let icon = "Cpu";
          let color = "#64748b";
          
          if (title.includes("docker") || title.includes("container") || title.includes("kubernetes") || title.includes("k8s") || title.includes("podman")) {
            category = "docker";
            icon = "Container";
            color = "#2496ed";
          } else if (title.includes("azure") || title.includes("aws") || title.includes("gcp") || title.includes("cloud")) {
            category = "azure";
            icon = "Cloud";
            color = "#0089d6";
          } else if (title.includes("microsoft") || title.includes("m365") || title.includes("office 365") || title.includes("teams") || title.includes("exchange")) {
            category = "m365";
            icon = "Cloud";
            color = "#0078d4";
          } else if (title.includes("homelab") || title.includes("self-host") || title.includes("nas") || title.includes("proxmox") || title.includes("pihole") || title.includes("pfsense")) {
            category = "homelab";
            icon = "Server";
            color = "#e57000";
          } else if (title.includes("unraid") || title.includes("truenas")) {
            category = "unraid";
            icon = "HardDrive";
            color = "#ff6c00";
          } else if (title.includes("ai") || title.includes("gpt") || title.includes("llm") || title.includes("openai") || title.includes("claude") || title.includes("machine learning") || title.includes("neural")) {
            category = "ai";
            icon = "Brain";
            color = "#10a37f";
          } else if (title.includes("github") || title.includes("git") || title.includes("open source")) {
            category = "github";
            icon = "GitBranch";
            color = "#39ff14";
          }
          
          return {
            id: `hn-${story.id}`,
            text: story.title,
            category,
            icon,
            color,
            url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            source: "HN",
            isNew: story.score > 100,
          };
        } catch {
          return null;
        }
      })
    );
    
    return stories.filter((s) => s !== null) as NewsItem[];
  } catch (error) {
    console.error("[News API] HackerNews fetch failed:", error);
    return [];
  }
}

export async function GET() {
  const requestStart = Date.now();
  
  try {
    console.log("[News API] Fetching tech news from multiple sources...");
    
    // Fetch from all sources in parallel
    const [hnNews, gitHubTrending, devToArticles, productHunt, mastodonPosts] = await Promise.all([
      fetchHackerNews(),
      fetchGitHubTrending(),
      fetchDevTo(),
      fetchProductHunt(),
      fetchMastodon(),
    ]);
    
    // Combine all sources
    const allApiNews = [
      ...hnNews,
      ...gitHubTrending,
      ...devToArticles,
      ...productHunt,
      ...mastodonPosts,
    ];
    
    console.log(`[News API] Sources: HN(${hnNews.length}) GH(${gitHubTrending.length}) DevTo(${devToArticles.length}) PH(${productHunt.length}) Mastodon(${mastodonPosts.length})`);
    
    // If we got news from APIs, mix with fallback
    let allNews: NewsItem[];
    if (allApiNews.length > 0) {
      // Mix API news with fallback (70/30)
      const mixed = [...allApiNews.slice(0, 16), ...fallbackNews.slice(0, 8)];
      allNews = mixed.sort(() => Math.random() - 0.5); // Shuffle
    } else {
      allNews = [...fallbackNews];
    }
    
    // Ensure we have at least 24 items for 3 rows (8 per row)
    while (allNews.length < 24) {
      allNews = [...allNews, ...fallbackNews];
    }
    
    const limitedNews = allNews.slice(0, 24);
    
    const duration = Date.now() - requestStart;
    console.log(`[News API] ✅ Returning ${limitedNews.length} items in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      items: limitedNews,
      sources: {
        hackerNews: hnNews.length,
        gitHub: gitHubTrending.length,
        devTo: devToArticles.length,
        productHunt: productHunt.length,
        mastodon: mastodonPosts.length,
        fallback: fallbackNews.length,
      },
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("[News API] ❌ Failed:", error);
    
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      error: error.message,
      items: fallbackNews,
      sources: { 
        hackerNews: 0, 
        gitHub: 0, 
        devTo: 0, 
        productHunt: 0, 
        mastodon: 0,
        fallback: fallbackNews.length 
      },
    }, { 
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}
