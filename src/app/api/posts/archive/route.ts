import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts", "generated");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "Tripleiks/bedcave-frontend";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

// Commit file to GitHub (works on Vercel)
async function commitToGitHub(
  filename: string,
  content: string,
  message: string
): Promise<{ success: boolean; sha?: string; error?: string }> {
  if (!GITHUB_TOKEN) {
    return { success: false, error: "GITHUB_TOKEN not configured" };
  }

  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/content/posts/generated/${filename}`;
    const base64Content = Buffer.from(content).toString("base64");

    // Check if file exists
    let sha: string | undefined;
    try {
      const checkRes = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, {
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

    const res = await fetch(apiUrl, {
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
      return { success: false, error: error.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { success: true, sha: data.content?.sha };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, category, tags, excerpt, imageUrl, author = "Bedcave Team" } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Ensure directory exists
    await fs.mkdir(POSTS_DIR, { recursive: true });

    // Generate filename from title
    const date = new Date().toISOString().split("T")[0];
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `${date}-${slug}.mdx`;
    const filepath = path.join(POSTS_DIR, filename);

    // Create MDX content
    const mdxContent = `---
title: "${title}"
date: "${date}"
excerpt: "${excerpt || title}"
category: "${category || "General"}"
${imageUrl ? `coverImage: "${imageUrl}"` : ""}
tags: [${(tags || []).map((t: string) => `"${t}"`).join(", ")}]
author: "${author}"
generatedAt: "${new Date().toISOString()}"
source: "bedcave-admin"
---

${content}
`;

    // Try GitHub first (works on Vercel), fallback to local (dev only)
    let githubResult;
    if (GITHUB_TOKEN) {
      githubResult = await commitToGitHub(
        filename,
        mdxContent,
        `feat: add archived post "${title}"`
      );
    }

    // Try local write (works in dev, may fail on Vercel)
    let localPath: string | undefined;
    try {
      await fs.mkdir(POSTS_DIR, { recursive: true });
      const filepath = path.join(POSTS_DIR, filename);
      await fs.writeFile(filepath, mdxContent, "utf-8");
      localPath = `content/posts/generated/${filename}`;
    } catch (localError) {
      // Local write failed (expected on Vercel)
      console.log("Local write skipped (Vercel environment)");
    }

    if (!githubResult?.success && !localPath) {
      return NextResponse.json(
        { error: githubResult?.error || "Failed to save post" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post archived successfully",
      filename,
      path: localPath || `content/posts/generated/${filename}`,
      github: githubResult?.success || false,
    });
  } catch (error: any) {
    console.error("Archive Error:", error);
    return NextResponse.json(
      { error: `Failed to archive post: ${error.message}` },
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
            path: `content/posts/generated/${filename}`,
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
