# 30-Day Adoption Roadmap

> For a small marketplace team: 3 engineers + 1 tech lead.
> Stack: TypeScript + Express.js, TypeScript + Nuxt 3, microservices.
> System: PRD → task breakdown → test-driven execution (the 3-file system).

---

## Week 1: First Feature with the Full System

**Goal**: One complete feature shipped using the new process, end to end.

### Pick the Right Feature

Pull one feature from your actual backlog. Not a toy project. Not the hardest thing on the board. Choose something that:

- Touches both backend and frontend (e.g., a new listing filter, a buyer notification, a seller stats endpoint)
- Has clear acceptance criteria — you can describe "done" in 2-3 sentences
- Is not blocking other work — if it slips a day, nobody is stuck
- Takes 3-7 days normally — big enough to feel the process, small enough to finish this week
- Involves one engineer, not the whole team

**Bad picks**: auth system overhaul, payment flow changes, database migration-heavy work. Too risky for a first run.

**Good picks**: add a "save listing" feature, build a seller order history page, add search filters for a category.

### Assign One Engineer as the Pilot

One engineer runs the full workflow. The other two observe and ask questions. Rotate next week.

### Day-by-Day

| Day | Activity |
|-----|----------|
| **Mon** | Pilot engineer writes the PRD using `create-prd.md` template with AI. Tech lead reviews the PRD — pushes back on vague requirements, missing edge cases, unclear acceptance criteria. No code yet. |
| **Tue** | Generate the task breakdown using `generate-tasks.md` template. Tech lead reviews the task list: are tasks atomic? Are dependencies correct? Is the complexity distribution reasonable (mostly S/M, max 1-2 L)? Approve before execution starts. |
| **Wed-Thu** | Execute tasks using `execute-tasks.md` template. One task at a time. Tests first, implementation second. Commit per task. If something feels wrong, stop and adjust the task list — don't power through a bad plan. |
| **Fri** | Finish remaining tasks. Open PR. Whole team does the review together (15 min). Discuss: what felt different? What was faster? What was annoying? |

### Daily Check-In (10 min max)

Every day at standup, the pilot answers:

1. Which task did I complete? Which is next?
2. Did the AI help or get in the way? On what specifically?
3. Am I fighting the process or is it working?

The tech lead listens for signals: if the engineer is spending more time managing the process than writing code, something needs adjustment.

### Week 1 Success Criteria

- [ ] One PRD written and reviewed
- [ ] One task breakdown generated and reviewed
- [ ] All tasks executed with tests first
- [ ] Feature merged to main via PR
- [ ] Team has a shared opinion on what worked and what didn't

---

## Week 2: Expand to All New Feature Work

**Goal**: The entire team uses the 3-file system for all new features. Everyone is self-sufficient.

### Roll Out to All Engineers

