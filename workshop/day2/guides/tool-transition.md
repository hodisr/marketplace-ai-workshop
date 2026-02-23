# Cursor to Claude Code — Transition Guide

## Why Claude Code for the 3-File System

The 3-file system (PRD, task list, execution prompt) is designed around a director-level workflow: you define *what* to build, the AI figures out *how*. This works best with a tool that can operate autonomously across your entire codebase.

**Cursor** is excellent at inline completions, single-file edits, and quick suggestions while you're reading code. It works well when you're already in the file and know what needs to change.

**Claude Code** excels at multi-file autonomous work — exactly what the 3-file system demands. When you hand it a task like "implement the user authentication module with tests," it can read your codebase, create/modify multiple files, run tests, and commit — all without you switching tabs.

**They're complementary.** Use Cursor for quick edits and code exploration. Use Claude Code for feature-level work driven by your PRD and task list. The terminal-first workflow matches the "director" mindset: you give direction, review output, and course-correct.

---

## Setup Guide

### Install Claude Code

Pick one:

```bash
# Homebrew (macOS)
brew install claude-code

# npm (any platform)
npm install -g @anthropic-ai/claude-code

# Direct download
curl -fsSL https://claude.ai/install-claude-code | sh
```

### API Key Configuration

```bash
# Set your API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Or add to your shell profile for persistence
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
source ~/.zshrc
```

### Basic Configuration

```bash
# Start Claude Code in your project directory
cd your-project
claude

# Claude Code reads your project structure automatically
# No additional configuration needed for most projects
```

Model selection and context settings are handled automatically. Claude Code defaults to the best available model and reads your full project for context.

### Verify Installation

```bash
# Run a simple test
claude "List the top-level files in this project and describe the tech stack"
```

If it reads your project and gives a coherent answer, you're set.

---

## Key Differences

| Concept | Cursor | Claude Code |
|---------|--------|-------------|
| Interface | IDE panel | Terminal |
| Context | Current file + references | Entire project |
| Workflow | Ask per edit | Give a task, review result |
| Multi-file | Limited | Native |
| Testing | Manual | Integrated in workflow |
| Git | Separate | Built into execution flow |

The biggest shift: in Cursor, you're editing *with* AI. In Claude Code, you're *directing* AI. You describe the outcome, it handles the implementation.

---

## Daily Workflow with Claude Code

**Morning:** Review your task list (`generate-tasks.md` output). Pick the next task.

**Start a task:**
1. Open your terminal in the project directory
2. Start Claude Code
3. Paste the relevant section from `execute-tasks.md` along with the task context
4. Let it read the codebase and begin working

**During the task:**
- AI writes tests first (if your execute prompt specifies TDD)
- AI implements the feature
- AI runs the tests
- AI commits on success
- You review each step — approve, reject, or course-correct

**Your job:** You are the reviewer, not the typist. Watch the output, check that it's heading in the right direction, and intervene when it drifts.

**End of task:**
- Verify all tests pass
- Review the diff (`git diff` or your preferred tool)
- Approve the commit or ask for changes
- Move to the next task

---

## When to Use Which Tool

### Use Cursor
- Quick fixes and typo corrections
- Inline suggestions while browsing code
- Exploring unfamiliar code with AI-assisted explanations
- Small, single-file edits where you know the exact location

### Use Claude Code
- Feature work driven by the 3-file system (PRD, tasks, execute)
- Multi-file refactors
- Test generation across modules
- Debugging complex issues that span multiple files
- Any task where you'd describe the *outcome* rather than the *edit*

### Use Both
- Code review: Cursor for reading and browsing, Claude Code for automated analysis
- Onboarding to a new codebase: Cursor to explore, Claude Code to summarize architecture

---

## Common Gotchas

**Don't fight the terminal.** It feels slower at first. Within a few days, the autonomous workflow is significantly faster than tab-switching in an IDE. Stick with it.

**Let Claude Code read your codebase first.** It needs context to make good decisions. Don't jump straight into a task — let it understand your project structure, conventions, and existing patterns.

**Don't micro-manage individual lines.** If you're dictating exact code, you're using Claude Code wrong. Direct at the task level: "Implement the payment processing endpoint with input validation and error handling." Let it choose the implementation details.

**If the output is wrong, improve the prompt.** When Claude Code produces something off-target, the fix is usually in your PRD or task description — not in manually editing the output. Better inputs produce better outputs.

**Don't paste your entire PRD every time.** Give it the specific task context it needs, not everything at once. Focused context produces focused output.

---

## A Note on Tool Agnosticism

This guide is written for Claude Code, but the 3-file system works with any AI coding tool. The templates (`create-prd.md`, `generate-tasks.md`, `execute-tasks.md`) are tool-agnostic — only the execution step changes. If your team prefers a different tool, swap out this guide and keep everything else.
