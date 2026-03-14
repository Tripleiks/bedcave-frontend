import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "Tripleiks/bedcave-frontend";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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
      
      // Success or non-retryable error
      if (response.ok || response.status === 401 || response.status === 403) {
        return response;
      }
      
      // Retryable error (5xx, 429 rate limit, network issues)
      if (response.status >= 500 || response.status === 429) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response; // Return 4xx errors without retry
    } catch (error: any) {
      lastError = error;
      
      if (attempt < retries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`[GitHub API] Retry ${attempt}/${retries} after ${delay}ms: ${error.message}`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError || new Error(`Failed after ${retries} retries`);
}

// Utility: Generate consistent, readable slug from title
function generateConsistentSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 60); // Reasonable length limit
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
  
  if (data.content.length > 100000) {
    return { valid: false, error: "Content too large (max 100KB)" };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  
  try {
    // Validate request body size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
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

    const { title, content, category, tags, excerpt, imageUrl, sticky } = body;

    if (!GITHUB_TOKEN) {
      console.error("[Publish] GITHUB_TOKEN not configured");
      return NextResponse.json(
        { error: "GITHUB_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Generate consistent filename
    const date = new Date().toISOString().split("T")[0];
    const consistentSlug = generateConsistentSlug(title);
    const filename = `content/posts/${consistentSlug}.mdx`;

    console.log(`[Publish] Starting publish for "${title}" → ${filename}`);

    // Create MDX content
    const mdxContent = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
excerpt: "${(excerpt || title).replace(/"/g, '\\"')}"
category: "${category || "General"}"
${imageUrl ? `coverImage: "${imageUrl}"` : ""}
tags: [${(tags || []).map((t: string) => `"${t.replace(/"/g, '\\"')}"`).join(", ")}]
author: "Grok Aurora"
sticky: ${sticky || false}
---

${content}
`;

    // Get the current commit SHA for the branch
    console.log(`[Publish] Fetching branch reference...`);
    const branchResponse = await fetchWithRetry(
      `https://api.github.com/repos/${GITHUB_REPO}/git/ref/heads/${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!branchResponse.ok) {
      const errorText = await branchResponse.text();
      console.error(`[Publish] Branch fetch failed: ${errorText}`);
      throw new Error(`Failed to get branch reference: ${branchResponse.status}`);
    }

    const branchData = await branchResponse.json();
    const latestCommitSha = branchData.object.sha;
    console.log(`[Publish] Latest commit: ${latestCommitSha.substring(0, 8)}`);

    // Get the tree for the latest commit
    console.log(`[Publish] Fetching commit tree...`);
    const commitResponse = await fetchWithRetry(
      `https://api.github.com/repos/${GITHUB_REPO}/git/commits/${latestCommitSha}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!commitResponse.ok) {
      throw new Error(`Failed to get commit data: ${commitResponse.status}`);
    }

    const commitData = await commitResponse.json();
    const treeSha = commitData.tree.sha;

    // Create a new blob with the file content
    console.log(`[Publish] Creating blob...`);
    const blobResponse = await fetchWithRetry(
      `https://api.github.com/repos/${GITHUB_REPO}/git/blobs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: mdxContent,
          encoding: "utf-8",
        }),
      }
    );

    if (!blobResponse.ok) {
      throw new Error(`Failed to create blob: ${blobResponse.status}`);
    }

    const blobData = await blobResponse.json();

    // Create a new tree with the new file
    console.log(`[Publish] Creating tree...`);
    const treeResponse = await fetchWithRetry(
      `https://api.github.com/repos/${GITHUB_REPO}/git/trees`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base_tree: treeSha,
          tree: [
            {
              path: filename,
              mode: "100644",
              type: "blob",
              sha: blobData.sha,
            },
          ],
        }),
      }
    );

    if (!treeResponse.ok) {
      throw new Error(`Failed to create tree: ${treeResponse.status}`);
    }

    const newTreeData = await treeResponse.json();

    // Create a new commit
    console.log(`[Publish] Creating commit...`);
    const newCommitResponse = await fetchWithRetry(
      `https://api.github.com/repos/${GITHUB_REPO}/git/commits`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `feat: Add blog post "${title}"`,
          tree: newTreeData.sha,
          parents: [latestCommitSha],
        }),
      }
    );

    if (!newCommitResponse.ok) {
      throw new Error(`Failed to create commit: ${newCommitResponse.status}`);
    }

    const newCommitData = await newCommitResponse.json();

    // Update the branch reference to point to the new commit
    console.log(`[Publish] Updating branch reference...`);
    const updateRefResponse = await fetchWithRetry(
      `https://api.github.com/repos/${GITHUB_REPO}/git/refs/heads/${GITHUB_BRANCH}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sha: newCommitData.sha,
          force: false,
        }),
      }
    );

    if (!updateRefResponse.ok) {
      throw new Error(`Failed to update branch reference: ${updateRefResponse.status}`);
    }

    const duration = Date.now() - requestStartTime;
    console.log(`[Publish] ✅ Success in ${duration}ms: ${filename}`);

    return NextResponse.json({
      success: true,
      message: "Blog post created successfully",
      filename,
      commitSha: newCommitData.sha,
      duration: `${duration}ms`,
    });
  } catch (error: any) {
    const duration = Date.now() - requestStartTime;
    console.error(`[Publish] ❌ Failed after ${duration}ms:`, error);
    return NextResponse.json(
      { 
        error: `Failed to publish post: ${error.message}`,
        details: error.stack?.split('\n')[0]
      },
      { status: 500 }
    );
  }
}
