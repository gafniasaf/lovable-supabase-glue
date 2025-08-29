### Cursor Terminal Prompting Rules (PowerShell)

Purpose: ensure assistants always capture and show command output reliably.

- Always run commands non-interactively
  - Prefer: `powershell -NoProfile -Command "..."` when spawning, or direct PowerShell commands in this shell.

- Never chain with `&&` and avoid pipes to `cat`
  - Use `;` to separate commands in PowerShell.
  - Do not pipe to `cat`/`Get-Content` from a command. `Get-Content` expects a path, not pipeline input.

- Disable pagers and capture both stdout and stderr
  - Use `git --no-pager ...` (or `-c core.pager=cat`).
  - Append `2>&1` when you need stderr captured.

- Force visible output via on-disk artifacts
  - Write outputs to `artifacts/ops/<timestamp>-<name>.{txt|json}` using `Out-File -Encoding utf8`.
  - Then display with `Get-Content <file>` (or `cmd /c type <file>` as fallback).

- Prefer structured output for GitHub operations
  - Use `gh ... --json <fields>` for status checks, PRs, and runs.
  - Store JSON to file and read it back for deterministic visibility.

- Set UTF-8 output when emitting non-ASCII
  - `[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()` before long sessions.

- Examples
  - Capture PR JSON:
    - `gh pr view 10 --json number,state,mergeStateStatus | Out-File -Encoding utf8 artifacts/ops/pr10.json; Get-Content artifacts/ops/pr10.json`
  - Capture command + stderr:
    - `(git --no-pager status -sb) 2>&1 | Out-File -Encoding utf8 artifacts/ops/git-status.txt; Get-Content artifacts/ops/git-status.txt`

- Helper script
  - Use `scripts/ops/exec.ps1` to standardize capture-and-print for any command.


