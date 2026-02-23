# Section 2: The AI Dev Tasks Workflow

**Time**: 9:45–11:00 (75 min — strict, demo needs the full time)
**Goal**: Full understanding of the system. Everyone can explain it back.

---

### Slide 2.1 — Your AI Toolbox (101)

**Title**: What's Available to You

> **[SPEAKER NOTE]**: 3-5 minutes. Quick orientation, not a deep dive. The goal is that when you reference these concepts during the demo, they know where they fit.

A quick map of the building blocks in modern AI-assisted development:

| Building Block | What It Is | Example |
|---|---|---|
| **CLAUDE.md** | Project-level instructions that persist across sessions. Your codebase context, conventions, rules. | "Always use Express.js for new services, vitest for tests" |
| **Rules / .cursor/rules/** | Tool-specific rule files. Auto-loaded context for your AI tool. | `create-prd.mdc`, `generate-tasks.mdc` — the workflow we're about to learn |
| **MCP Servers** | External tool integrations. Connect your AI to databases, APIs, services. | GitHub, Notion, Slack, databases |
| **Skills** | Reusable prompt workflows. Packaged expertise you can invoke. | `/commit`, `/review-pr` |
| **Agents** | Custom AI agents with specific roles and tool access. | A test-runner agent, a code-reviewer agent |

You don't need all of these today. The workflow we're teaching uses **one building block**: rule files. But knowing the landscape helps you see where to go next.

> **[SPEAKER NOTE]**: If someone asks about MCP or agents, say: "Great question — that's day 2 territory. Today we focus on the core workflow."

---

### Slide 2.2 — The Problem with "AI as Autocomplete"

**Title**: You're Thinking at the Wrong Level

- When you use AI line-by-line, you're optimizing typing speed
- Typing was never the bottleneck. Thinking was.
- The expensive part of development: figuring out what to build, how to structure it, what edge cases to handle
- AI can help with all of that — but only if you stop using it as a fancy autocomplete

> **[SPEAKER NOTE]**: Keep this brief. One minute. It's a bridge from Section 1 to the system intro.

---

### Slide 2.3 — Code Factory Philosophy

**Title**: You're the PM/Architect. AI Is the Dev Team.

- Traditional: you think about what to build, then you build it
- Code Factory: you think about what to build, write a precise spec, AI builds it, you review
- Your job shifts from writing code to:
  - Defining requirements clearly
  - Breaking work into right-sized chunks
  - Reviewing and steering AI output
  - Making architectural decisions
- This isn't "lazy." This is leverage.

---

### Slide 2.4 — The Junior Dev Analogy

**Title**: Would You Hand a Junior Dev a Vague Slack Message?

- Imagine you have a junior developer. Smart, fast, but no context about your system.
- You wouldn't say: "Add search to the marketplace" and walk away.
- You'd write:
  - What the feature does
  - What the API looks like
  - What data models are involved
  - What edge cases to handle
  - How to test it
- AI is that junior dev. The system is how you write that spec.

> **[SPEAKER NOTE]**: This analogy tends to click immediately. If someone says "but that's a lot of work to write a spec" — yes, that's the point. The spec IS the work. The coding is the easy part.

---

### Slide 2.5 — The Workflow

**Title**: Two Files, Five Steps

Based on [Ryan Carson's AI Dev Tasks](https://github.com/snarktank/ai-dev-tasks):

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  create-prd.mdc          generate-tasks.mdc              │
│  ─────────────           ──────────────────              │
│  "What to build"         "How to break it down           │
│                           + how to execute it"            │
│                                                          │
│  Step 1: Create PRD  →  Step 2: Generate parent tasks    │
│                          Step 3: Say "Go" → subtasks     │
│                          Step 4: Execute one at a time    │
│                          Step 5: PR + CI                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Two Cursor rule files. The output of the first feeds into the second. The second generates a task list with execution instructions baked in.

> **[SPEAKER NOTE]**: Show the actual files on screen briefly. Don't deep-dive yet — the next slides cover each one.

---

### Slide 2.6 — File 1: create-prd.mdc

**Title**: create-prd.mdc — Turning Ideas into Specs

**What it does:**
- Takes a vague feature idea as input
- AI asks 3-5 clarifying questions with numbered/lettered options (respond like "1A, 2C, 3B")
- Produces a structured PRD: overview, goals, user stories, functional requirements, non-goals, success metrics
- Saves to `tasks/prd-[feature-name].md`

**Why it exists:**
- Forces you to think through the feature before any code is written
- Surfaces edge cases and decisions you'd otherwise discover mid-implementation
- Gives the AI enough context to produce good code later

**What happens without it:**
- AI builds based on assumptions
- You discover missing requirements 3 tasks deep
- Rework, frustration, "AI sucks" feelings

> **[CHECK UNDERSTANDING]**: "Has anyone here ever started coding a feature and realized halfway through that the requirements were unclear?"

---

### Slide 2.7 — File 2: generate-tasks.mdc

**Title**: generate-tasks.mdc — From Spec to Executable Task List

**What it does:**
- Takes the PRD as input
- **Phase 1**: Generates parent tasks only (3-5 + task 0.0: create feature branch) → **STOPS and waits**
- You review, say **"Go"**
- **Phase 2**: Expands into subtasks with checkbox tracking (`- [ ]` / `- [x]`)
- Includes a "Relevant Files" section and "Instructions for Completing Tasks"
- Saves to `tasks/tasks-[feature-name].md`

**Why the two-phase approach:**
- You catch bad high-level plans before investing time in subtask details
- The "Go" gate prevents the AI from running off in the wrong direction

**Why checkbox tracking:**
- Visual progress — see what's done and what's left
- AI updates `- [ ]` to `- [x]` after each subtask
- Anyone can pick up where someone left off

---

### Slide 2.8 — Execution: Built Into the Task List

**Title**: No Third File — Execution Instructions Live in the Output

The generated task list includes an "Instructions for Completing Tasks" section:

```markdown
## Instructions for Completing Tasks

IMPORTANT: As you complete each task, check it off by
changing - [ ] to - [x].

Example:
- [ ] 1.1 Read file → - [x] 1.1 Read file (after completing)
```

You tell the AI: "Start on task 1.1" and it:
1. Reads context → writes test → implements → runs tests
2. Marks `- [x]` in the task list
3. Commits
4. Moves to the next subtask

> **[SPEAKER NOTE]**: The key insight: there's no separate execution prompt. The task list IS the execution plan. This is simpler and more portable than a 3-file system.

---

### Slide 2.9 — The Flow Diagram

**Title**: The Full Cycle

```
Feature Idea
    │
    ▼
┌─ create-prd.mdc ──────────────────────────────┐
│  AI asks 3-5 questions  ←──── You answer       │
│  AI generates PRD       ←──── You refine        │
│  Saves to tasks/prd-[name].md                   │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─ generate-tasks.mdc ──────────────────────────┐
│  Phase 1: Parent tasks  ←──── You review       │
│  You say "Go"           ────►                   │
│  Phase 2: Subtasks      ←──── You review        │
│  Saves to tasks/tasks-[name].md                 │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─ Execute (from the task list) ─────────────────┐
│  "Start on task 1.1"                            │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  Read context → Test → Implement    │        │
│  │  Run tests → Pass? ──► Commit       │◄─ Loop │
│  │                  └─No─► Fix & retry │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  Mark - [x] → Next subtask → Repeat            │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─ PR + CI ──────────────────────────────────────┐
│  Push branch → CI runs (lint + tests)           │
│  Create PR → Review → Merge                     │
└─────────────────────────────────────────────────┘
```

> **[SPEAKER NOTE]**: Walk through this slowly. Trace a feature from idea to completion. Emphasize: at no point are you writing code. You're reviewing code.

---

### Slide 2.10 — Failure Modes

**Title**: How Things Go Wrong (and How the System Prevents It)

| Failure Mode | What Happens | System Prevention |
|---|---|---|
| No PRD | AI builds the wrong thing | create-prd forces spec-first |
| Tasks too big | AI loses context mid-task | generate-tasks enforces small chunks |
| No checkpoint | Cascading failures | Checkbox tracking + commit per task |
| No tests | Can't verify anything | Test-first culture in task execution |
| Wrong direction | Wasted effort on bad plan | Two-phase "Go" gate catches it early |

> **[SPEAKER NOTE]**: Ask the room which of these they've experienced. Probably all of them. That's normal — the system exists because these failures are universal.

---

### Slide 2.11 — Live Demo

**Title**: Let's Build Something

> **[SPEAKER NOTE]**: This is the core of the morning. 45 minutes including Q&A. Go slow. Narrate every decision. The goal isn't speed — it's showing the thought process.

#### Demo Feature: "Add a health check endpoint to the product service"

> **[SPEAKER NOTE]**: This is a trivial feature on purpose. The point isn't the health check — it's seeing the workflow in action. Same process works for a 2-day feature. Using a simple feature keeps the demo short and focused on the system, not the implementation.

**Step 1 — PRD Generation (10 min)**

- Open a terminal in the marketplace repo and start Claude Code:
  ```bash
  cd marketplace-ai-workshop
  claude
  ```
- Tell Claude Code to read the rule file and create a PRD:
  ```
  Read .cursor/rules/create-prd.mdc and use it to create a PRD — I want to add a health check endpoint to the product service
  ```
- Show the AI's 3-5 clarifying questions appearing with lettered options:
  - "1. What should the health check verify? A. Just return OK B. Check DB connectivity C. Check all dependencies"
  - "2. What response format? A. Simple 200 OK B. JSON with status details C. Standard health check schema"
  - etc.
- Answer quickly: "1B, 2B, 3A"
- Show the generated PRD

> **[NARRATOR]**: "Notice I spent 2 minutes answering questions. That's 2 minutes of thinking I would have done anyway — but now it's documented and the AI has it as context."

- Highlight key PRD sections:
  - Functional requirements (numbered, testable)
  - Non-goals / out of scope
  - Success metrics
- PRD saved to `tasks/prd-health-check.md`

**Step 2 — Task Generation Phase 1 (5 min)**

- Tell Claude Code to generate tasks:
  ```
  Read .cursor/rules/generate-tasks.mdc and use it to create tasks from tasks/prd-health-check.md
  ```
- Show Phase 1 output — parent tasks only:
  ```
  - [ ] 0.0 Create feature branch
  - [ ] 1.0 Health check endpoint
  - [ ] 2.0 Database connectivity check
  - [ ] 3.0 Response format and documentation
  ```
- AI says: "Ready to generate sub-tasks? Respond with 'Go'"
- Review: "These look right. Go."

**Step 3 — Task Generation Phase 2 (5 min)**

- Show subtasks expanding with checkbox format:
  ```
  - [ ] 1.0 Health check endpoint
    - [ ] 1.1 Define health check response schema
    - [ ] 1.2 Implement basic health route
    - [ ] 1.3 Add to Express router
  ```
- Point out: Relevant Files section, execution instructions embedded
- Task list saved to `tasks/tasks-health-check.md`

**Step 4 — Execute First Task (15 min)**

- Tell the AI: "Start on task 1.1"
- Show the TDD cycle live:
  1. AI reads existing schemas to understand patterns
  2. AI writes test for health check response schema
  3. Test fails (feature doesn't exist yet)
  4. AI implements the TypeScript interface
  5. Test passes
  6. Task list updated: `- [x] 1.1 Define health check response schema`
  7. Git commit: `feat(health): add health check response schema`

> **[NARRATOR]**: "I haven't written a single line of code. But I've reviewed every line. I made a decision about what to check and the AI handled the implementation."

**Step 5 — The Failure Demo (10 min)**

> **[SPEAKER NOTE]**: This is the most important part of the demo. Don't skip it.

- Take a bigger feature idea: "Add product search with filters"
- Paste it directly into an AI chat with NO system, NO PRD, NO task breakdown
- Show what the AI produces:
  - Probably a single massive file
  - Missing edge cases
  - No tests
  - Assumptions about your data model that are wrong
  - Maybe hallucinated library imports
- Contrast: "Even our trivial health check feature got a proper spec, tests, and clean commits. This complex feature got chaos."

> **[NARRATOR]**: "Same AI. Same engineer. The only difference is the quality of the instructions. That's the entire point."

**Q&A on Demo (remaining time)**

> **[SPEAKER NOTE]**: Let questions flow naturally. Common questions:
> - "What if the AI gets a task wrong?" → Roll back that commit, adjust the task, re-run.
> - "How long does a full feature take?" → Depends on size, but a medium feature is 2-4 hours vs. 2-3 days.
> - "Does this work for frontend too?" → Yes, same system. PRD includes UI specs, tasks include component work.
> - "What about existing code?" → The PRD can reference existing patterns. You give context.

---

## Compression Plan

- If running over, compress the failure demo (Step 5) to 5 min — but never cut it entirely
- Can cut Demo Step 4 if needed — they get the pattern from the first task execution
- Never cut: The failure demo — it's the most persuasive part of the morning
