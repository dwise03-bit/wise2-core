export const MOODS = ["Cinematic", "Dark", "Energetic", "Dreamlike", "Luxury", "Raw", "Spiritual", "Playful"];
export const OUTPUT_TYPES = ["Image", "Video", "Cover Art", "Poster", "Branding", "Editorial Visual", "Storyboard"];
export const ASPECT_RATIOS = ["1:1", "4:5", "3:2", "16:9", "9:16", "21:9"];
export const TARGET_ENGINES = ["Universal", "Claude", "Gemini", "Flow", "Midjourney", "Other"];

const OUTPUT_GUIDANCE = {
  Image: "Produce one polished, high-resolution hero image with intentional focal hierarchy.",
  Video: "Describe temporal motion, camera movement, subject action, environmental movement, and a coherent ending frame.",
  "Cover Art": "Create release-ready cover art with a strong central read, thumbnail impact, and safe space for typography.",
  Poster: "Create a poster composition with a dominant visual hook, clear hierarchy, and intentional title-safe zones.",
  Branding: "Create a repeatable campaign language with distinctive shapes, palette, texture, and brand-safe consistency.",
  "Editorial Visual": "Create a premium editorial frame with controlled styling, publication-grade composition, and narrative detail.",
  Storyboard: "Create a sequential storyboard with consistent subjects, clear shot progression, camera notes, and continuity.",
};

const ENGINE_GUIDANCE = {
  Universal: "Use clear production language that can transfer across modern image and video generators.",
  Claude: "Return a precise creative-direction prompt with explicit hierarchy and no conversational preamble.",
  Gemini: "Use structured multimodal direction with concrete subject, environment, lighting, camera, and rendering details.",
  Flow: "Emphasize shot design, camera motion, temporal continuity, physical action, and cinematic pacing.",
  Midjourney: "Use dense visual language, concise composition cues, material detail, lighting, lens direction, and aspect-ratio intent.",
  Other: "Preserve provider-neutral creative direction and avoid vendor-specific parameters.",
};

export function validatePromptInput(input) {
  const errors = [];
  if (!input.system) errors.push("Choose a System.");
  if (!input.subject?.trim()) errors.push("Enter a subject or concept.");
  if (!OUTPUT_TYPES.includes(input.outputType)) errors.push("Choose a supported output type.");
  if (!ASPECT_RATIOS.includes(input.aspectRatio)) errors.push("Choose a supported aspect ratio.");
  return { valid: errors.length === 0, errors };
}

export function generateProductionPrompt(input) {
  const validation = validatePromptInput(input);
  if (!validation.valid) return { valid: false, errors: validation.errors, text: "" };

  const { system, subsystem, subject, mood, outputType, aspectRatio, additionalInstructions, targetEngine } = input;
  const visualDNA = [...new Set([...(system.visualDNA || []), ...(subsystem?.visualDNA || [])])];
  const subsystemDirection = subsystem ? subsystem.description : "Use the parent System without a Subsystem override.";
  const text = [
    "WISE TOUCH™ PRODUCTION PROMPT",
    "",
    "CREATIVE OBJECTIVE",
    `${outputType}: ${subject.trim()}`,
    "",
    "WISE TOUCH SYSTEM DNA",
    `System: ${system.name}`,
    `Core DNA: ${system.coreDNA}`,
    `Subsystem: ${subsystem?.name || "None"}`,
    `Subsystem Direction: ${subsystemDirection}`,
    `Visual DNA: ${visualDNA.join("; ")}`,
    "",
    "ART DIRECTION",
    `Mood: ${mood}`,
    `Format: ${outputType}`,
    `Aspect Ratio: ${aspectRatio}`,
    OUTPUT_GUIDANCE[outputType],
    "Preserve subject identity, important product or wardrobe structure, and requested narrative intent. Use premium cinematic lighting, deliberate depth, tactile texture, controlled contrast, and a readable focal hierarchy.",
    "",
    "TARGET ENGINE",
    `${targetEngine}: ${ENGINE_GUIDANCE[targetEngine] || ENGINE_GUIDANCE.Other}`,
    additionalInstructions?.trim() ? "" : null,
    additionalInstructions?.trim() ? "ADDITIONAL INSTRUCTIONS" : null,
    additionalInstructions?.trim() || null,
    "",
    "FINAL OUTPUT",
    "Return only the final production-ready prompt. Resolve vague language into concrete visual direction without changing the requested subject.",
  ].filter((line) => line !== null).join("\n");

  return {
    valid: true,
    errors: [],
    text,
    metadata: {
      systemId: system.id,
      subsystemId: subsystem?.id || null,
      outputType,
      aspectRatio,
      mood,
      targetEngine,
    },
  };
}
