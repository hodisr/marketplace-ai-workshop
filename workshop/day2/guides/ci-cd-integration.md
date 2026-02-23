# CI/CD Integration Guide: AI-Augmented Development Pipeline

> Take-home reference for integrating AI tools into your GitHub Actions CI/CD pipeline.
> Tailored for a small team (3 engineers), TypeScript + Express.js backend, TypeScript + Nuxt 3 frontend, weekly deploy cadence.

---

## Table of Contents

1. [AI-Assisted Code Review on PR](#1-ai-assisted-code-review-on-pr)
2. [Automated Test Generation on PR](#2-automated-test-generation-on-pr)
3. [Pre-Merge Quality Checks](#3-pre-merge-quality-checks)
4. [Example Workflow YAML Files](#4-example-workflow-yaml-files)
5. [Rollout Priority](#5-rollout-priority)
6. [Practical Tips](#6-practical-tips)

---

## 1. AI-Assisted Code Review on PR

### What This Does

An AI reviewer automatically comments on every PR with findings about code quality, security, test gaps, and adherence to your project requirements. It runs alongside (not instead of) human review.

### How It Works

1. A GitHub Actions workflow triggers on `pull_request` events (opened, synchronized, reopened).
2. The workflow checks out the code, computes the diff, and sends it to Claude Code (or another AI tool).
3. The AI reviews the diff against your project context (PRD, coding standards, task list).
4. Results are posted as a PR comment.

### What the AI Should Check

| Category | What to Look For |
|---|---|
| **Code quality** | Dead code, overly complex functions, unclear naming, missing error handling |
| **Test coverage gaps** | Changed code paths that lack corresponding test updates |
| **Security issues** | Hardcoded secrets, SQL injection vectors, unvalidated user input, exposed internal IDs |
| **PRD adherence** | Does this PR implement what the linked task/ticket actually specifies? |
| **API consistency** | Do new endpoints follow existing naming conventions and response formats? |

### Passing Context to the AI Reviewer

The AI reviewer is only as good as the context you give it. Store project context in your repo so the workflow can reference it:

```
repo-root/
  .github/
    ai-context/
      prd-summary.md        # condensed PRD (keep under 4000 words)
      coding-standards.md   # your team's conventions
      task-list.md          # current sprint tasks (update weekly)
      api-patterns.md       # endpoint naming, response format, error handling
```

The workflow reads these files and includes them in the AI prompt. Keep them concise -- long context degrades review quality and increases cost.

### Workflow Overview

```yaml
# Trigger: PR opened or updated
# Steps:
#   1. Checkout code
#   2. Get the diff
#   3. Load project context files
#   4. Call AI with diff + context
#   5. Post result as PR comment
```

Full working YAML is in [Section 4: ai-pr-review.yml](#ai-pr-reviewyml).

---

## 2. Automated Test Generation on PR

### What This Does

When a PR is opened, the workflow identifies changed files that lack test coverage and generates test suggestions. These suggestions are posted as a PR comment -- they are not auto-committed.

### The Pattern

1. Detect which files changed in the PR.
2. Filter to source files (`.ts`, `.vue`) -- ignore configs, migrations, static assets.
3. For each changed file, check if a corresponding test file exists and was also modified.
4. For files with missing or stale tests, send the file content + diff to the AI.
5. The AI generates test suggestions with explanations.
6. Post suggestions as a PR comment.

### How to Handle Generated Tests

| Approach | Pros | Cons | Recommendation |
|---|---|---|---|
| **PR comment** | Non-intrusive, developer decides | Easy to ignore | Use this. Best for a small team. |
| **Auto-commit to PR branch** | Zero friction | Generates bad tests sometimes, pollutes git history | Avoid until you trust the output. |
| **Separate PR** | Clean separation | Creates PR noise, merge conflicts | Overkill for 3 engineers. |

**Start with PR comments.** If your team finds the suggestions consistently useful after a month, consider auto-commit with a manual approval step.

### When NOT to Auto-Generate Tests

- **Database migrations**: Tests for schema changes need careful human design.
- **Third-party integrations**: Mocking external APIs requires domain knowledge the AI lacks.
- **Performance-critical paths**: AI-generated tests rarely cover performance characteristics.
- **Complex state machines**: Buyer/seller flow transitions need hand-crafted scenario tests.
- **Auth/permissions logic**: Security-critical code needs deliberate, adversarial test design.

Full working YAML is in [Section 4: ai-test-suggestions.yml](#ai-test-suggestionsyml).

---

## 3. Pre-Merge Quality Checks

### Beyond Standard Linting

Standard linters catch syntax and style. AI-powered quality checks catch higher-level issues:

#### Architecture Consistency

- Does this new service follow the existing service layer pattern?
- Are new API routes registered in the correct router module?
- Does the frontend component follow the established data-fetching pattern (server-side rendering with Nuxt vs. client-side Vue components)?

#### API Contract Validation

- Do the TypeScript types in the frontend match the TypeScript interfaces in the backend?
- If a backend response shape changed, did the frontend types update accordingly?
- Are new API endpoints documented in the OpenAPI spec?

#### Marketplace-Specific Checks

- **Buyer/seller flow completeness**: If a new listing feature is added for sellers, is the corresponding buyer-facing view also handled?
- **Payment flow integrity**: Do changes to pricing or checkout touch the correct validation layers?
- **Multi-tenancy**: Does new data access properly scope to the correct user/organization?

### Advisory vs. Blocking Mode

Start in **advisory mode**: the quality gate posts comments but does not block merges. After 2-3 weeks of tuning (adjusting prompts, reducing false positives), switch to **blocking mode** where the check must pass before merge is allowed.

```yaml
# Advisory mode: always exits 0, posts findings as comments
# Blocking mode: exits 1 if critical issues found, blocks merge
```

Full working YAML is in [Section 4: ai-quality-gate.yml](#ai-quality-gateyml).

---

## 4. Example Workflow YAML Files

### `ai-pr-review.yml`

Save to `.github/workflows/ai-pr-review.yml`:

```yaml
name: AI PR Review

# Trigger on PR open, update, or reopen
on:
  pull_request:
    types: [opened, synchronize, reopened]

# Cancel in-progress runs for the same PR (saves API costs)
concurrency:
  group: ai-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write  # needed to post comments

jobs:
  ai-review:
    runs-on: ubuntu-latest
    # Skip drafts and bot PRs -- don't waste AI calls on WIP
    if: >
      github.event.pull_request.draft == false &&
      github.actor != 'dependabot[bot]'

    steps:
      # Step 1: Checkout the repo with full history for accurate diffs
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # full history so we can diff against base

      # Step 2: Get the diff between the PR branch and its base
      - name: Generate PR diff
        id: diff
        run: |
          # Get the merge base to compute an accurate diff
          MERGE_BASE=$(git merge-base origin/${{ github.event.pull_request.base.ref }} HEAD)
          DIFF=$(git diff "$MERGE_BASE" HEAD -- . \
            ':!package-lock.json' \
            ':!*.generated.*' \
            ':!migrations/' \
            | head -c 100000)
          # Write diff to file to avoid shell escaping issues
          echo "$DIFF" > /tmp/pr_diff.txt

      # Step 3: Load project context (PRD, standards, task list)
      - name: Load AI context
        id: context
        run: |
          CONTEXT=""
          # Append each context file if it exists
          for f in .github/ai-context/prd-summary.md \
                   .github/ai-context/coding-standards.md \
                   .github/ai-context/task-list.md \
                   .github/ai-context/api-patterns.md; do
            if [ -f "$f" ]; then
              CONTEXT="$CONTEXT\n\n--- $(basename $f) ---\n$(cat $f)"
            fi
          done
          echo "$CONTEXT" > /tmp/ai_context.txt

      # Step 4: Run Claude Code review
      # Uses the official Claude Code GitHub Action
      - name: Run AI review
        id: review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            You are a code reviewer for a marketplace startup.
            Stack: TypeScript + Express.js backend, TypeScript + Nuxt 3 frontend.

            Review the following PR diff. Be concise and actionable.
            Focus on:
            1. Bugs or logic errors
            2. Security issues (injection, auth bypass, data exposure)
            3. Missing error handling
            4. Test coverage gaps (changed code without test updates)
            5. Adherence to project standards (see context below)

            Skip style-only feedback — linters handle that.
            Skip praise — just flag problems and suggestions.

            If everything looks good, say "No issues found." and nothing else.

            PROJECT CONTEXT:
            $(cat /tmp/ai_context.txt)

            PR DIFF:
            $(cat /tmp/pr_diff.txt)

      # Step 5: Post the review as a PR comment
      - name: Post review comment
        uses: actions/github-script@v7
        with:
          script: |
            const review = `${{ steps.review.outputs.response }}`;
            // Only comment if there's actual feedback
            if (review && review.trim() !== '') {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: `## AI Code Review\n\n${review}\n\n---\n*Automated review by Claude Code. This is advisory — use your judgment.*`
              });
            }
```

### Alternative: Using the Claude API Directly

If you prefer not to use `anthropics/claude-code-action`, replace Step 4 with a direct API call:

```yaml
      # Step 4 (alternative): Call Claude API directly via curl
      - name: Run AI review via API
        id: review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          DIFF=$(cat /tmp/pr_diff.txt)
          CONTEXT=$(cat /tmp/ai_context.txt)

          # Build the prompt
          PROMPT="Review this PR diff for a marketplace app (Express.js + Nuxt 3).
          Flag bugs, security issues, missing error handling, test gaps.
          Skip style feedback. Be concise.

          CONTEXT:
          $CONTEXT

          DIFF:
          $DIFF"

          # Call Claude API
          RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
            -H "content-type: application/json" \
            -H "x-api-key: $ANTHROPIC_API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -d "$(jq -n \
              --arg prompt "$PROMPT" \
              '{
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 4096,
                "messages": [{"role": "user", "content": $prompt}]
              }')" | jq -r '.content[0].text')

          # Save response for the next step
          echo "$RESPONSE" > /tmp/review_output.txt
```

---

### `ai-test-suggestions.yml`

Save to `.github/workflows/ai-test-suggestions.yml`:

```yaml
name: AI Test Suggestions

on:
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: ai-tests-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

jobs:
  test-gap-analysis:
    runs-on: ubuntu-latest
    if: >
      github.event.pull_request.draft == false &&
      github.actor != 'dependabot[bot]'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # Step 1: Identify changed source files and their test status
      - name: Analyze changed files
        id: changes
        run: |
          MERGE_BASE=$(git merge-base origin/${{ github.event.pull_request.base.ref }} HEAD)

          # Get changed source files (TypeScript and Vue, exclude tests themselves)
          CHANGED_SRC=$(git diff --name-only "$MERGE_BASE" HEAD \
            | grep -E '\.(ts|vue)$' \
            | grep -v 'node_modules' \
            | grep -v '\.d\.ts$' \
            | grep -v 'migrations/' \
            | grep -v -E '(test_|\.test\.|\.spec\.|_test\.)')

          if [ -z "$CHANGED_SRC" ]; then
            echo "skip=true" >> $GITHUB_OUTPUT
            echo "No source files changed, skipping test analysis."
            exit 0
          fi

          echo "skip=false" >> $GITHUB_OUTPUT

          # Get changed test files for comparison
          CHANGED_TESTS=$(git diff --name-only "$MERGE_BASE" HEAD \
            | grep -E '(test_|\.test\.|\.spec\.|_test\.)')

          # Build a report of what has tests and what doesn't
          REPORT=""
          for src_file in $CHANGED_SRC; do
            # Derive expected test file paths
            # Backend: src/services/pricing.ts -> src/services/__tests__/pricing.test.ts
            # Frontend: components/Cart.vue -> components/__tests__/Cart.test.ts
            base=$(basename "$src_file")
            name="${base%.*}"
            ext="${base##*.}"

            has_test="no"
            if echo "$CHANGED_TESTS" | grep -q "$name"; then
              has_test="yes (updated in this PR)"
            elif find . -name "test_${name}.*" -o -name "${name}.test.*" -o -name "${name}.spec.*" 2>/dev/null | grep -q .; then
              has_test="yes (exists but not updated)"
            fi

            REPORT="$REPORT\n- $src_file [test: $has_test]"
          done

          echo -e "$REPORT" > /tmp/test_report.txt

      # Step 2: Get the full diff for files missing tests
      - name: Get diff for untested files
        if: steps.changes.outputs.skip != 'true'
        run: |
          MERGE_BASE=$(git merge-base origin/${{ github.event.pull_request.base.ref }} HEAD)
          # Get the diff, capped at 80k chars to stay within token limits
          git diff "$MERGE_BASE" HEAD -- . \
            ':!package-lock.json' \
            ':!*.generated.*' \
            | head -c 80000 > /tmp/pr_diff.txt

      # Step 3: Ask AI to generate test suggestions
      - name: Generate test suggestions
        if: steps.changes.outputs.skip != 'true'
        id: suggestions
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          TEST_REPORT=$(cat /tmp/test_report.txt)
          DIFF=$(cat /tmp/pr_diff.txt)

          PROMPT="You are a test engineering assistant for a marketplace app.
          Stack: TypeScript + Express.js (vitest), TypeScript + Nuxt 3 (vitest).

          Here are the source files changed in this PR and their test status:
          $TEST_REPORT

          Here is the PR diff:
          $DIFF

          For files marked [test: no], generate concrete test suggestions.
          For each suggestion:
          1. Name the test file that should be created or updated.
          2. List 3-5 specific test cases (function names + one-line descriptions).
          3. Write ONE example test implementation for the most important case.

          Rules:
          - Backend tests use vitest.
          - Frontend tests use vitest with @vue/test-utils for components.
          - Focus on behavior, not implementation details.
          - Test error paths, not just happy paths.
          - If a file already has tests (updated or not), skip it unless the diff
            introduces clearly untested new branches.
          - If all changed files have adequate test coverage, respond with only:
            'Test coverage looks adequate for this PR.'

          Be concise. No preamble."

          RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
            -H "content-type: application/json" \
            -H "x-api-key: $ANTHROPIC_API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -d "$(jq -n \
              --arg prompt "$PROMPT" \
              '{
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 4096,
                "messages": [{"role": "user", "content": $prompt}]
              }')" | jq -r '.content[0].text')

          echo "$RESPONSE" > /tmp/test_suggestions.txt

      # Step 4: Post suggestions as PR comment
      - name: Post test suggestions
        if: steps.changes.outputs.skip != 'true'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const suggestions = fs.readFileSync('/tmp/test_suggestions.txt', 'utf8');
            if (suggestions && suggestions.trim() !== '') {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: `## AI Test Suggestions\n\n${suggestions}\n\n---\n*Automated test analysis by Claude. Copy useful tests, ignore the rest.*`
              });
            }
```

---

### `ai-quality-gate.yml`

Save to `.github/workflows/ai-quality-gate.yml`:

```yaml
name: AI Quality Gate

on:
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: ai-quality-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    if: >
      github.event.pull_request.draft == false &&
      github.actor != 'dependabot[bot]'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # Step 1: Collect all the context the AI needs
      - name: Gather analysis inputs
        id: gather
        run: |
          MERGE_BASE=$(git merge-base origin/${{ github.event.pull_request.base.ref }} HEAD)

          # Full diff
          git diff "$MERGE_BASE" HEAD -- . \
            ':!package-lock.json' \
            ':!*.generated.*' \
            | head -c 100000 > /tmp/pr_diff.txt

          # Changed file list with categories
          git diff --name-only "$MERGE_BASE" HEAD > /tmp/changed_files.txt

          # Detect if both frontend and backend changed (cross-stack PR)
          HAS_BACKEND=$(grep -c -E '^(app|backend|api)/' /tmp/changed_files.txt || echo 0)
          HAS_FRONTEND=$(grep -c -E '^(src|frontend|components|pages)/' /tmp/changed_files.txt || echo 0)
          echo "cross_stack=$( [ "$HAS_BACKEND" -gt 0 ] && [ "$HAS_FRONTEND" -gt 0 ] && echo true || echo false )" >> $GITHUB_OUTPUT

          # Extract TypeScript interfaces if backend changed (for contract validation)
          if [ "$HAS_BACKEND" -gt 0 ]; then
            # Find request/response types in changed backend files
            BACKEND_FILES=$(grep -E '^(app|backend|api)/' /tmp/changed_files.txt)
            for f in $BACKEND_FILES; do
              if [ -f "$f" ]; then
                grep -A 10 -E '(interface\s+\w+|type\s+\w+\s*=)' "$f" 2>/dev/null
              fi
            done > /tmp/backend_models.txt
          fi

          # Extract TypeScript types if frontend changed (for contract validation)
          if [ "$HAS_FRONTEND" -gt 0 ]; then
            FRONTEND_FILES=$(grep -E '^(src|frontend|components|pages)/' /tmp/changed_files.txt | grep -E '\.(ts|vue)$')
            for f in $FRONTEND_FILES; do
              if [ -f "$f" ]; then
                grep -A 5 -E '(interface |type |}: )' "$f" 2>/dev/null
              fi
            done > /tmp/frontend_types.txt
          fi

          # Load project context
          CONTEXT=""
          for f in .github/ai-context/coding-standards.md \
                   .github/ai-context/api-patterns.md; do
            if [ -f "$f" ]; then
              CONTEXT="$CONTEXT\n\n--- $(basename $f) ---\n$(cat $f)"
            fi
          done
          echo -e "$CONTEXT" > /tmp/ai_context.txt

      # Step 2: Run architecture consistency check
      - name: Architecture check
        id: arch_check
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          DIFF=$(cat /tmp/pr_diff.txt)
          CONTEXT=$(cat /tmp/ai_context.txt)
          CHANGED=$(cat /tmp/changed_files.txt)

          PROMPT="You are an architecture reviewer for a marketplace startup.
          Stack: TypeScript + Express.js backend, TypeScript + Nuxt 3 frontend.

          Analyze this PR for architecture issues ONLY. Ignore style, naming, typos.

          Check these specific things:
          1. PATTERN CONSISTENCY: Do new files follow existing patterns?
             - Backend: routes -> services -> repositories layering
             - Frontend: server-side rendering with Nuxt, Vue components for interactivity
          2. SEPARATION OF CONCERNS: Is business logic leaking into route handlers or components?
          3. ERROR HANDLING: Do new endpoints return proper HTTP status codes and error schemas?
          4. MARKETPLACE FLOWS: If this touches buyer or seller flows, are both sides handled?
             - New listing fields -> buyer search/display updated?
             - New payment logic -> seller payout logic updated?
             - New permissions -> both API and UI enforced?

          Changed files:
          $CHANGED

          Project standards:
          $CONTEXT

          Diff:
          $DIFF

          Respond in this exact format:
          CRITICAL: [list items that MUST be fixed before merge, or 'none']
          WARNINGS: [list items that SHOULD be addressed, or 'none']
          INFO: [list observations that are fine to merge as-is, or 'none']

          Be terse. One line per item. No explanations unless the issue is non-obvious."

          RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
            -H "content-type: application/json" \
            -H "x-api-key: $ANTHROPIC_API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -d "$(jq -n \
              --arg prompt "$PROMPT" \
              '{
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 2048,
                "messages": [{"role": "user", "content": $prompt}]
              }')" | jq -r '.content[0].text')

          echo "$RESPONSE" > /tmp/arch_review.txt

          # Check if there are critical issues (for blocking mode)
          if echo "$RESPONSE" | grep -q "^CRITICAL:" && ! echo "$RESPONSE" | grep -q "CRITICAL:.*none"; then
            echo "has_critical=true" >> $GITHUB_OUTPUT
          else
            echo "has_critical=false" >> $GITHUB_OUTPUT
          fi

      # Step 3: API contract validation (only for cross-stack PRs)
      - name: API contract check
        if: steps.gather.outputs.cross_stack == 'true'
        id: contract_check
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          BACKEND_MODELS=$(cat /tmp/backend_models.txt 2>/dev/null || echo "No backend models found")
          FRONTEND_TYPES=$(cat /tmp/frontend_types.txt 2>/dev/null || echo "No frontend types found")
          DIFF=$(cat /tmp/pr_diff.txt)

          PROMPT="This is a cross-stack PR (both backend and frontend changed).

          Check for API contract mismatches:
          1. Do the frontend TypeScript types match the backend TypeScript interfaces?
          2. Are there new backend fields not consumed by the frontend?
          3. Are there frontend assumptions about fields that the backend doesn't provide?
          4. Do request/response shapes align?

          Backend TypeScript interfaces (excerpts):
          $BACKEND_MODELS

          Frontend TypeScript types (excerpts):
          $FRONTEND_TYPES

          Full diff:
          $DIFF

          List mismatches only. If contracts align, say 'API contracts look consistent.'
          Be specific: name the model/type and field that mismatch."

          RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
            -H "content-type: application/json" \
            -H "x-api-key: $ANTHROPIC_API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -d "$(jq -n \
              --arg prompt "$PROMPT" \
              '{
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 2048,
                "messages": [{"role": "user", "content": $prompt}]
              }')" | jq -r '.content[0].text')

          echo "$RESPONSE" > /tmp/contract_review.txt

      # Step 4: Post combined quality report
      - name: Post quality report
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const archReview = fs.readFileSync('/tmp/arch_review.txt', 'utf8');

            let contractReview = '';
            try {
              contractReview = fs.readFileSync('/tmp/contract_review.txt', 'utf8');
            } catch {
              contractReview = '_Skipped (single-stack PR)_';
            }

            const body = [
              '## AI Quality Gate',
              '',
              '### Architecture Review',
              archReview,
              '',
              '### API Contract Validation',
              contractReview,
              '',
              '---',
              '*Automated quality check by Claude. Advisory mode — does not block merge.*'
            ].join('\n');

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: body
            });

      # Step 5: Fail the check if blocking mode is enabled and critical issues found
      # To enable blocking mode: change BLOCKING_MODE to 'true'
      - name: Enforce quality gate
        env:
          BLOCKING_MODE: 'false'  # Change to 'true' after 2-3 weeks of advisory mode
        run: |
          if [ "$BLOCKING_MODE" = "true" ] && [ "${{ steps.arch_check.outputs.has_critical }}" = "true" ]; then
            echo "::error::AI Quality Gate found critical architecture issues. See PR comment for details."
            exit 1
          fi
          echo "Quality gate passed (advisory mode)."
```

---

## 5. Rollout Priority

Adopt incrementally. Each phase builds confidence before adding more automation.

| Timeline | What | Mode | Risk | Notes |
|---|---|---|---|---|
| **Week 1** | AI PR Review | Advisory (comment only) | Low | Purely informational. Developers learn to calibrate trust. |
| **Week 2** | Test Gap Analysis | Advisory (comment only) | Low | Suggests tests, never writes them automatically. |
| **Week 3** | Quality Gate | Advisory (comment only) | Low | Architecture + contract checks, no merge blocking. |
| **Week 4** | Quality Gate | Blocking (critical only) | Medium | Only block on critical issues after tuning prompts for 3 weeks. |
| **Month 2** | AI Changelogs | Advisory | Low | Auto-generate release notes from merged PRs. |
| **Month 2** | Deployment Summaries | Advisory | Low | Summarize what shipped in each weekly deploy. |
| **Month 3+** | Full Pipeline | Mixed | Medium | Evaluate: which checks should block, which stay advisory. |

### Decision Criteria for Blocking Mode

Promote a check from advisory to blocking only when:

1. False positive rate is below ~10% (you aren't constantly overriding it).
2. The team has seen at least 3 cases where it caught a real issue.
3. All 3 engineers agree it adds value.

---

## 6. Practical Tips

### Cost Considerations

AI API calls are not free. Budget accordingly.

| Workflow | Estimated Cost per PR | Assumption |
|---|---|---|
| AI PR Review | $0.02 - $0.08 | Average diff ~2000 lines, Sonnet model |
| Test Suggestions | $0.03 - $0.10 | Includes file content + diff |
| Quality Gate | $0.04 - $0.15 | 1-2 API calls depending on cross-stack |
| **Total per PR** | **$0.09 - $0.33** | |
| **Monthly (3 engineers, ~30 PRs)** | **$3 - $10** | |

This is negligible. If costs rise (e.g., larger diffs, more context), the first lever is truncating diffs and context, not removing checks.

### Rate Limiting and Caching

- **Concurrency groups** (included in all YAML above) cancel redundant runs when a PR is updated rapidly. This is the single most important cost control.
- **Skip drafts and bot PRs** (included above) avoids wasted calls.
- **Diff size cap**: The workflows above cap diffs at 80-100k characters. For larger PRs, truncation is acceptable -- the AI will note it reviewed a partial diff.
- **Cache context files**: The project context files (`.github/ai-context/`) are read from the repo, not fetched externally. No caching needed.

### Handling False Positives

False positives will happen, especially in the first 2 weeks. Handle them:

1. **Don't block on AI findings initially.** Advisory mode exists for this reason.
2. **Track false positives.** When a developer sees a wrong suggestion, note it. After a week, update the prompt to exclude that pattern.
3. **Refine prompts iteratively.** Add explicit "do NOT flag X" instructions for recurring false positives. Example:

   ```
   Do NOT flag:
   - Optional fields in TypeScript interfaces (we use optional properties deliberately)
   - Any patterns in files under /generated/
   ```

4. **Use the `ai-context/` directory.** Document your patterns there so the AI stops flagging intentional deviations.

### When to Override AI Suggestions

Override freely. The AI is a reviewer, not an authority. Specific cases where overriding is expected:

- **Intentional tech debt**: "We know this isn't ideal, shipping it for the deadline, will fix in PROJ-1234."
- **Domain context the AI lacks**: Marketplace rules, business logic that isn't documented.
- **Performance trade-offs**: The AI may suggest "cleaner" code that is slower. You know your performance constraints.
- **Experimental features**: Quick prototypes behind feature flags don't need perfect architecture.

There is no process for overriding. Just merge the PR. The AI comment is a suggestion, not a gate (unless you enable blocking mode for critical issues).

### Security: What Never Goes to the AI

These must never appear in diffs or context sent to AI APIs:

| Never Send | How to Prevent |
|---|---|
| API keys, tokens, secrets | Use `.gitignore` and `git-secrets`. The diff excludes `.env` files by default. |
| Database credentials | Store in GitHub Secrets or a vault, never in code. |
| Customer PII | Should never be in code. If test fixtures contain PII, exclude fixture files from the diff. |
| Internal infrastructure details | Exclude deployment configs from AI review (add to pathspec exclusions). |

The workflow YAML files above exclude common sensitive patterns. Extend the exclusion list in the `git diff` commands:

```bash
# Add more exclusions as needed
git diff "$MERGE_BASE" HEAD -- . \
  ':!.env*' \
  ':!*secret*' \
  ':!*credential*' \
  ':!docker-compose.prod.yml' \
  ':!infrastructure/' \
  | head -c 100000
```

Additionally:

- The `ANTHROPIC_API_KEY` is stored as a GitHub Secret and never logged.
- Workflow logs may contain diff snippets. If your repo is private, this is acceptable. If public, add a step to suppress diff output from logs.
- Review Anthropic's data retention policy and ensure it meets your compliance requirements before sending production code to the API.

---

## Quick Reference

### Files to Create

```
.github/
  workflows/
    ai-pr-review.yml          # Copy from Section 4
    ai-test-suggestions.yml   # Copy from Section 4
    ai-quality-gate.yml       # Copy from Section 4
  ai-context/
    prd-summary.md            # Your PRD, condensed to <4000 words
    coding-standards.md       # Team conventions
    task-list.md              # Current sprint tasks
    api-patterns.md           # Endpoint naming, response format
```

### Secrets to Configure

In GitHub repo settings -> Secrets and variables -> Actions:

| Secret Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

### First PR Checklist

1. Add the three workflow files.
2. Add at least `coding-standards.md` to `.github/ai-context/` (other files can come later).
3. Add `ANTHROPIC_API_KEY` to GitHub Secrets.
4. Open a PR. Watch the Actions tab. Read the AI comments.
5. Iterate on prompts based on what the AI gets right and wrong.
