import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Lazy initialization - prüfe Key erst bei Request
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set in environment");
  }
  return new Anthropic({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, category } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();

    // Generate blog content with Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: `You are a technical blog writer for BEDCAVE, a blog about homelabs, Docker, hardware, and tech.
      
      CRITICAL INSTRUCTIONS:
      1. Return ONLY a valid JSON object - no markdown, no explanations, no code blocks wrapping the JSON
      2. The content field must contain the full blog post in markdown format (escaped for JSON)
      3. Escape newlines as \\n and quotes as \\"
      4. Code snippets should use triple backticks
      
      JSON structure:
      {
        "title": "Blog Post Title",
        "excerpt": "Short description", 
        "content": "Full markdown content with escaped newlines",
        "tags": ["docker", "tutorial"],
        "keywords": ["docker compose", "containers"]
      }
      
      Requirements:
      - 500-800 words (shorter to fit in response)
      - Practical examples with code snippets
      - Clear section headers
      - Technical but accessible tone
      - Brief intro and conclusion`,
      messages: [
        {
          role: "user",
          content: `Write a blog post about: ${prompt}
          
          Category: ${category || "tech"}
          
          Target audience: Tech enthusiasts, homelab builders, developers
          
          Return ONLY the JSON object, no markdown formatting around it.`,
        },
      ],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";
    
    // Parse JSON response - content is directly in the JSON
    let blogData;
    try {
      // Try to extract JSON from markdown code blocks first
      let jsonString = content;
      
      // Look for JSON in code blocks
      const codeBlockMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      }
      
      // Try to find JSON object boundaries
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }
      
      // Clean up the string - handle unescaped newlines
      jsonString = jsonString
        .trim()
        .replace(/\n/g, '\\n')  // Escape newlines
        .replace(/\t/g, '\\t'); // Escape tabs
      
      blogData = JSON.parse(jsonString);
      
      // Unescape content for display
      if (blogData.content && typeof blogData.content === 'string') {
        blogData.content = blogData.content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      }
    } catch (parseError: any) {
      console.error("Failed to parse Claude response:", content);
      return NextResponse.json(
        { error: `Failed to parse generated content: ${parseError.message}. Raw: ${content.substring(0, 300)}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blogData,
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: `Failed to generate content: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
