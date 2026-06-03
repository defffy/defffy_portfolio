---
name: commit
description: Stage and commit changes using Conventional Commits. Groups related changes into separate, logically-scoped commits using best judgement, and never adds Claude as a co-author. Use when the user asks to commit changes, create commits, or wrap up work into commits.
---

# Commit

Create one or more git commits from the current changes, following the
[Conventional Commits](https://www.conventionalcommits.org/) spec. Group related
changes together and split unrelated changes into separate commits.

## Workflow

### Step 1 — Survey the changes

Run these in parallel to understand the full state:

```bash
git status
git diff            # unstaged changes
git diff --staged   # already-staged changes
git log --oneline -10   # match the repo's existing style
```

If there are no changes to commit, stop and tell the user.

### Step 2 — Group changes into commits

Use your best judgement to split the changes into logically distinct commits.
Each commit should represent one coherent unit of work. Prefer multiple focused
commits over one large mixed commit.

Group by intent, not by file. Common boundaries to split on:

- Different types of change (a feature vs. a bug fix vs. a refactor vs. docs)
- Unrelated areas of the codebase
- A functional change vs. mechanical churn (formatting, renames, moves)
- Anything that would need a different `type` or scope in the commit message

Keep changes together when they form a single complete change (e.g. a function
and its test, an implementation and the types it requires).

When splitting, stage selectively:

- Stage whole files with `git add <file>`
- Stage parts of a file with `git add -p` (or `git add --patch <file>`) when one
  file contains changes that belong to different commits

Never use `git add -A` or `git add .` unless every change genuinely belongs in a
single commit. Avoid committing files that may contain secrets (`.env`,
credentials) — warn the user if they appear.

### Step 3 — Write Conventional Commit messages

Format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat` — a new feature
- `fix` — a bug fix
- `docs` — documentation only
- `style` — formatting, whitespace, no code-behavior change
- `refactor` — code change that neither fixes a bug nor adds a feature
- `perf` — performance improvement
- `test` — adding or correcting tests
- `build` — build system or dependency changes
- `ci` — CI configuration
- `chore` — other changes that don't modify src or test files
- `revert` — reverts a previous commit

**Rules:**

- Description: imperative mood, lowercase, no trailing period, ≤ ~72 chars
- Add a scope in parentheses when it adds clarity, e.g. `feat(auth): ...`
- Use the body to explain _why_, not _what_ — only when it isn't obvious
- Breaking changes: append `!` after the type/scope (`feat!:`) and/or add a
  `BREAKING CHANGE:` footer

### Step 4 — Commit

Create each commit with a HEREDOC for correct formatting:

```bash
git commit -m "$(cat <<'EOF'
feat(scope): concise description

Optional body explaining why.
EOF
)"
```

**Do NOT add a `Co-Authored-By: Claude ...` trailer.** The user is the sole
author of these commits.

Repeat staging + committing for each group until all intended changes are
committed. Then run `git status` once more to confirm a clean (or expected) tree
and show the user a short summary of the commits created.

### Notes

- Only create commits — do not `git push` unless the user explicitly asks.
- Never amend existing commits unless the user asks; always create new commits.
- Never skip hooks (`--no-verify`). If a pre-commit hook fails, fix the
  underlying issue, re-stage, and create a new commit.
