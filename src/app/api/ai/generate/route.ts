import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, category } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Generate blog content with Claude
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
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
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      blogData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", content);
      return NextResponse.json(
        { error: "Failed to parse generated content" },
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
