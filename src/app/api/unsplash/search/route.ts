import { NextRequest, NextResponse } from "next/server";

const XAI_API_KEY = process.env.XAI_API_KEY || "";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get("query") || "technology";

    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "aurora",
        prompt: `Professional tech blog cover image: ${prompt}. Modern, clean, high quality, suitable for a technology blog.`,
        n: 1,
        size: "1024x768",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Grok API Error:", errorData);
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    
    const imageUrl = data.data?.[0]?.url;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
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
  } catch (error) {
    console.error("Grok Aurora API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
