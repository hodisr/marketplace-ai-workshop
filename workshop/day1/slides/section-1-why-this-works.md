# Section 1: Why This Works

**Time**: 9:00–9:45 (45 min — flexible, can compress to 30 min)
**Goal**: Peer buy-in through shared experience. The experienced engineer leads, others listen and ask.

---

### Slide 1.1 — Opening Discussion (no slides, facilitated)

> **[SPEAKER NOTE]**: No slides here. Start with chairs in a circle if possible. This is a conversation, not a lecture. Keep it to 10 minutes max.

- Open question to the room: "How are you using AI tools today?"
- Follow-ups to draw out specifics:
  - "What do you use Cursor for most?"
  - "When does it help? When does it get in the way?"
  - "Has anyone tried giving it a bigger task — like a full feature?"
- Listen for common patterns: tab-completion, inline suggestions, occasional chat for boilerplate
- Don't correct anyone. Just collect the reality.

> **[TIMING]**: Strict 10 min. If conversation is rich, note topics to revisit later. Don't let this become a 30-min tangent.

---

### Slide 1.2 — The AI Development Spectrum

**Title**: Where Are You on the Spectrum?

```
Autocomplete → Copilot → Code Factory → Fully Autonomous
   |              |            |               |
 Tab to         "Write me    You're the PM,   AI runs the
 complete       this func"   AI is the team   whole show
```

- **Autocomplete**: AI finishes your lines. You're still writing code.
- **Copilot**: AI writes functions on request. You're still thinking line-by-line.
- **Code Factory**: You write specs, AI builds features. You review and steer.
- **Fully Autonomous**: AI handles everything. (Not where we're going — and not where you want to be.)

> **[SPEAKER NOTE]**: Most teams are on the left. The jump from Copilot to Code Factory is where the 5-10x productivity gains live. That's what today is about.

---

### Slide 1.3 — Where Most Teams Are vs. Where the Value Is

**Title**: The Gap

- Most teams: using AI to save 10-20% typing time
- Actual opportunity: 3-5x throughput on feature delivery
- The gap isn't about better AI models — it's about how you use them
- Analogy: a power drill vs. a hand screwdriver. The drill is useless if you hold it like a screwdriver.

> **[CHECK UNDERSTANDING]**: "Does this match your experience? Are you feeling like you're getting 10% or more like 2x?"

---

### Slide 1.4 — What's Frustrating About AI Tools Right Now

**Title**: Common Complaints (You've Probably Said These)

List (build interactively — ask the room first, then show):

1. "It writes code that doesn't fit my codebase style"
2. "It hallucinates APIs that don't exist"
3. "It works for small things but falls apart on anything complex"
4. "I spend more time fixing its output than I would writing it myself"
5. "It loses context halfway through"
6. "I don't trust it enough to let it do real work"

> **[SPEAKER NOTE]**: Every one of these is a symptom of the same root cause. Don't reveal the root cause yet — let the experienced engineer's story get there naturally.

---

### Slide 1.5 — The Experienced Engineer's Story

**Title**: What Actually Works (Live Discussion)

> **[SPEAKER NOTE]**: This is not scripted. The experienced engineer talks through their real experience. Below are talking points to hit, not a script. Encourage interruptions and questions.

**Talking points to cover:**

- What I tried first and why it didn't work:
  - Pasting requirements into chat and hoping for the best
  - Trying to build full features in one shot
  - Not reviewing AI output carefully enough
- The turning point: treating AI like a junior developer, not a magic box
- What works now:
  - Writing detailed specs before touching AI tools
  - Breaking work into small, testable chunks
  - Making the AI write tests first, then implement
  - Reviewing AI output the same way you'd review a PR
- What still doesn't work:
  - Complex architectural decisions (you still own those)
  - Debugging subtle logic errors (AI is bad at this)
  - Anything requiring deep domain knowledge the AI doesn't have

> **[TIMING]**: 15–20 min including Q&A. Let it breathe but don't let it ramble.

---

### Slide 1.6 — The Key Insight

**Title**: The Bottleneck Is You, Not the AI

- The AI can write code. That's solved.
- What it can't do: read your mind about what to build.
- The bottleneck is the quality of instructions you give it.
- Better instructions = better output. Every time. No exceptions.
- This is the entire premise of the system you're about to learn.

> **[SPEAKER NOTE]**: Pause here. Let this land. This reframe — from "AI isn't good enough" to "I'm not instructing it well enough" — is the foundation for everything that follows. If they don't buy this, the rest of the day won't stick.

> **[CHECK UNDERSTANDING]**: "Does this resonate? Or does it feel like I'm blaming you for bad AI output?" — address pushback honestly.

---

## Compression Plan

- Can compress to 30 min by cutting slides 1.3 and 1.4 and going straight to the engineer's story
- The room probably already agrees with the premise — Section 1 is about confirming it, not convincing
