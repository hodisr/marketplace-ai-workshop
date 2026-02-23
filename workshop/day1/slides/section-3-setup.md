# Section 3: Setup & First Hands-On

**Time**: 11:15–12:30 (75 min — flexible, setup time varies)
**Goal**: Everyone has the repo cloned, app running, and has executed their first task.

> **[NOTE]**: 15-min break between Section 2 and Section 3 (11:00–11:15). Let people process. They'll talk to each other about the demo. Don't hover.

---

### Slide 3.1 — Cursor vs. Claude Code

**Title**: Brief Tool Comparison

| | Cursor | Claude Code |
|---|---|---|
| Interface | IDE (VS Code fork) | CLI / Terminal |
| Best for | Inline completions, "write this function" | Autonomous multi-file work, agentic workflow |
| Context window | Good, IDE-aware | Large, handles full project context |
| Workflow | You write, AI assists | You instruct, AI builds |
| Learning curve | Low (feels like VS Code) | Medium (terminal-first) |

> **[SPEAKER NOTE]**: Don't trash Cursor. They use it and like it. The AI Dev Tasks workflow works in both tools — the `.cursor/rules/` files work in Cursor, and the same `.md` files can be referenced in Claude Code. Position them as complementary.

---

### Slide 3.2 — What Changes, What Stays

**Title**: The Shift

**What changes:**
- You think in features and tasks, not lines of code
- You write specs before you write code
- AI works through a structured task list, not ad hoc requests
- Your IDE becomes primarily a code review tool

**What stays the same:**
- You still review every line of AI output
- You still own all architectural decisions
- You still debug when things go wrong
- You still need to understand the code deeply

---

### Slide 3.3 — Environment Setup (Hands-On)

**Title**: Let's Get You Set Up

> **[SPEAKER NOTE]**: This is hands-on. Everyone has their laptop open. Walk through each step together. Don't rush — setup issues will happen and that's fine. Budget 30 minutes for this.

**Step 1: Clone the workshop repo**
```bash
git clone https://github.com/hodisr/marketplace-ai-workshop.git
cd marketplace-ai-workshop
```

**Step 2: Start the environment**
```bash
docker compose up --build
```

Wait for all services to be healthy. This takes ~2 minutes on first run.

**Step 3: Verify everything works**
```bash
# Frontend
open http://localhost:3333

# Product Service API docs
open http://localhost:8011/docs

# User Service API docs
open http://localhost:8012/docs
```

You should see a product listing with real items on the frontend.

**Step 4: Explore the repo structure**
```
.cursor/rules/           ← The 2 workflow files (Cursor rules)
  create-prd.mdc
  generate-tasks.mdc
tasks/                   ← Where PRDs and task lists go
backend/
  product-service/       ← Express.js, port 8011
  user-service/          ← Express.js, port 8012
frontend/                ← Nuxt 3, port 3333
docker-compose.yml
```

> **[SPEAKER NOTE]**: Have a troubleshooting checklist ready. Common issues:
> - Docker not installed or not running → install Docker Desktop
> - Port conflicts → `lsof -i :3333` or `lsof -i :8011` and kill the conflicting process
> - First build is slow → it's downloading images, be patient
> - Apple Silicon Docker issues → make sure Docker Desktop is the ARM build

---

### Slide 3.4 — First Task: Run the Workflow

**Title**: Your First Feature — Together

> **[SPEAKER NOTE]**: Everyone does this together. Screen-share your terminal. They follow along on theirs.

**The task**: Use the workflow to add a simple feature.

**Option A (Cursor):**
1. Open the repo in Cursor
2. In Cursor Agent chat: `Use @create-prd.mdc — I want to add a health check endpoint to the product service`
3. Answer the clarifying questions
4. Then: `Take @prd-health-check.md and create tasks using @generate-tasks.mdc`
5. Review parent tasks, say "Go"
6. Then: "Start on task 1.1"

**Option B (Claude Code):**
```bash
cd marketplace-ai-workshop
claude
```
Then read the rule file into context:
```
Read .cursor/rules/create-prd.mdc, then use it to create a PRD for a health check endpoint
```
After the PRD is generated:
```
Read .cursor/rules/generate-tasks.mdc, then use it to create tasks from tasks/prd-health-check.md
```

**Walk through together:**
1. Watch the PRD get generated from a one-line feature description
2. Watch the two-phase task generation (parent tasks → "Go" → subtasks)
3. Watch the AI execute one subtask: read → test → implement → verify → mark done
4. Review the output together

> **[NARRATOR]**: "This is a trivial feature on purpose. The point isn't the health check — it's seeing the workflow in action. Same process works for a 2-day feature."

---

### Slide 3.5 — Troubleshooting Reference

**Title**: Common Issues & Fixes

| Issue | Fix |
|---|---|
| Docker compose fails | `docker compose down -v && docker compose up --build` |
| Port 3333 in use | `lsof -i :3333` then `kill <PID>` |
| Port 8011/8012 in use | `lsof -i :8011` then `kill <PID>` |
| Frontend shows no products | Restart: `docker compose restart frontend` |
| Backend tests fail | `cd backend/product-service && npm install` first |
| Cursor rules not showing | Make sure you opened the repo root folder in Cursor |

> **[SPEAKER NOTE]**: Don't spend more than 5 minutes per person on setup issues. If someone is stuck, pair them with someone who's working and debug during the break. Don't hold up the whole group.

---

### Slide 3.6 — Q&A and Open Exploration

**Title**: Try It Out (remaining time)

> **[SPEAKER NOTE]**: Unstructured time. Let people explore. Suggested tasks if someone doesn't know what to try:

- "Use the workflow to add a /products/count endpoint that returns the total number of products"
- "Use the workflow to add a seller name display on the product card"
- "Try giving Cursor a vague instruction WITHOUT the workflow and see what happens. Then try WITH the workflow."

Float around the room. Answer questions. Note common struggles — these inform the afternoon hands-on session.

> **[TIMING]**: This section is the buffer. If setup took longer than expected, this shrinks. If setup was fast, people get more exploration time. Either way, end at 12:30 sharp for lunch.

---

## Timing Summary

| Section | Time | Duration | Flexibility |
|---|---|---|---|
| 1: Why This Works | 9:00–9:45 | 45 min | Can compress to 30 min |
| 2: The Workflow | 9:45–11:00 | 75 min | Strict — demo needs full time |
| Break | 11:00–11:15 | 15 min | Strict |
| 3: Setup & Hands-On | 11:15–12:30 | 75 min | Setup time varies. Q&A is the buffer |

## Check Understanding Questions

- After Section 1: "Can someone explain back the difference between copilot-level and code-factory-level usage?"
- After Slide 2.7: "Why does the system pause after parent tasks and wait for 'Go'? What does that prevent?"
- After the demo: "If task 2.3 fails, what do you do? Walk me through it."
- After setup: "What's the first thing the AI did when you invoked create-prd? Why does that matter?"
