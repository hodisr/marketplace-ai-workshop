# Facilitator Notes — Private Playbook

> These notes are for the instructor only. Not shared with the client.
> Candid, practical, no corporate voice. Read this the night before.

---

## 1. Room Dynamics

You have 4 people: 3 engineers + 1 tech lead. One engineer already uses AI tools actively. The other two don't. This creates an asymmetry you need to manage from minute one.

### The experienced engineer dominating the room

They will want to show what they know. Let them — but only during Section 1. That section ("Why This Works") is literally designed for this. Slide 1.5 is their moment: they talk about their experience, what worked, what didn't. Give them the spotlight.

After Section 1, redirect. Say this:

> "You've been driving this conversation, which is exactly what I wanted. Now I need something harder from you — I need you to hold back and let the others struggle a bit. That's where the learning happens."

**Keep them challenged so they don't get bored:**
- Assign them the checkout flow feature (04-checkout-flow.md) — it's the hardest exercise and has the change request curveball built in
- Or the review system (03-review-system.md) — photo uploads, moderation queue, rating aggregation. Lots of moving parts.
- During exercises, turn them into a resource: "Can you look at [name]'s PRD and tell me if the edge cases are real edge cases?" This keeps them engaged without them taking over someone else's work.

**If they start "teaching" during exercises:**

> "I appreciate you helping — can we let everyone try solo for 10 more minutes? Then we'll compare notes."

**If they say "I already do this":**

> "Show me your last 3 PRDs. Let's look at them against this template and see where they differ."

They won't have 3 structured PRDs. Nobody does. This isn't confrontational — it's honest. The system adds structure they're probably missing even if their intuition is good.

### The two less-experienced engineers feeling behind

This is where you earn your keep. These two will feel the gap immediately when the experienced engineer talks about their workflow in Section 1. Normalize it early and explicitly:

> "You're not behind. [Name] has a head start with these tools, but the system we're learning today is new to everyone. The playing field resets right now."

**Practical moves:**
- Pair them together for the first PRD exercise (Section 4 on Day 1). Do NOT pair either of them with the experienced engineer — they'll defer and learn nothing.
- Start them on the product search feature (01-product-search.md). It's the most straightforward: text search, filters, no payment flows, no moderation. Clear inputs, clear outputs.
- Check in privately during exercises. Walk over, crouch down so you're at eye level, and say: "How's it going? What's the most confusing part right now?" Don't wait for them to raise their hand — they won't.
- If they're stuck on PRD generation: give them the first 2-3 sections pre-filled (Overview, Goals, and the first User Story). Let them fill in the rest. The sample output file (01-product-search-prd.md) is your scaffold — show them parts of it, not the whole thing.
- If they're stuck on task breakdown: point them to the sample output (01-product-search-tasks.md) and say "Here's what good looks like. Yours doesn't need to match this exactly, but use it as a reference."

**Watch for these red flags:**
- Going silent. Israeli engineers who are engaged will argue and ask questions. Silence means they're lost or checked out.
- Deferring to the experienced engineer: "What did you put for this section?" Every time this happens, redirect: "I want to hear your version first."
- Phone out during exercises. Take a break or change the format — you've lost them.

### The tech lead

They're wearing two hats and they may not realize it.

**Hat 1 (Day 1): Learner.** Treat them as one of the four. They need to go through the exercises themselves, not just observe. If they try to hover and manage, say:

> "Today you're an engineer. Tomorrow afternoon we'll talk about the leadership side."

**Hat 2 (Day 2 afternoon): Process owner.** The 1:1 session is where you shift gears. This person is the one who will enforce (or kill) the system after you leave. They need to understand:

- They'll be reviewing PRDs and task breakdowns, not just code. This is a role change.
- The PRD review is the highest-leverage thing they can do (the 30-day-roadmap.md doc makes this point — reference it).
- They need to be the one who says "no code until the PRD is approved." If they don't enforce this, the system dies in 2 weeks.

