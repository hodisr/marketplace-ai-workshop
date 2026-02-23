# AI Development Workshop — Materials Overview

## What This Is

A 2-day intensive workshop for small development teams (4-8 people) transitioning from ad-hoc AI tool usage to structured, repeatable AI-driven development workflows.

**Who it's for:** Dev teams that already use AI coding tools (Copilot, Cursor, ChatGPT) but want a systematic approach that scales across projects and team members.

**The core method:** The 3-file system. Every feature starts with a PRD (what to build), gets broken into a task list (how to build it), and is executed through a structured prompt (AI does the work, you direct). Three files, one workflow, applicable to any AI coding tool.

---

## Directory Structure

```
workshop/
├── README.md                      # This file
├── templates/                     # The 3-file system templates
│   ├── create-prd.md              # Template for writing AI-ready PRDs
│   ├── generate-tasks.md          # Template for breaking PRDs into tasks
│   └── execute-tasks.md           # Template for AI-driven task execution
├── guides/                        # Reference guides
│   ├── tool-transition.md         # Cursor → Claude Code transition guide
│   ├── ci-cd-integration.md       # Integrating AI workflows into CI/CD
│   └── 30-day-roadmap.md          # Post-workshop adoption roadmap
├── exercises/                     # Hands-on exercises
│   ├── feature-briefs/            # Feature briefs for practice sessions
│   ├── marketplace-app/           # Demo application for live exercises
│   └── sample-outputs/            # Example PRDs, task lists, and results
├── facilitator/                   # Facilitator-only materials
│   └── facilitator-notes.md       # Pacing, discussion prompts, tips
├── slides/                        # Presentation materials
│   └── day1-morning-outline.md    # Day 1 morning session outline
```

---

## How to Use These Materials

**As a facilitator:**
1. Start with `facilitator/facilitator-notes.md` for pacing and session structure
2. Review all exercises in `exercises/` and run through the demo app yourself
3. Use `slides/` for presentation structure
4. Have `templates/` open and ready to screen-share during live demos

**As a participant:**
1. Start with `templates/` — read all three files to understand the system
2. Work through exercises in `exercises/` during workshop sessions
3. Use `exercises/sample-outputs/` to compare your work against examples

**As a post-workshop reference:**
- `templates/` and `guides/` are designed to be used long after the workshop
- `guides/30-day-roadmap.md` provides a structured adoption plan
- Copy the templates into your own projects and adapt them

---

## Prerequisites

- **Node.js 20+**
- **Docker** (for the demo marketplace app)
- **Claude Code** (or your preferred AI coding tool) — see `guides/tool-transition.md`
- **API key** for Claude (Anthropic)

---

## Quick Start

```bash
cd exercises/marketplace-app
docker compose up
```

Then open `templates/create-prd.md` and start writing your first AI-ready PRD.

---

## Workshop Schedule

### Day 1 — Foundation

| Time | Session | Description |
|------|---------|-------------|
| 09:00–09:45 | Introduction | Why structured AI workflows matter |
| 09:45–10:45 | The 3-File System | Deep dive into PRD, tasks, and execution templates |
| 10:45–11:00 | Break | |
| 11:00–12:00 | Live Demo | End-to-end feature build using the system |
| 12:00–13:00 | Lunch | |
| 13:00–14:30 | Exercise: Write a PRD | Participants write PRDs for assigned features |
| 14:30–14:45 | Break | |
| 14:45–16:00 | Exercise: Generate Tasks | Break PRDs into task lists, review and refine |
| 16:00–16:30 | Day 1 Retro | What worked, what didn't, Q&A |

### Day 2 — Execution

| Time | Session | Description |
|------|---------|-------------|
| 09:00–09:30 | Day 1 Recap | Review key takeaways, address open questions |
| 09:30–11:00 | Exercise: Execute Tasks | AI-driven implementation of Day 1 task lists |
| 11:00–11:15 | Break | |
| 11:15–12:15 | Tool Setup | Claude Code setup, CI/CD integration patterns |
| 12:15–13:15 | Lunch | |
| 13:15–15:00 | Team Exercise | Full 3-file cycle on a team-chosen feature |
| 15:00–15:15 | Break | |
| 15:15–16:00 | Adoption Planning | 30-day roadmap, team-specific next steps |
| 16:00–16:30 | Wrap-up | Final Q&A, feedback |
