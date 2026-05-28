# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static HTML/JSX prototype for an **Issue Reporting Setup** feature in a workplace management app (Robin). There is no build step, no package manager, and no Node.js — the prototype runs directly in the browser by loading React 18 and Babel Standalone from CDN.

## Running the prototype

Open `Issue Reporting Setup.html` in a browser. Because the JSX files are loaded as `<script type="text/babel" src="...">`, you need to serve it over HTTP (not `file://`) or Babel's module loader will fail:

```sh
python3 -m http.server 8080
# then open http://localhost:8080/Issue%20Reporting%20Setup.html
```

There are no tests, no lint commands, and no build commands.

## Architecture

All global state lives in `app.jsx` (`App` component). Scripts are loaded in dependency order via `<script>` tags in the HTML:

| File | Role |
|---|---|
| `icons.jsx` | SVG icon library exposed as `window.I` (e.g. `I.Building`, `I.Gear`) |
| `data.jsx` | Static mock data exposed as `window.DATA` (`BUILDINGS`, `RESOURCES`, `PEOPLE`, `RULES`, `QUESTION_TYPES`, `QUESTION_STARTERS`) |
| `shell.jsx` | Chrome components (`Rail`, `SubNav`, `PageHeader`, `EmptyState`) exposed as `window.Shell` |
| `setup-flow.jsx` | Setup modals (`SetupChoiceModal`, `BuildingSelectModal`, `ServiceNowStubModal`) exposed as `window.SetupModals` |
| `builder.jsx` | Full-screen builder overlay (`Builder`) exposed as `window.Builder` |
| `app.jsx` | Root `App` component + `ConfigSummary`; mounts to `#root` |

Because each file exposes globals rather than using ES modules, all cross-file references are via `window.*` (or bare names since they're on `window`).

## State model

`App` holds all state:
- `modal`: which setup modal is open (`'choose' | 'pickBuilding' | 'serviceNow' | null`)
- `builderBuilding`: the building object currently being edited in the Builder, or `null`
- `configs`: map of `buildingId → config` (persisted in memory only; no backend)

The per-building `config` object (built by `buildInitialConfig()` in `builder.jsx`) is keyed by resource ID (`spaces`, `desks`, `laptops`, `parking`, `lockers`, `poi`) and each resource entry holds `{ enabled, assignee, questions[], rules{}, ruleConfig{} }`.

## Key conventions

- React hooks are destructured with unique aliases per file (e.g. `useStateB`, `useEffectApp`) to avoid name collisions in the global scope.
- Question IDs are generated with `qid()` using a timestamp + counter to ensure uniqueness.
- The `ServiceNow` path is intentionally a stub — only "Start from scratch" is implemented.
