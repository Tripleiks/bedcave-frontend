import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";

const IMAGES_LIBRARY_PATH = path.join(process.cwd(), "content", "images", "library.json");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "ai-generated");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "Tripleiks/bedcave-frontend";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

// Download image from URL and save locally
async function downloadImage(url: string, filename: string): Promise<{ localPath: string; relativeUrl: string } | null> {
  try {
    // Ensure images directory exists
    await fsPromises.mkdir(IMAGES_DIR, { recursive: true });
    
    // Fetch image
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to download image:", response.status);
      return null;
    }
    
    const buffer = await response.arrayBuffer();
    const localPath = path.join(IMAGES_DIR, filename);
    
    // Save locally
    await fsPromises.writeFile(localPath, Buffer.from(buffer));
    
    // Return relative URL for frontend
    const relativeUrl = `/images/ai-generated/${filename}`;
    
    return { localPath, relativeUrl };
  } catch (error) {
    console.error("Error downloading image:", error);
    return null;
  }
}

// Commit image to GitHub
async function commitImageToGitHub(
  filename: string,
  localPath: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!GITHUB_TOKEN) {
    return { success: false, error: "GITHUB_TOKEN not configured" };
  }

  try {
    // Read file and convert to base64
    const content = await fsPromises.readFile(localPath);
    const base64Content = Buffer.from(content).toString("base64");
    
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/images/ai-generated/${filename}`;
    
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
      // File doesn't exist
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

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

interface ImageEntry {
  id: string;
  url: string;
  originalUrl?: string;
  title: string;
  prompt: string;
  tags: string[];
  category: string;
  createdAt: string;
  usedInPosts: string[];
  source: string;
  githubCommitted?: boolean;
}

interface ImageLibrary {
  version: string;
  lastUpdated: string;
  images: ImageEntry[];
  stats: {
    totalImages: number;
    byCategory: Record<string, number>;
  };
}

// Helper to read library
function readLibrary(): ImageLibrary {
  try {
    if (!fs.existsSync(IMAGES_LIBRARY_PATH)) {
      return {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        images: [],
        stats: {
          totalImages: 0,
          byCategory: {}
        }
      };
    }
    const data = fs.readFileSync(IMAGES_LIBRARY_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading image library:", error);
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      images: [],
      stats: {
        totalImages: 0,
        byCategory: {}
      }
    };
  }
}

// Helper to write library
function writeLibrary(library: ImageLibrary) {
  try {
    // Ensure directory exists
    const dir = path.dirname(IMAGES_LIBRARY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    library.lastUpdated = new Date().toISOString();
    fs.writeFileSync(IMAGES_LIBRARY_PATH, JSON.stringify(library, null, 2));
  } catch (error) {
    console.error("Error writing image library:", error);
    throw error;
  }
}

// GET - List all images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    
    const library = readLibrary();
    
    let images = library.images;
    
    // Filter by category if provided
    if (category) {
      images = images.filter(img => img.category === category);
    }
    
    // Sort by newest first
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({
      success: true,
      images,
      stats: library.stats,
      total: images.length
    });
  } catch (error: any) {
    console.error("Image library GET error:", error);
    return NextResponse.json(
      { error: `Failed to fetch images: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST - Add new image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, prompt, tags, category, source = "grok-aurora" } = body;
    
    if (!url || !title) {
      return NextResponse.json(
        { error: "URL and title are required" },
        { status: 400 }
      );
    }
    
    const library = readLibrary();
    
    // Generate unique ID and filename
    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const filename = `${id}.png`;
    
    // Download image from external URL
    let localUrl = url;
    let githubSuccess = false;
    
    // Try to download and save locally
    const downloadResult = await downloadImage(url, filename);
    if (downloadResult) {
      localUrl = downloadResult.relativeUrl;
      
      // Try to commit to GitHub (for Vercel persistence)
      if (GITHUB_TOKEN) {
        const commitResult = await commitImageToGitHub(
          filename,
          downloadResult.localPath,
          `feat: add AI-generated image "${title}"`
        );
        githubSuccess = commitResult.success;
        if (!commitResult.success) {
          console.warn("GitHub commit failed (non-critical):", commitResult.error);
        }
      }
    } else {
      console.warn("Image download failed, using external URL");
    }
    
    const newImage: ImageEntry = {
      id,
      url: localUrl, // Use local URL if available, otherwise external
      originalUrl: url, // Keep original for reference
      title,
      prompt: prompt || title,
      tags: tags || [],
      category: category || "general",
      createdAt: new Date().toISOString(),
      usedInPosts: [],
      source,
      githubCommitted: githubSuccess
    };
    
    library.images.push(newImage);
    
    // Update stats
    library.stats.totalImages = library.images.length;
    library.stats.byCategory[newImage.category] = (library.stats.byCategory[newImage.category] || 0) + 1;
    
    writeLibrary(library);
    
    return NextResponse.json({
      success: true,
      image: newImage,
      stats: library.stats,
      downloaded: !!downloadResult,
      githubCommitted: githubSuccess
    });
  } catch (error: any) {
    console.error("Image library POST error:", error);
    return NextResponse.json(
      { error: `Failed to save image: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Remove image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }
    
    const library = readLibrary();
    const imageIndex = library.images.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }
    
    const removedCategory = library.images[imageIndex].category;
    library.images.splice(imageIndex, 1);
    
    // Update stats
    library.stats.totalImages = library.images.length;
    if (library.stats.byCategory[removedCategory]) {
      library.stats.byCategory[removedCategory]--;
    }
    
    writeLibrary(library);
    
    return NextResponse.json({
      success: true,
      message: "Image removed successfully",
      stats: library.stats
    });
  } catch (error: any) {
    console.error("Image library DELETE error:", error);
    return NextResponse.json(
      { error: `Failed to delete image: ${error.message}` },
      { status: 500 }
    );
  }
}
