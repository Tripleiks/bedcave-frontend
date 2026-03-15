import { NextRequest, NextResponse } from "next/server";

const XAI_API_KEY = process.env.XAI_API_KEY || "";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get("query") || "technology";

    if (!XAI_API_KEY) {
      console.error("XAI_API_KEY not configured");
      return NextResponse.json(
        { error: "XAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log("Generating image with Grok Aurora for prompt:", prompt);

    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-imagine-image",
        prompt: `Professional tech blog cover image: ${prompt}. Modern, clean, high quality, suitable for a technology blog. NO TEXT, NO WORDS, NO LETTERS, purely visual illustration.`,
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Grok API Error:", response.status, errorData);
      return NextResponse.json(
        { error: `Grok API error: ${response.status} - ${errorData}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("Grok API response:", JSON.stringify(data, null, 2));
    
    const imageUrl = data.data?.[0]?.url;
    
    if (!imageUrl) {
      console.error("No image URL in response:", data);
      return NextResponse.json(
        { error: "No image generated - missing URL in response" },
        { status: 500 }
      );
    }

    // Save to image library
    try {
      const libraryResponse = await fetch(`${request.headers.get("origin") || "http://localhost:3000"}/api/images/library`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imageUrl,
          title: prompt,
          prompt: `Professional tech blog cover image: ${prompt}`,
          tags: ["ai-generated", "cover-image"],
          category: "general",
          source: "grok-aurora"
        }),
      });
      
      if (!libraryResponse.ok) {
        console.warn("Failed to save to library:", await libraryResponse.text());
      } else {
        console.log("Image saved to library successfully");
      }
    } catch (libError) {
      console.warn("Library save error (non-critical):", libError);
      // Don't fail the main request if library save fails
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.created || Date.now().toString(),
        url: imageUrl,
        thumb: imageUrl,
        author: "Grok Aurora AI",
        authorUrl: "https://x.ai",
        description: `AI-generated: ${prompt}`,
      },
    });
  } catch (error: any) {
    console.error("Grok Aurora API Error:", error);
    return NextResponse.json(
      { error: `Failed to generate image: ${error.message}` },
      { status: 500 }
    );
  }
}
