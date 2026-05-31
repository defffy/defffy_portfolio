---
name: do-work
description: Plans, implements, validates, and commits a piece of work in the repository. Runs pnpm type-check and pnpm run test in a feedback loop until all checks pass, then commits. Use when user asks to implement a feature, fix a bug, or complete a task end-to-end with tests passing and a final commit.
---

# Implement and Commit

## Workflow

### Step 1 — Plan (Optional)

If the task has not already been planned, create a plan for it.

### Step 2 — Implement

**First, identify the context** — before writing any code, determine whether the work touches backend or frontend:

- **Backend**: files in `app/services/`, `app/api/`, `app/lib/`, or any `*.service.ts` / `*.ts` outside a UI directory
- **Frontend**: files under `app/components/`, `app/pages/`, or any `.tsx` / `.jsx` UI file

If the task spans both, apply TDD only to the backend slices.

**Backend — red/green/refactor per tracer-bullet slice:**

For each slice of backend functionality, one at a time:

1. **Red** — Write exactly one failing test for the smallest vertical slice of behavior.
2. Run `pnpm run test` and confirm it fails for the right reason.
3. **Green** — Write the minimal production code to make that test pass. Run `pnpm run test` to confirm green.
4. Repeat with the next slice.
5. **Refactor** — Clean up without breaking the test. Re-run `pnpm run test` to stay green.

**Frontend — implement directly** (no red/green/refactor loop).

General rules for all code:

- Edit only the files identified in the plan
- Follow all rules in CLAUDE.md (e.g. object params for functions with multiple same-typed args, test files for services)
- Do not add comments, docstrings, or extra abstractions beyond what the task requires
- While implementing show me a checklist of all the steps you are running while editing files.

### Step 3 — Feedback loop

Run the feedback loops and fix any issues. Run until both pass cleanly.

```bash
pnpm typecheck
pnpm run test
```



### Step 4 — Commit

Once all checks pass, create a git commit:

1. Stage only the files changed for this task (avoid `git add -A` unless intentional)
2. Write a concise commit message focused on _why_, not _what_
3. Do not end the commit message with:
   ```
   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   ```
