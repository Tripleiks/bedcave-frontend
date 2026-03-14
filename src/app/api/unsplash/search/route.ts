import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "technology";
    const orientation = searchParams.get("orientation") || "landscape";

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&orientation=${orientation}&per_page=10`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return first image or null
    const image = data.results[0] || null;
    
    if (!image) {
      return NextResponse.json(
        { error: "No images found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: image.id,
        url: image.urls.regular,
        thumb: image.urls.small,
        downloadUrl: image.links.download_location,
        author: image.user.name,
        authorUrl: image.user.links.html,
        description: image.description || image.alt_description,
      },
    });
  } catch (error) {
    console.error("Unsplash API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
