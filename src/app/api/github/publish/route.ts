import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "Tripleiks/bedcave-frontend";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

export async function POST(request: NextRequest) {
  try {
    const { title, content, category, tags, excerpt, imageUrl, sticky } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "GITHUB_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Generate filename from title
    const date = new Date().toISOString().split("T")[0];
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `content/posts/${slug}.mdx`;

    // Create MDX content
    const mdxContent = `---
title: "${title}"
date: "${date}"
excerpt: "${excerpt || title}"
category: "${category || "General"}"
${imageUrl ? `coverImage: "${imageUrl}"` : ""}
tags: [${(tags || []).map((t: string) => `"${t}"`).join(", ")}]
author: "Grok Aurora"
sticky: ${sticky || false}
---

${content}
`;

    // Get the current commit SHA for the branch
    const branchResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/git/ref/heads/${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!branchResponse.ok) {
      const error = await branchResponse.text();
      console.error("GitHub branch error:", error);
      throw new Error("Failed to get branch reference");
    }

    const branchData = await branchResponse.json();
    const latestCommitSha = branchData.object.sha;

    // Get the tree for the latest commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/git/commits/${latestCommitSha}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!commitResponse.ok) {
      throw new Error("Failed to get commit data");
    }

    const commitData = await commitResponse.json();
    const treeSha = commitData.tree.sha;

    // Create a new blob with the file content
    const blobResponse = await fetch(
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
      throw new Error("Failed to create blob");
    }

    const blobData = await blobResponse.json();

    // Create a new tree with the new file
    const treeResponse = await fetch(
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
      throw new Error("Failed to create tree");
    }

    const newTreeData = await treeResponse.json();

    // Create a new commit
    const newCommitResponse = await fetch(
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
      throw new Error("Failed to create commit");
    }

    const newCommitData = await newCommitResponse.json();

    // Update the branch reference to point to the new commit
    const updateRefResponse = await fetch(
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
      throw new Error("Failed to update branch reference");
    }

    return NextResponse.json({
      success: true,
      message: "Blog post created successfully",
      filename,
      commitSha: newCommitData.sha,
    });
  } catch (error: any) {
    console.error("GitHub API Error:", error);
    return NextResponse.json(
      { error: `Failed to publish post: ${error.message}` },
      { status: 500 }
    );
  }
}
