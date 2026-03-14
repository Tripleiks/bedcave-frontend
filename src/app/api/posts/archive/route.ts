import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts", "generated");

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

    // Write file
    await fs.writeFile(filepath, mdxContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Post archived successfully",
      filename,
      path: `content/posts/generated/${filename}`,
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
