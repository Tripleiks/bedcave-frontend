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
      
      Format your response as a JSON object with these fields:
      - title: A catchy, SEO-friendly title
      - excerpt: A compelling 2-3 sentence summary
      - content: The full blog post content in Markdown format
      - tags: An array of 3-5 relevant tags
      - keywords: An array of SEO keywords
      
      The content should:
      - Be 800-1500 words
      - Include practical examples and code snippets where relevant
      - Have clear sections with headers
      - Be technically accurate but accessible
      - Include a brief introduction and conclusion`,
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
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      let jsonString = jsonMatch ? jsonMatch[1] : content;
      
      // Trim whitespace and find JSON boundaries
      jsonString = jsonString.trim();
      
      // If content starts with { and ends with }, use that directly
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }
      
      blogData = JSON.parse(jsonString);
    } catch (parseError: any) {
      console.error("Failed to parse Claude response:", content);
      return NextResponse.json(
        { error: `Failed to parse generated content: ${parseError.message}. Raw content: ${content.substring(0, 500)}` },
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
