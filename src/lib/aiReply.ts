// src/lib/aiReply.ts
import { buildGhostText, type Msg } from "@/lib/ghostEngine";

export async function generateAIReply(args: {
  threadTitle: string;
  recentMessages: Msg[];
  lastUserMessage: string;
  recentGhostTexts: string[];
  threadIdSeed: string;
}): Promise<string> {
  return buildGhostText(args);
}