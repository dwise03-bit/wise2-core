export const RESOURCE_PROGRESS_KEY = "wise-touch-learning-progress-v1";

export const LEARNING_RESOURCES = [
  { id: "system-bays", title: "Know Your System Bays", type: "Field Guide", level: "Starter", minutes: 6, destination: "directory", summary: "Find Systems and Subsystems, inspect their DNA, and choose a production-ready foundation.", steps: ["Search by subject or visual trait", "Open a System documentation panel", "Compare its Subsystem DNA", "Send the strongest source to the mixer"] },
  { id: "hybrid-code", title: "The 100% Hybrid Code", type: "Workshop", level: "Starter", minutes: 8, destination: "meter", summary: "Balance multiple visual sources and understand why every approved influence mix totals exactly 100%.", steps: ["Choose two to four sources", "Set influence percentages", "Tune Visual DNA controls", "Pass the Foreman balance check"] },
  { id: "blueprint-craft", title: "Blueprint Craft", type: "Playbook", level: "Builder", minutes: 10, destination: "preview", summary: "Turn a valid hybrid into an editable, reusable production blueprint.", steps: ["Review the hybrid recap", "Inspect Visual DNA specifications", "Edit production instructions", "Save a versioned blueprint"] },
  { id: "prompt-engineering", title: "Production Prompt Engineering", type: "Deep Dive", level: "Builder", minutes: 12, destination: "prompt", summary: "Write generator-ready direction using real System DNA, constraints, output targets, and camera language.", steps: ["Define a clear subject", "Select mood and output format", "Add delivery constraints", "Review and enhance the final prompt"] },
  { id: "generation-bay", title: "Running the Generation Bay", type: "Safety Brief", level: "Builder", minutes: 7, destination: "video", summary: "Configure an external provider safely, submit asynchronously, and understand every fabrication status.", steps: ["Confirm server credentials", "Review the live blueprint", "Start the build", "Inspect and file the output"] },
  { id: "commercial-license", title: "Commercial License Field Notes", type: "Reference", level: "Pro", minutes: 5, destination: "packs", summary: "Understand pack, blueprint, client-work, and marketplace license callouts before publishing.", steps: ["Open the selected listing", "Review included materials", "Confirm commercial coverage", "Keep purchase records with the project"] },
];

export function normalizeProgress(value = {}) {
  return { version: 1, completedIds: [...new Set((value.completedIds || []).filter((id) => LEARNING_RESOURCES.some((item) => item.id === id)))] };
}

export function toggleResourceComplete(state, id) {
  const current = normalizeProgress(state);
  return { ...current, completedIds: current.completedIds.includes(id) ? current.completedIds.filter((item) => item !== id) : [...current.completedIds, id] };
}

export function progressPercent(state) {
  return Math.round((normalizeProgress(state).completedIds.length / LEARNING_RESOURCES.length) * 100);
}