- Every new feature goes through PRD → tasks → execution. No exceptions for "small" features — the habit matters more than the overhead.
- Each engineer owns their own PRD. No shared PRDs yet (that adds coordination complexity you don't need right now).
- Bug fixes and hotfixes are exempt. The 3-file system is for feature work.

### Tech Lead's New Role

The tech lead's review focus shifts:

| Before | After |
|--------|-------|
| Review code in PRs | Review PRDs and task breakdowns before code starts |
| Catch design issues during code review | Catch design issues during PRD review |
| Suggest refactors after implementation | Shape the approach before implementation |

This doesn't mean the tech lead stops reviewing code. It means the code review gets faster because the design was already agreed on.

### Start Tracking Time

Begin recording (roughly, not to the minute):

- When the feature idea was handed to the engineer
- When the PRD was approved
- When the first task was started
- When the PR was opened
- When the PR was merged

You'll need this for the Week 4 retro. A shared spreadsheet or a Notion table is fine. Don't buy tooling for this.

### Common Week 2 Friction Points

| Friction | What's Happening | What to Do |
|----------|-----------------|------------|
| "Writing a PRD takes too long" | Engineer is trying to write it perfectly. Or the AI is generating walls of text. | Time-box PRD creation to 30 min. If it takes longer, the feature scope is too big — split it. |
| "The task breakdown doesn't match what I need to build" | AI generated generic tasks, engineer followed them blindly. | The task list is a starting point, not a contract. Edit it. Add tasks, remove tasks, reorder. It's your plan. |
| "Tests first is slowing me down" | Unfamiliar with TDD, or the feature is exploratory. | For genuinely exploratory work (prototyping UI layout, testing an API integration), spike first, then write the real implementation test-first. But be honest about what's exploratory vs. what's avoidance. |
| "I keep going back to edit the PRD" | PRD was too vague, or requirements changed. | Normal for the first few features. Flag it and refine. If the PRD changes every day, the problem is upstream (unclear product direction), not the process. |
| "The AI generates bad code" | Prompt is too vague, or the task is too large. | Smaller tasks = better AI output. If a task is M or L complexity, the AI will struggle more. Break it down further. Also: give the AI more context (existing code patterns, type definitions). |

### Week 2 Success Criteria

- [ ] All 3 engineers have individually completed the full workflow at least once
- [ ] Tech lead has reviewed at least 3 PRDs and 3 task breakdowns
- [ ] Team can explain the process to someone new in under 2 minutes
- [ ] Nobody is waiting for permission or help to start a PRD

---

## Week 3: Add CI/CD Automation

**Goal**: AI-assisted PR review is running on every PR in advisory mode.

### Add One Thing at a Time

Do not set up all three CI/CD workflows at once. Follow this order, one every 2-3 days:

**Days 1-2: AI PR Review**
- Set up `ai-pr-review.yml` (see `guides/ci-cd-integration.md`)
- Add `ANTHROPIC_API_KEY` to GitHub Secrets
- Create `.github/ai-context/coding-standards.md` with your team's conventions
- Open a real PR and review the AI's feedback as a team
- Advisory mode only — comments, not blocking

**Days 3-4: Test Gap Analysis**
- Set up `ai-test-suggestions.yml`
- Run it on a couple of PRs
- Evaluate: are the test suggestions useful or noise?
- If mostly noise, tune the prompt before continuing

**Day 5: Quality Gate (Advisory)**
- Set up `ai-quality-gate.yml` in advisory mode
- Add `.github/ai-context/api-patterns.md` to give it context on your API conventions
- This one catches architecture drift and API contract mismatches

### Tech Lead: Evaluate and Tune

The tech lead's job this week is to read every AI review comment and answer:

1. Was this finding correct? (True positive)
2. Was this finding wrong? (False positive — add to the "do NOT flag" list in the prompt)
3. Did the AI miss something the human reviewer caught? (Gap — adjust the prompt to check for it)

Keep a simple tally. By end of week, you should know the AI's hit rate. If it's below ~60% useful findings, the prompts need more work before you rely on it.

### Week 3 Success Criteria

- [ ] AI PR review runs automatically on every PR
- [ ] Test gap analysis runs on every PR
- [ ] Quality gate runs in advisory mode
- [ ] Tech lead has tuned prompts at least once based on false positives
- [ ] Team knows how to read and act on (or ignore) AI review comments

---

## Week 4: Retrospective + Measure Impact

**Goal**: Structured assessment of what's working. Concrete plan for Month 2.

### Run the Retro (60-90 min)

Use this format. Everyone participates. Tech lead facilitates.

**Part 1: Individual Reflection (10 min, silent writing)**

Each person writes answers to:

1. What's the single biggest improvement the 3-file system brought to my work?
2. What's the most annoying part of the process?
3. If I could change one thing about how we use it, what would it be?
4. Rate your PRD quality (1-5) vs. how you used to spec features.

**Part 2: Share and Discuss (30 min)**

Go around. Each person shares their answers. No rebuttals during sharing — just listen. After everyone has shared, discuss common themes.

**Part 3: Metrics Review (15 min)**

Pull out the numbers (see Metrics table below). Compare before and after. Don't over-index on any single number — look at the trend and the story.

**Part 4: Decide (15 min)**

For each part of the process, vote: **Keep**, **Modify**, or **Drop**.

| Process Element | Keep / Modify / Drop | Notes |
|----------------|---------------------|-------|
| PRD creation with AI | | |
| Tech lead PRD review | | |
| Task breakdown generation | | |
| Test-first execution | | |
| AI PR review | | |
| Test gap analysis | | |
| Quality gate | | |

**Part 5: Plan Month 2 (15 min)**

Based on the retro, decide:
- What stays exactly as-is
- What needs prompt tuning or process adjustment
- Whether to promote the quality gate from advisory to blocking
- One new thing to try in Month 2 (e.g., shared PRDs for cross-team features, AI-generated changelogs, expanding to bug fixes)

---

## Metrics to Track

| Metric | How to Measure | Target | Notes |
|--------|---------------|--------|-------|
| **Time: idea to PR** | Spreadsheet: log start date and PR open date for each feature | 40% reduction | Compare avg from last month vs. this month. Don't count features that were blocked on external deps. |
| **Test coverage delta** | Run coverage tool before and after the month. Backend: `npx vitest run --coverage`. Frontend: `npx vitest run --coverage`. | +15-20% | Absolute coverage % matters less than the direction. If you start at 30%, getting to 45-50% is a win. |
| **Deploy frequency** | Count deploys per week from your deploy log or CI history | Maintain or increase | If deploy frequency drops, the process is adding friction somewhere. Investigate. |
| **Rework rate** | Count PR revision cycles (how many times a PR is sent back for changes before merge) | 30% reduction | PRD + task review upfront should catch issues before they become code. Fewer "actually, this should work differently" moments in code review. |
| **PRD quality score** | Tech lead rates each PRD 1-5 after the feature ships. Criteria: Was the PRD specific enough to build from? Did requirements change during implementation? | Trending up weekly | Subjective but useful. A PRD that needed zero clarification during implementation is a 5. One that got rewritten mid-sprint is a 1. |

### How to Gather These Without Enterprise Tooling

- **Time tracking**: A shared Google Sheet with columns: Feature, Engineer, Start Date, PRD Approved, First Task Started, PR Opened, PR Merged. Fill it in as you go. Takes 30 seconds per feature.
- **Test coverage**: Run coverage once at the start of the month, once at the end. Screenshot the summary. That's it.
- **Deploy frequency**: Count the entries in your deploy channel / CI deploy history. 5-minute task.
- **Rework rate**: GitHub PR page shows the number of review cycles. Count the "changes requested" events across all PRs this month vs. last month.
- **PRD quality**: Tech lead keeps a running note. Score each PRD after the feature ships, not before.

---

## Warning Signs That Adoption Is Stalling

Watch for these. If you see one, act on it that week — don't wait for the retro.

### 1. Engineers skip the PRD and go straight to coding

**Why it happens**: The PRD feels like overhead for "obvious" features. Or the engineer is excited and wants to start building.

**What to do**: Tech lead enforces the gate: no task breakdown review without a PRD. Period. Also, check if PRDs are taking too long — if writing a PRD takes 2 hours, the process is broken, not the engineer.

### 2. Task breakdowns are too vague (copy-paste from PRD)

**Why it happens**: The engineer treated the task generation step as a formality, not a design exercise. Or the AI wasn't given enough context to produce good tasks.

**What to do**: Tech lead reviews the task list and asks: "Could I hand this task to someone who hasn't read the PRD and have them complete it?" If no, it's too vague. Send it back. Provide the AI with existing code files as context during generation.

### 3. Tests are written after implementation, not before

**Why it happens**: TDD feels unnatural if you've never done it. The engineer writes the code, then "backfills" tests.

**What to do**: Look at git timestamps — was the test file committed before or at the same time as the implementation? If consistently after, pair with the engineer for one task cycle. Show them the test-first flow live. Don't lecture. Do it together.

### 4. "The AI can't do this" becomes a default excuse

**Why it happens**: The engineer tried once, got bad output, and gave up. Or the task is genuinely outside what AI assists well with (complex state machines, heavy business logic with context the AI doesn't have).

**What to do**: Distinguish between "the AI can't do this specific task" (valid — some tasks are human-only) and "I don't know how to prompt the AI effectively" (fixable). For the latter, have the team share prompts that worked well. For the former, note it and move on — the system doesn't require AI for every task.

### 5. Tech lead stops reviewing PRDs

**Why it happens**: Time pressure. The tech lead is also writing code and doesn't have time for reviews. Or the PRDs are good enough that review feels unnecessary.

**What to do**: PRD review is the highest-leverage activity the tech lead has. If there's no time, something else needs to give — not this. Time-box reviews to 15 minutes max. If the PRD is good, a 15-minute skim confirms it. If it's bad, 15 minutes saves days of rework.

### 6. Only one engineer uses the system consistently

**Why it happens**: The pilot engineer from Week 1 loves it, the others never fully committed. Or one engineer's features don't fit the system well.

**What to do**: Pair the reluctant engineers with the one who's fluent. Not to convince them, but to lower the friction. Often the resistance is about unfamiliarity, not disagreement. If after pairing they still find it unhelpful, listen — their features might genuinely need a different approach.

---

## Quick Reference Card

Print this. Pin it next to your monitor. Throw away when it's muscle memory.

```
THE 3-FILE SYSTEM — CHEAT SHEET

1. WRITE PRD          Use: create-prd.md template
                      AI writes first draft → you edit → tech lead reviews
                      Time-box: 30 min

2. GENERATE TASKS     Use: generate-tasks.md template
                      Feed the PRD → get 3-5 parent tasks with subtasks
                      Review: are tasks atomic? Dependencies correct?
                      Tech lead approves before execution

3. EXECUTE TASKS      Use: execute-tasks.md template
                      For each task:
                        a. Read existing code + PRD section
                        b. Write the test (it should fail)
                        c. Write the implementation (test passes)
                        d. Run full test suite (no regressions)
                        e. Commit: git add [files] && git commit -m "feat(scope): description"
                        f. Mark task done, move to next

4. OPEN PR            All tasks done → open PR → AI review runs automatically
                      Human review focuses on design decisions, not syntax

5. MERGE              Tests green + review approved → merge → deploy

RULES
- One task at a time. Finish it before starting the next.
- Tests first. Always. Even when it feels silly.
- Don't git add . — stage only the files for the current task.
- If the plan is wrong, fix the plan. Don't hack around a bad task.
- Imports at the top of the file. Never inside functions.
```

---

## Month 2 Preview

Things to consider after the first 30 days (decide during the Week 4 retro):

- **Shared PRDs**: Two engineers co-own a PRD for larger features that span multiple services
- **Blocking quality gate**: Promote the AI quality check from advisory to merge-blocking (only if false positive rate is under ~10%)
- **AI changelogs**: Auto-generate release notes from merged PRs
- **Bug fix workflow**: Adapt the 3-file system for bug fixes (lighter PRD, focus on reproduction steps and test case)
- **Onboarding**: Use the PRD archive as onboarding material for new engineers — they read past PRDs to understand how features were designed