**For the 1:1, prepare these questions:**
- "Walk me through your current sprint planning. Where does feature scoping happen?"
- "When was the last time a feature got reworked because the requirements weren't clear upfront?"
- "Who's going to push back on this process? What's their argument going to be?"
- "If you're reviewing a PRD and it's vague, what specifically do you push back on?"
- "What happens when the experienced engineer skips the PRD because they 'already know what to build'?"

---

## 2. When the Live Demo Breaks

It will break. Not "might." Will. Plan for it.

### Before the workshop

- Run the full demo end-to-end at least twice the day before. On their network if possible.
- Have the completed sample outputs saved locally:
  - `day1/sample-outputs/01-product-search-prd.md` (the PRD)
  - `day1/sample-outputs/01-product-search-tasks.md` (the task list)
- Pre-load the `.cursor/rules/create-prd.mdc` rule in your tool session so you're not copy-pasting live. In Cursor, this loads automatically. In Claude Code, read the file into context first.
- Have a mobile hotspot ready. Israeli startup offices sometimes have flaky WiFi, especially in co-working spaces.
- Run `docker compose up -d` and verify all services are healthy before anyone arrives. Do this at 8:00, not 8:55.
- Have your answers to the PRD clarifying questions pre-written (but answer them "naturally" during the demo — don't read from a script).

### When it breaks live

**Don't panic.** Don't apologize. Say this:

> "This is actually a great teaching moment."

Then pick the appropriate recovery:

| Failure | What to say | Recovery |
|---------|-------------|----------|
| AI generates garbage output | "See this? This is exactly what happens with a bad prompt. Let me show you the difference with a good one." | Show the pre-saved good output. Contrast it. |
| AI API is slow (>30 seconds) | "While we wait — let me show you what the output looks like." | Switch to the sample output file. Come back to the live demo when it responds. |
| AI API is down | "API is having a moment. Here's what I ran earlier — same prompt, same feature." | Use sample outputs entirely. The concept matters more than the live demo. |
| Docker compose fails | "Let's skip the containers and run it directly." | `cd backend/product-service && npx tsx src/index.ts` and `cd frontend && npm run dev` |
| Tests fail unexpectedly | "Tests failing is part of the process. Let's debug this together." | If it's a real environment issue, checkout a known-good state. If it's a legit test failure, use it as a teaching moment about the TDD cycle. |
| Internet goes down completely | All tools work offline except the AI API. | Switch to whiteboarding the flow. Walk through the 3-file system on the whiteboard. Use printed sample outputs. |

**Specific backup plans:**
- Have a second Anthropic API key from a different account/org. Rate limits hit at the worst times.
- Know the git hash of a known-good state. If the repo is messed up: `git stash && git checkout <known-good-hash>`.
- Have `node_modules` pre-installed on your machine. `npm install` over bad WiFi is a 20-minute disaster.

---

## 3. Timing Buffers

The schedule is tight. Know what to cut and what to protect.

### Day 1

| Section | Scheduled | Minimum viable | How to compress |
|---------|-----------|----------------|-----------------|
| Section 1: Why This Works | 45 min | 30 min | Cut slides 1.3 and 1.4 (the room already agrees AI is frustrating — don't belabor it). Go straight from the opening discussion (1.1) to the spectrum (1.2) to the experienced engineer's story (1.5). |
| Section 2: 2-File System + Demo | 75 min | 60 min | Compress the demo: do Step 1 (PRD) and Step 3 (execute one task) fully. Skip Step 4 (second task). NEVER cut Step 5 (the failure demo) — it's the most persuasive 10 minutes of the day. |
| Break | 15 min | 15 min | Non-negotiable. They need to process. |
| Section 3: Tool Transition + Setup | 75 min | 45 min | If setup goes smoothly, great — they get exploration time. If setup is rough, skip the troubleshooting slide (3.5) and handle issues 1:1. Skip "Open Exploration" (3.6) entirely if needed. |
| Lunch | 60 min | 60 min | Non-negotiable. This is Israel — lunch matters. |
| PRD Exercise (afternoon) | 90 min | 60 min | Give pre-filled scaffold (first 3 PRD sections) and focus the exercise on the later sections: edge cases, API contracts, data models. Cut the full-room review to 10 minutes. |
| Task Breakdown Exercise | 105 min | 75 min | Skip the live review entirely. Have them submit task lists and review async (or over coffee next morning). Focus exercise time on generating and self-reviewing. |
| Day 1 Debrief | 30 min | 15 min | Quick round-the-room: each person says one thing that clicked and one thing that's still unclear. No open discussion. |

### Day 2

| Section | Scheduled | Minimum viable | How to compress |
|---------|-----------|----------------|-----------------|
| Task Execution | 90 min | 75 min | Each person executes one task only. Don't try to complete the full feature — the point is experiencing the cycle, not finishing. |
| Change Request Exercise | 105 min | 75 min | Give the change request pre-written (the curveball from 04-checkout-flow.md: coupon codes, split payments, or sales tax). Skip the "update your PRD" step — just discuss how you would update it, then focus on regenerating affected tasks. |
| 1:1 with Tech Lead | 90 min | 60 min | Focus on: PRD review process, what to enforce in week 1, and the Week 1 pilot plan from the 30-day roadmap. Defer task conventions and CI/CD leadership to their own reading of the guides. |
| CI/CD Planning | 60 min | 30 min | Walk through the `ci-cd-integration.md` guide together. Point out the rollout priority table (Week 1: AI PR Review, Week 2: Test Suggestions, etc.). Skip hands-on setup — they'll do it in Week 3 per the 30-day roadmap. |
| Wrap-up | 45 min | 30 min | Drop the metrics discussion (it's in the 30-day roadmap doc — they can read it). Focus on: pick the first real feature, assign the pilot engineer, set the Monday start date. |

### The buffer rule

If you're running 15+ minutes behind at any point, immediately cut the next "nice-to-have" section. Don't try to speed up — rushed content is worse than skipped content. The priority stack (protect these, in order):

1. The failure demo (Day 1, Section 2, Step 5)
2. PRD exercise — at least 60 minutes of hands-on
3. Task execution exercise — at least one full TDD cycle per person
4. Tech lead 1:1
5. Everything else is cuttable

---

## 4. Questions to Check Understanding

Don't just ask "does this make sense?" Nobody says no to that. Ask questions that force them to demonstrate understanding.

### During the PRD exercise

- "What's the most important section of your PRD? Why that one?"
- "If I deleted everything except one section, which would you keep?" (Answer should be edge cases or API contracts — if they say Overview, they don't get it yet.)
- "What question did the AI ask that surprised you? That you hadn't thought about?"
- "Show me your edge cases. Are they really edge cases, or are they just normal flows you forgot to list as requirements?"
- "Read me your Out of Scope section. Is there anything in there that should actually be in scope?"

### During task breakdown

- "Point to task 1.3. Can it be done without task 1.2? If yes, why is 1.2 listed as a dependency?"
- "What's the test for this task? Describe it in one sentence." (If they can't, the task isn't well-defined.)
- "Is this task atomic? Could the AI handle this in one session without losing context? If you're not sure, it's probably too big."
- "If you deleted this task entirely, would anything in the feature break? If no, why is it here?"
- "How many lines of code do you expect this task to produce? If it's more than 200, break it down further."

### During task execution (Day 2)

- "Why did you write the test before the implementation?" (They should be able to articulate the value, not just say "because the process says to.")
- "What would you do if this test fails after you implement?"
- "Show me the commit message. Does it match what the task description said?"
- "Read me the test. Now read me the task. Do they match? Did the AI test what you actually asked for?"
- "What context did you give the AI for this task? Was it enough?"

### General probes (any time)

- "Explain the 2-file system to me like I'm a new hire who just joined your team." (Tests whether they internalized it or are just following steps.)
- "When would you NOT use this system? Give me a real example from your codebase."
- "What's the most likely way this process fails in your team? What kills it?"

---

## 5. Reading the Room

### Signs things are going well

- Engineers arguing about PRD sections. "Why did you put that in Out of Scope? That should be in scope!" — this means they're engaged with the content, not just going through motions.
- Someone says "oh, THAT'S why my AI output was garbage" — they've connected the quality-of-input to quality-of-output. This is the key insight landing.
- They start helping each other without being told to. Organic collaboration means the psychological safety is there.
- The experienced engineer learns something new. If even they are surprised by something (usually the task breakdown structure or the failure demo), you know the content is adding value beyond what they already knew.
- Questions get more specific over time. "How does this work?" (bad — too vague) shifts to "What happens if the AI generates a task that conflicts with an existing endpoint?" (good — they're thinking about their real codebase).

### Signs you need to pivot

| Signal | What it means | What to do |
|--------|--------------|------------|
| Silence during exercises | They're stuck. Or lost. Or both. | Walk around. Check in privately. "What are you working on right now? Where are you stuck?" |
| Someone checking their phone repeatedly | They've checked out. The content isn't landing for them. | Take a break. Or shift format: "Let's pause the exercise and do this one together on screen." |
| "This won't work for our codebase" | Real concern or reflexive resistance. Either way, address it directly. | "Tell me specifically why. What's different about your codebase that breaks this?" Then adapt the example to their context. |
| "I already do this" (from the experienced engineer) | Could be true. More likely they do parts of it informally. | "Great — let's see. Pull up the last feature you shipped. Walk me through what your spec looked like." |
| The experienced engineer answering every question | The others have stopped trying. | "I want to hear from [name]. What do you think?" Direct-call on quiet participants. |
| Frustration (sighing, leaning back, arms crossed) | Something is off. Could be content, pace, or personal. | Private check-in during the next break. "Hey, I noticed you seemed frustrated in that last section. What's going on? What can I do differently?" |
| "Can we just start coding?" | They don't see the value of the planning steps yet. | "I hear you. Hang with me for one more exercise. If it still feels like overhead after you've done the full cycle once, we'll talk about shortcuts." |

### When to abandon the plan

These are the circuit breakers. If any of these happen, stop and adapt.

- **Setup takes more than 30 minutes:** Skip to paper exercises. Literally print the feature brief, have them write the PRD sections on paper or in a Google Doc. Fix the tech setup over lunch.
- **The team is way ahead of schedule:** Skip the remaining Day 1 exercises and jump into Day 2 execution content. Give them a harder feature (checkout flow with the change request curveball).
- **The team is struggling with fundamentals:** Slow down. Drop the Day 2 CI/CD section entirely. Spend more time on PRD writing and task breakdown. They can read the CI/CD guide on their own — the core workflow is what matters.
- **Active resistance to the process:** Stop. Don't push through. Say: "Let's pause. I'm sensing some pushback, and I want to understand it. What about this process doesn't feel right for how you work?" Have an honest 15-minute conversation. If the resistance is about the specific system, adapt. If it's about using AI at all, that's a different conversation and you need to address it before continuing.
- **One person is completely disengaged:** Talk to them privately during a break. Not in front of the group. "I want this to be useful for you. What would make the rest of today more valuable?" If they're fundamentally not interested, don't force it — but make sure they're not poisoning the room for the others.

---

## 6. Cultural Notes (Israel-specific)

These are not stereotypes — they're practical observations for running a productive session.

### Directness

Israeli engineers will tell you if they think something is pointless. Directly. To your face. This is a feature, not a bug. Don't get defensive. If someone says "this seems like a lot of overhead," respond with equal directness:

> "It is overhead. The question is whether the overhead saves you more time than it costs. Let's find out."

### Silence = trouble

In a room of Israeli engineers, silence means one of two things: they're genuinely deep in thought (rare during a group discussion), or they're disengaged/confused. If the room goes quiet during what should be a discussion, probe:

> "I'm getting silence, which usually means either 'this is obvious' or 'this makes no sense.' Which is it?"

The Hebrew equivalents to watch for:
- "achla" / "sababa" = they're fine, they're tracking, keep going
- "nu?" = "get to the point" — you're taking too long on something
- Lots of side conversations in Hebrew = they're processing among themselves. Let it happen for a minute, then bring it back: "What are you guys debating? Let's hear it."

### Food and breaks

- Lunch is at least 60 minutes. Not 45. Not "working lunch." Real lunch.
- If someone brings food to the office (they will), don't try to compete with it. Take the break, eat together.
- Coffee culture is strong. If the office has a coffee machine, expect a 5-minute coffee gathering between every section. Build that into your timing.

### If the CEO/founder drops by

They will. At some point. When they do:

- They want to see tangible output. Not slides, not theory. Have a visible artifact ready: a completed PRD on screen, a working feature that was built during the session, a task list with checkmarks.
- They'll ask "is this actually working?" or "what's the ROI?" Keep a one-sentence answer ready: "We built [feature X] in [Y hours] that would normally take [Z days]. The system produces structured specs that cut rework."
- Don't let the CEO derail the session. If they want to talk strategy, say: "I'd love to discuss that — can we do 15 minutes at the end of day?" Protect the team's learning time.

### Hierarchy is flat

The tech lead's title doesn't automatically command authority. In Israeli startups, influence comes from competence and trust, not org charts. This means:

- The tech lead needs to earn buy-in for the process, not mandate it.
- During the 1:1, discuss this explicitly: "How do you usually get the team to adopt new processes? What's worked before?"
- If an engineer pushes back on the tech lead during the workshop, don't intervene. Let them work it out. That's healthy.

### Interruptions and tangents

Expect them. Israeli meeting culture is...fluid. People will interrupt, talk over each other, go on tangents, and come back. Don't fight this. Redirect gently:

> "Love that idea — can we park it and come back after this exercise?"

Have a visible "parking lot" (whiteboard section or sticky note area) where you write down tangent topics. Come back to them during debrief or wrap-up. People feel heard, and you keep the session on track.

### Humor

Humor works well. Specifically:

- Self-deprecating humor about AI failures lands perfectly. "I've been teaching this system for months and the AI still generates garbage when I give it a bad prompt."
- Dry humor about the process itself: "Yes, we're going to write a spec before writing code. I know. Revolutionary."
- Don't joke about their codebase or their current practices. That crosses a line fast.

---

## 7. Feature Assignment Strategy

Assign features deliberately based on skill level. Don't let people self-select.

| Engineer | Feature | Why |
|----------|---------|-----|
| Less experienced #1 | Product Search (01) | Most straightforward. Clear inputs/outputs. No payment, no moderation, no file uploads. They'll build confidence here. |
| Less experienced #2 | Seller Dashboard (02) | Slightly harder (aggregation, charts, date ranges) but still a self-contained CRUD + read feature. Good stretch without being overwhelming. |
| Experienced engineer | Review System (03) or Checkout Flow (04) | Review system has photo uploads, moderation, rating aggregation — lots of moving parts. Checkout flow is the hardest and includes the change request curveball for Day 2. Pick based on what will keep them most engaged. |
| Tech lead | Same feature as one of the others, or observe/review | If they want to code: pair them with a less-experienced engineer as a reviewer, not a co-builder. If they want to focus on the process: have them review all three PRDs. |

### The change request curveball (Day 2)

The checkout flow feature brief has three built-in change requests:
1. "Product just decided we need coupon/promo code support in checkout"
2. "We need to support split payments"
3. "Legal says we need to collect sales tax per state"

Use #1 (coupon codes) as the change request during the Day 2 exercise. It's the most contained and doesn't require rearchitecting the whole flow. If the team is strong, use #2 (split payments) for a bigger challenge.

**How to introduce it:**

> "I just got a Slack message from the product manager. They need coupon codes in checkout. The feature is half-built. What do you do?"

The point is to show that with a good PRD and task structure, a mid-flight change is manageable: update the PRD, regenerate affected tasks, continue. Without the system, a change like this causes chaos.

---

## 8. Day 2 Afternoon: Tech Lead 1:1

This is the most important 90 minutes of the workshop. Everything else teaches the team a workflow. This session determines whether the workflow survives after you leave.

### What to cover

**Block 1 (20 min): Their current reality**
- How do features go from idea to code today?
- Where do requirements live? (Slack messages? Jira tickets? Someone's head?)
- How often do features get reworked because specs were wrong?
- What's the biggest time sink in their sprint cycle?

**Block 2 (20 min): Their new role**
- PRD review is now their highest-leverage activity. Not code review. PRD review.
- Walk through the 30-day roadmap Week 1 together. They're the one running Monday's pilot.
- Discuss: who's the pilot engineer for Week 1? (Recommendation: the experienced one, so the others can observe a full cycle before they're on the spot.)

**Block 3 (20 min): Enforcement and adaptation**
- "What happens when someone skips the PRD?"
  - The answer should be: "No task breakdown review without a PRD. Period."
- "What happens when the task list is vague?"
  - The answer should be: "Can I hand this task to someone who hasn't read the PRD? No? Then it's too vague."
- "What if the AI can't do a particular task?"
  - The answer should be: "That's fine. Some tasks are human-only. The system doesn't require AI for every task."

**Block 4 (20 min): CI/CD rollout**
- Walk through the `ci-cd-integration.md` rollout priority table
- Week 1: just the workflow. No CI automation.
- Week 3: add AI PR review in advisory mode.
- Month 2: evaluate blocking mode.
- Make sure they understand: advisory first, always. Don't gate merges on AI findings until the team trusts the tool.

**Block 5 (10 min): The uncomfortable question**

> "What's going to kill this process in your team? Be honest with me."

Listen. Don't defend the system. Whatever they say, work with it. If they say "nobody will write PRDs," discuss how to make PRD writing faster. If they say "the experienced engineer will skip it," discuss how to handle that conversation. If they say "I don't have time to review PRDs," discuss what to deprioritize.

---

## 9. Emergency Fills

If you suddenly have 15-20 minutes to fill (unlikely, but it happens), use these:

**"PRD Roast" (15 min):** Take one of the sample PRDs and find everything wrong with it. "This PRD says 'fast performance' — what does that actually mean? How do you test 'fast'?" Gets them thinking critically about spec quality.

**"AI Failure Gallery" (10 min):** Show 3-4 examples of hilariously bad AI output from vague prompts. The worse the output, the more memorable the lesson. Collect these before the workshop.

**"Reverse Engineering" (15 min):** Show them a piece of existing code in the marketplace app and ask: "What PRD would have produced this code? Write the PRD section that describes this endpoint." Forces them to think backwards from implementation to spec.

**"Dependency Untangling" (10 min):** Give them a deliberately tangled task list where the dependencies are wrong (circular dependencies, missing dependencies). Have them fix it. Good for reinforcing the task breakdown mindset.

---

## 10. Pre-Workshop Checklist

### 48 hours before
- [ ] Run the full demo end-to-end twice on your machine
- [ ] Verify Docker services start cleanly (`docker compose up -d && docker compose ps`)
- [ ] Pre-generate Anthropic API keys (one per engineer + one backup)
- [ ] Print API keys on individual cards (don't project them on screen)
- [ ] Download and cache the sample output files locally
- [ ] Prepare the "failure demo" — have a vague prompt ready that produces bad output
- [ ] Check that the marketplace app's tests pass: `cd backend/product-service && npm test` and `cd frontend && npm test`
- [ ] Read through all 4 feature briefs and all 4 sample PRDs

### Morning of
- [ ] Arrive 60 minutes early
- [ ] Test the WiFi. Run a speed test. If it's under 10 Mbps, set up your hotspot.
- [ ] Boot Docker. Run `docker compose up -d`. Wait for healthy status.
- [ ] Open the `create-prd.md` template in a Claude Code session and verify it responds
- [ ] Open the marketplace app in a browser (localhost:3333) and verify it loads
- [ ] Set up the projector/TV. Make sure terminal font is large enough to read from the back of the room.
- [ ] Put a "parking lot" section on the whiteboard for tangent topics
- [ ] Have water and coffee available. Seriously — dehydrated engineers are grumpy engineers.

### In your bag
- [ ] Mobile hotspot (charged)
- [ ] USB-C adapter for projector/TV (bring multiple — you never know what they have)
- [ ] Printed copies of: create-prd.md template, one sample PRD, one sample task list
- [ ] A notebook for writing down observations (what worked, what didn't — for your own improvement)
- [ ] Power strip / extension cord (co-working spaces never have enough outlets)
