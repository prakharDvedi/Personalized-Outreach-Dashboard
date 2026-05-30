// Core logic for building system prompts for the AI based on user input and offering context

export const DEFAULT_SYSTEM_PROMPT = `You write cold outreach messages on behalf of the user.

Rules:
- Under 100 words unless the user's prompt says otherwise
- Open with something specific and real about the prospect — a project, a post, their role, something that shows you actually looked
- Reference the offering in one sentence. Not a pitch. A mention.
- End with a soft question or a low-commitment observation. Never a hard ask.
- Do not use: "I hope this finds you well", "I wanted to reach out", "synergy", "leverage", "touch base"
- Write like a smart person talking to another smart person. No corporate voice.
- Output only the message. No preamble. No "Here's a draft:". Just the message.`;

export function buildSystemPrompt(
  userPrompt: string,
  offeringContent: string,
): string {
  const promptBase = userPrompt.trim() || DEFAULT_SYSTEM_PROMPT.trim();
  const offering = offeringContent.trim();

  if (!offering) {
    return promptBase;
  }

  return `${promptBase}

Offering context (always true):
${offering}`;
}