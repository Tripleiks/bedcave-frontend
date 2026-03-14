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
      max_tokens: 4000,
      system: `You are a technical blog writer for BEDCAVE, a blog about homelabs, Docker, hardware, and tech. 
      Write engaging, informative blog posts with a technical but accessible tone.
      
      CRITICAL: Return ONLY a valid JSON object. No markdown, no code blocks, no explanations before or after.
      
      The JSON must have these exact fields:
      - title: A catchy, SEO-friendly title (string)
      - excerpt: A compelling 2-3 sentence summary (string)
      - content: The full blog post content in Markdown format (string, properly escaped)
      - tags: An array of 3-5 relevant tags (array of strings)
      - keywords: An array of SEO keywords (array of strings)
      
      The content should:
      - Be 800-1500 words
      - Include practical examples and code snippets where relevant
      - Have clear sections with headers
      - Be technically accurate but accessible
      - Include a brief introduction and conclusion
      
      IMPORTANT: Ensure all newlines in the content field are properly escaped as \\n in the JSON.`,
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
    
    // Parse JSON response
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
      
      // Clean up the string
      jsonString = jsonString.trim();
      
      blogData = JSON.parse(jsonString);
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
