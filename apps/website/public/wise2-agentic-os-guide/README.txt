╔═══════════════════════════════════════════════════════════════╗
║           WISE² AGENTIC OS - VISUAL GUIDE                    ║
╚═══════════════════════════════════════════════════════════════╝

📂 CONTENTS
═══════════

index.html           - Interactive visual guide (open in browser)
README.txt           - This file

🚀 QUICK START
═══════════════

1. Double-click "index.html" to open in your browser
2. Scroll through the visual guide
3. See diagrams of:
   - How the OS routes tasks
   - The 5 specialist agents
   - The persistent memory system (data/ folder)
   - Real examples of how it works

📖 WHAT YOU'LL LEARN
════════════════════

✓ How tasks are routed to specialist agents (@dev, @design, @ops, @writer, @researcher)
✓ How the "filing cabinet" (data/ folder) stores persistent memory
✓ Real example: multi-agent workflow for designing and building a feature
✓ Why this is better than one-shot Claude sessions

💡 KEY CONCEPT
═══════════════

Instead of:
  You: "Claude, build this AND design it AND deploy it"
  (Claude tries to be an expert in 3 things at once)

You get:
  You: "Design and build the page"
  → Kernel routes "design" to @design
  → Kernel routes "build" to @dev
  → Both agents use shared memory (data/ folder)
  → No context loss between specialists
  → Next session, agents pick up where they left off

📍 LOCATION
════════════

Your Agentic OS is set up at:
  /home/dwise/wise2-core/

Key files:
  CLAUDE.md              ← Kernel (routing rules)
  agents/dev.md          ← @dev agent
  agents/design.md       ← @design agent
  agents/ops.md          ← @ops agent
  agents/writer.md       ← @writer agent
  agents/researcher.md   ← @researcher agent
  
  data/                  ← Persistent memory
    ├── daily-logs/      (what happened each day)
    ├── decisions/       (why decisions were made)
    ├── projects/        (project context)
    ├── inbox/           (new tasks to triage)
    ├── contacts/        (people & relationships)
    └── templates/       (reusable formats)

🎯 NEXT STEP
═════════════

1. Open index.html in your browser
2. Read through the visual guide
3. Then, in your next Claude Code session, try:

   "Design and build the live stream page using the reference images"

   Watch how:
   - Kernel automatically routes to @design first, then @dev
   - Both agents use shared memory (data/ folder)
   - Your context is preserved across agents and sessions

═══════════════════════════════════════════════════════════════

Questions? See AGENTIC_OS_README.md in /home/dwise/wise2-core/
