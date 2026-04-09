import { Redis } from "@upstash/redis";
import { buildSystemPromptFromStructured } from "@/app/lib/buildSystemPromptFromStructured";
import { buildSystemPrompt } from "@/app/lib/defaultContent";

const redis = Redis.fromEnv();

export async function POST(request) {
  try {
    const { messages } = await request.json();

    let systemPrompt;
    try {
      const rawProperty = await redis.get("property:default");
      if (rawProperty) {
        const propertyData = typeof rawProperty === "string" ? JSON.parse(rawProperty) : rawProperty;
        systemPrompt = buildSystemPromptFromStructured(propertyData);
      }
    } catch {}

    if (!systemPrompt) {
      try {
        const rawSections = await redis.get("content:sections");
        const sections = rawSections ? (typeof rawSections === "string" ? JSON.parse(rawSections) : rawSections) : {};
        systemPrompt = buildSystemPrompt(sections);
      } catch {
        systemPrompt = buildSystemPrompt({});
      }
    }

    const filteredMessages = messages.filter((m) => m.role !== "system");

    // Agentic loop to handle web search tool use
    let currentMessages = filteredMessages;
    let finalText = "";
    let iterations = 0;
    const MAX_ITER = 5;

    while (iterations < MAX_ITER) {
      iterations++;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: systemPrompt,
          messages: currentMessages,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Fallback: retry without tools on error
        const fallback = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: systemPrompt,
            messages: filteredMessages,
          }),
        });
        const fallbackData = await fallback.json();
        finalText = fallbackData.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
        break;
      }

      const content = data.content || [];
      const textBlocks = content.filter(b => b.type === "text");
      finalText = textBlocks.map(b => b.text).join("");

      if (data.stop_reason !== "tool_use") break;

      // Handle tool use — send tool results back
      const toolUseBlocks = content.filter(b => b.type === "tool_use");
      currentMessages = [
        ...currentMessages,
        { role: "assistant", content },
        {
          role: "user",
          content: toolUseBlocks.map(block => ({
            type: "tool_result",
            tool_use_id: block.id,
            content: "Search executed.",
          })),
        },
      ];
    }

    return Response.json({ content: [{ type: "text", text: finalText }] });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
