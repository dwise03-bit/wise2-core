import test from "node:test";
import assert from "node:assert/strict";

import { SUBSYSTEMS, SYSTEMS } from "../src/data/catalog.js";
import { generateProductionPrompt, validatePromptInput } from "../src/features/prompt-engine/promptEngine.js";

const base = {
  system: SYSTEMS[0],
  subsystem: SUBSYSTEMS[0],
  subject: "a lone courier crossing a rain-soaked megacity",
  mood: "Cinematic",
  outputType: "Image",
  aspectRatio: "16:9",
  additionalInstructions: "Keep the courier's red coat recognizable.",
  targetEngine: "Universal",
};

test("Prompt Engine validates required production inputs", () => {
  assert.equal(validatePromptInput(base).valid, true);
  assert.equal(validatePromptInput({ ...base, subject: "" }).valid, false);
});

test("Prompt Engine uses System and Subsystem DNA rather than names alone", () => {
  const result = generateProductionPrompt(base);
  assert.equal(result.valid, true);
  assert.ok(result.text.includes(base.system.coreDNA));
  assert.ok(result.text.includes(base.subsystem.description));
  assert.ok(result.text.includes(base.system.visualDNA[0]));
});

test("Prompt Engine targets image, video, and supported creative outputs", () => {
  for (const outputType of ["Image", "Video", "Cover Art", "Poster", "Branding", "Editorial Visual", "Storyboard"]) {
    const result = generateProductionPrompt({ ...base, outputType });
    assert.equal(result.valid, true);
    assert.equal(result.metadata.outputType, outputType);
  }
});

test("Prompt Engine includes mood, aspect ratio, engine, and additional instructions", () => {
  const result = generateProductionPrompt({ ...base, targetEngine: "Flow", outputType: "Video", aspectRatio: "9:16" });
  assert.match(result.text, /Mood: Cinematic/);
  assert.match(result.text, /Aspect Ratio: 9:16/);
  assert.match(result.text, /Flow:/);
  assert.ok(result.text.includes(base.additionalInstructions));
});
