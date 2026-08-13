import { PROJECT_CATEGORIES } from './knowledge';

export interface IntakeAnswer {
  question: string;
  answer: string;
}

export interface IntakeSubmission {
  categoryId: string;
  contactName: string;
  email: string;
  phone?: string;
  businessName?: string;
  website?: string;
  answers: IntakeAnswer[];
}

export interface ProspectPayload {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  primaryProblem: string;
  leadSource: string;
  notes: string;
  tags: string[];
}

export type MappingResult = { ok: true; payload: ProspectPayload } | { ok: false; error: string };

/**
 * Maps a completed Wise Imp conversational intake into the shape
 * packages/api/src/v1/prospects expects (POST /v1/prospects). Uses only
 * that endpoint's existing, already-persisted fields (notes, tags,
 * leadSource) — no schema changes. Kept as a pure function so it's directly
 * unit-testable without spinning up the route/network.
 */
export function buildProspectPayload(submission: IntakeSubmission): MappingResult {
  const category = PROJECT_CATEGORIES.find((c) => c.id === submission.categoryId);
  if (!category) return { ok: false, error: 'Unknown project category' };
  if (!submission.contactName?.trim()) return { ok: false, error: 'Missing contact name' };
  if (!submission.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email.trim())) {
    return { ok: false, error: 'Missing or invalid email' };
  }
  if (!submission.answers?.length) return { ok: false, error: 'No intake answers provided' };

  const notes = [
    `Wise Imp conversational intake — category: ${category.label}`,
    ...submission.answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`),
  ].join('\n\n');

  const primaryProblem = submission.answers[0]?.answer?.trim() || category.description;

  return {
    ok: true,
    payload: {
      businessName: submission.businessName?.trim() || submission.contactName.trim(),
      contactName: submission.contactName.trim(),
      email: submission.email.trim(),
      phone: submission.phone?.trim() || undefined,
      website: submission.website?.trim() || undefined,
      primaryProblem,
      leadSource: 'wise-imp',
      notes,
      tags: ['source:wise-imp', `category:${category.id}`],
    },
  };
}
