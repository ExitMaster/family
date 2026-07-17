# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues on `exitmaster/family`.

> **Note on tooling:** this repo is worked from Claude Code's remote environment,
> which has **no `gh` CLI**. Use the **GitHub MCP tools** (`mcp__github__*`) for all
> issue operations. The `gh` commands below are shown only as a reference for the
> equivalent operation.

## Conventions

- **Create an issue**: `mcp__github__issue_write` (method `create`) with `owner`, `repo`, `title`, `body`, `labels`. (`gh issue create`)
- **Read an issue**: `mcp__github__issue_read` (`get` / `get_comments` / `get_sub_issues`). (`gh issue view <n> --comments`)
- **List issues**: `mcp__github__list_issues` or `mcp__github__search_issues` with label/state filters. (`gh issue list`)
- **Comment on an issue**: `mcp__github__add_issue_comment`. (`gh issue comment`)
- **Apply / remove labels, assign, close**: `mcp__github__issue_write` (method `update`) with `labels`, `assignees`, `state`. (`gh issue edit` / `gh issue close`)

The repo is `exitmaster/family` (from `git remote -v`).

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

## When a skill says "publish to the issue tracker"

Create a GitHub issue via `mcp__github__issue_write` (create).

## When a skill says "fetch the relevant ticket"

Read it via `mcp__github__issue_read` (get + get_comments).

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Destination / Notes /
  Decisions-so-far / Not-yet-specified / Out-of-scope body. Create with
  `mcp__github__issue_write` (create) + `labels: ["wayfinder:map"]`.
- **Child ticket**: an issue created with `mcp__github__issue_write` (create), then
  linked to the map as a GitHub **sub-issue** via `mcp__github__sub_issue_write`
  (method `add`, `sub_issue_id` = the child's numeric **database id**, from
  `mcp__github__issue_read` → `id`, _not_ the `#number`). Also put `Part of #<map>`
  at the top of the child body as a human-readable backstop. Labels:
  `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`). Once claimed,
  assign the ticket to the driving dev.
- **Blocking**: GitHub-native issue dependencies aren't exposed through the MCP tools
  here, so use the **body convention**: a `Blocked by: #<n>, #<n>` line at the top of
  the child body (under `Part of #<map>`). A ticket is **unblocked** when every issue
  in its `Blocked by` line is closed.
- **Frontier query**: read the map's open children (`mcp__github__issue_read`
  `get_sub_issues`, keep `state: open`), drop any with an unclosed issue in its
  `Blocked by` line or a non-empty `assignees`; first in map order wins.
- **Claim**: `mcp__github__issue_write` (update) adding the driving dev to
  `assignees` — the session's first write, before any other work.
- **Resolve**: `mcp__github__add_issue_comment` with the answer, then
  `mcp__github__issue_write` (update) `state: closed`, then append a context pointer
  (gist + link) to the map's Decisions-so-far.
