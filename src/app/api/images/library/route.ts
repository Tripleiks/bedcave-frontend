import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IMAGES_LIBRARY_PATH = path.join(process.cwd(), "content", "images", "library.json");

interface ImageEntry {
  id: string;
  url: string;
  title: string;
  prompt: string;
  tags: string[];
  category: string;
  createdAt: string;
  usedInPosts: string[];
  source: string;
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
    
    // Generate unique ID
    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newImage: ImageEntry = {
      id,
      url,
      title,
      prompt: prompt || title,
      tags: tags || [],
      category: category || "general",
      createdAt: new Date().toISOString(),
      usedInPosts: [],
      source
    };
    
    library.images.push(newImage);
    
    // Update stats
    library.stats.totalImages = library.images.length;
    library.stats.byCategory[newImage.category] = (library.stats.byCategory[newImage.category] || 0) + 1;
    
    writeLibrary(library);
    
    return NextResponse.json({
      success: true,
      image: newImage,
      stats: library.stats
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
