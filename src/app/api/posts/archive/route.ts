import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts", "archive");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "Tripleiks/bedcave-frontend";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Utility: Sleep for retry delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Fetch with timeout and retry
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries = MAX_RETRIES,
  timeout = 10000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 401 || response.status === 403) {
        return response;
      }
      
      if (response.status >= 500 || response.status === 429) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      
      if (attempt < retries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`[Archive API] Retry ${attempt}/${retries} after ${delay}ms: ${error.message}`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError || new Error(`Failed after ${retries} retries`);
}

// Utility: Generate unique filename
function generateUniqueFilename(title: string): string {
  const timestamp = Date.now().toString(36);
  const date = new Date().toISOString().split("T")[0];
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 40);
  return `${date}-${baseSlug}-${timestamp}.mdx`;
}

// Utility: Validate input data
function validatePostData(data: any): { valid: boolean; error?: string } {
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
    return { valid: false, error: "Title must be at least 3 characters" };
  }
  
  if (!data.content || typeof data.content !== 'string' || data.content.trim().length < 10) {
    return { valid: false, error: "Content must be at least 10 characters" };
  }
  
  if (data.title.length > 200) {
    return { valid: false, error: "Title too long (max 200 characters)" };
  }
  
  return { valid: true };
}

// Commit file to GitHub with retry logic
async function commitToGitHub(
  filename: string,
  content: string,
  message: string,
  maxRetries = 3
): Promise<{ success: boolean; sha?: string; error?: string; retries?: number }> {
  if (!GITHUB_TOKEN) {
    return { success: false, error: "GITHUB_TOKEN not configured" };
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/content/posts/archive/${filename}`;
  const base64Content = Buffer.from(content).toString("base64");

  let lastError = "";
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check if file exists
      let sha: string | undefined;
      try {
        const checkRes = await fetchWithRetry(`${apiUrl}?ref=${GITHUB_BRANCH}`, {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        if (checkRes.ok) {
          const data = await checkRes.json();
          sha = data.sha;
        }
      } catch {
        // File doesn't exist, which is fine
      }

      // Create or update file
      const body: any = {
        message,
        content: base64Content,
        branch: GITHUB_BRANCH,
      };
      if (sha) body.sha = sha;

      const res = await fetchWithRetry(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      return { success: true, sha: data.content?.sha, retries: attempt };
    } catch (error: any) {
      lastError = error.message;
      console.error(`[Archive] Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }

  return { success: false, error: lastError, retries: maxRetries };
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  
  try {
    // Validate request body size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        { error: "Request body too large (max 1MB)" },
        { status: 413 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = validatePostData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { title, content, category, tags, excerpt, imageUrl, author = "Bedcave Team", sticky = false } = body;

    // Generate unique filename
    const filename = generateUniqueFilename(title);

    console.log(`[Archive] Starting archive for "${title}" → ${filename}`);

    // Create MDX content with proper escaping
    const mdxContent = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${new Date().toISOString().split("T")[0]}"
excerpt: "${(excerpt || title).replace(/"/g, '\\"')}"
category: "${category || "General"}"
${imageUrl ? `coverImage: "${imageUrl}"` : ""}
tags: [${(tags || []).map((t: string) => `"${t.replace(/"/g, '\\"')}"`).join(", ")}]
author: "${author.replace(/"/g, '\\"')}"
sticky: ${sticky}
generatedAt: "${new Date().toISOString()}"
source: "bedcave-admin"
---

${content}
`;

    // Try GitHub first (works on Vercel)
    let githubResult;
    if (GITHUB_TOKEN) {
      console.log(`[Archive] Attempting GitHub commit...`);
      githubResult = await commitToGitHub(
        filename,
        mdxContent,
        `feat: add archived post "${title}"`
      );
      
      if (githubResult.success) {
        const duration = Date.now() - requestStartTime;
        console.log(`[Archive] ✅ GitHub success in ${duration}ms (retries: ${githubResult.retries})`);
        return NextResponse.json({
          success: true,
          message: "Post archived successfully to GitHub",
          filename,
          path: `content/posts/archive/${filename}`,
          github: true,
          duration: `${duration}ms`,
          retries: githubResult.retries,
        });
      }
    }

    // Fallback: Try local write (works in dev only)
    console.log(`[Archive] GitHub failed, trying local fallback...`);
    try {
      await fs.mkdir(POSTS_DIR, { recursive: true });
      const filepath = path.join(POSTS_DIR, filename);
      await fs.writeFile(filepath, mdxContent, "utf-8");
      
      const duration = Date.now() - requestStartTime;
      console.log(`[Archive] ✅ Local success in ${duration}ms`);
      return NextResponse.json({
        success: true,
        message: "Post archived successfully (local)",
        filename,
        path: `content/posts/archive/${filename}`,
        github: false,
        duration: `${duration}ms`,
      });
    } catch (localError) {
      console.error("[Archive] Local write failed:", localError);
    }

    // If we get here, both methods failed
    const duration = Date.now() - requestStartTime;
    console.error(`[Archive] ❌ All methods failed after ${duration}ms`);
    return NextResponse.json(
      { 
        error: githubResult?.error || "Failed to save post. GITHUB_TOKEN may not be configured.",
        details: "Please check your environment variables in Vercel dashboard.",
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  } catch (error: any) {
    const duration = Date.now() - requestStartTime;
    console.error(`[Archive] ❌ Failed after ${duration}ms:`, error);
    return NextResponse.json(
      { 
        error: `Failed to archive post: ${error.message}`,
        details: error.stack?.split('\n')[0],
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}

// List all archived posts
export async function GET() {
  try {
    await fs.mkdir(POSTS_DIR, { recursive: true });
    const files = await fs.readdir(POSTS_DIR);
    
    const posts = await Promise.all(
      files
        .filter(f => f.endsWith(".mdx"))
        .map(async (filename) => {
          const stat = await fs.stat(path.join(POSTS_DIR, filename));
          return {
            filename,
            path: `content/posts/archive/${filename}`,
            createdAt: stat.birthtime.toISOString(),
            size: stat.size,
          };
        })
    );

    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length,
    });
  } catch (error: any) {
    console.error("List Archive Error:", error);
    return NextResponse.json(
      { error: `Failed to list archived posts: ${error.message}` },
      { status: 500 }
    );
  }
}
