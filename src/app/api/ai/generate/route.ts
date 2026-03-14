import { NextRequest, NextResponse } from "next/server";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

// Lazy initialization - prüfe Key erst bei Request
function getPerplexityClient() {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY not set in environment");
  }
  return PERPLEXITY_API_KEY;
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

    const apiKey = getPerplexityClient();

    const systemPrompt = `You are a technical blog writer for BEDCAVE, a blog about homelabs, Docker, hardware, and tech.

CRITICAL INSTRUCTIONS:
1. Return a JSON object with metadata (title, excerpt, tags, keywords)
2. AFTER the JSON, on a new line starting with "CONTENT_START", provide the full markdown content
3. End the content with "CONTENT_END" on its own line
4. This format avoids JSON escaping issues with code blocks

Format:
{
  "title": "Blog Post Title",
  "excerpt": "Short description",
  "tags": ["docker", "tutorial"],
  "keywords": ["docker compose", "containers"]
}
CONTENT_START
# Full Markdown Content Here

With code examples:
\`\`\`yaml
version: '3'
\`\`\`
CONTENT_END

Requirements:
- 1200-1500 words
- Practical examples with code snippets
- Clear section headers
- Technical but accessible tone
- Brief intro and conclusion
- Cite sources using [^1^], [^2^] format in the content
- Add a "Sources" section at the end with URLs`;
    const userPrompt = `Write a blog post about: ${prompt}

Category: ${category || "tech"}

Target audience: Tech enthusiasts, homelab builders, developers

Return ONLY the JSON object, no markdown formatting around it.`;

    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Perplexity API error: ${response.status}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    const citations = data.citations || [];
    
    // Parse response - JSON metadata followed by CONTENT_START/CONTENT_END block
    let blogData: {
      title: string;
      excerpt: string;
      tags: string[];
      keywords: string[];
      content?: string;
      sources?: string[];
    };
    try {
      // Find JSON boundaries by counting braces to handle nested objects
      let jsonEnd = -1;
      let braceCount = 0;
      let inJson = false;
      const firstBrace = content.indexOf('{');
      
      if (firstBrace === -1) {
        throw new Error("No JSON object found in response");
      }
      
      // Walk through string to find where the JSON object ends
      for (let i = firstBrace; i < content.length; i++) {
        if (content[i] === '{') {
          braceCount++;
          inJson = true;
        } else if (content[i] === '}') {
          braceCount--;
          if (braceCount === 0 && inJson) {
            jsonEnd = i;
            break; // Found the end of the first JSON object
          }
        }
      }
      
      if (jsonEnd === -1) {
        throw new Error("Could not find complete JSON object");
      }
      
      const jsonString = content.substring(firstBrace, jsonEnd + 1);
      blogData = JSON.parse(jsonString);
      
      // Extract content between CONTENT_START and CONTENT_END
      const contentStart = content.indexOf('CONTENT_START');
      const contentEnd = content.indexOf('CONTENT_END');
      
      if (contentStart !== -1 && contentEnd !== -1 && contentEnd > contentStart) {
        blogData.content = content.substring(contentStart + 'CONTENT_START'.length, contentEnd).trim();
      } else {
        // Fallback: look for markdown content after the JSON object
        const afterJson = content.substring(jsonEnd + 1);
        // Remove any leading whitespace or markers
        blogData.content = afterJson.replace(/^\s*[\n\r]+/, '').trim();
      }
      // Add citations as sources
      if (citations.length > 0) {
        blogData.sources = citations;
      }
    } catch (parseError: any) {
      console.error("Failed to parse Perplexity response:", content);
      return NextResponse.json(
        { error: `Failed to parse generated content: ${parseError.message}. Raw: ${content.substring(0, 400)}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blogData,
      model: data.model,
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: `Failed to generate content: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
