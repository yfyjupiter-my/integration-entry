# PRD: Tool Portal (Frontend Integration Entry)

## 1. Executive Summary

- **Problem Statement**: You juggle many tool URLs across bookmarks/notes; finding the right one wastes time daily.
- **Proposed Solution**: A single static page (HTML/CSS/JS) on GitHub Pages listing all your tools, grouped by category with instant client-side search. Links are hardcoded in one config and updated via git.
- **Success Criteria**:
  - Any tool reachable in **≤ 2 actions** (load page → click, or type → Enter).
  - Search filters the visible list in **< 50ms** (it's all in-memory; trivially met).
  - Adding a new tool = editing **1 file** and a `git push`.
  - Page is **fully static** — zero backend, zero build step, zero dependencies.
  - First contentful paint **< 1s** on a normal connection (single file, no framework).

## 2. User Experience & Functionality

**User Persona**: You — single user, owns the repo, edits links directly.

**User Stories**

- *As the user, I want all my tools on one page so I stop hunting through bookmarks.*
  - **AC**: Every link opens in a new tab (`target="_blank" rel="noopener"`). Links shown with name; optional one-line description.
- *As the user, I want to type to filter so I find a tool without scrolling.*
  - **AC**: Search box auto-focuses on load. Typing filters by name + description (case-insensitive substring). Empty box shows everything. `Esc` clears.
- *As the user, I want tools grouped by category so related tools sit together.*
  - **AC**: Each tool has a category; categories render as labeled sections. Search hides empty sections.

**Non-Goals** (protect the scope)

- No in-browser editing, no localStorage, no accounts, no backend/DB.
- No live tool data, status, notifications, or API integration.
- No favorites/recent, no dark mode (add later if it earns its place).
- No framework, bundler, or npm dependencies.

## 3. AI System Requirements

Not applicable — no AI in this product.

## 4. Technical Specifications

**Architecture**: One folder, three files, served as static assets by GitHub Pages.

```
index.html      # structure + search box + container
style.css       # layout (CSS grid), responsive
tools.js        # const TOOLS = [{name, url, category, desc}], renders + filters
```

- Data is a single `TOOLS` array literal in `tools.js`. Render on load, filter on `input` event. ~40 lines of JS total.
- **Integration Points**: None. Tools are plain outbound `<a>` links; each tool handles its own auth.
- **Security & Privacy**: All `target="_blank"` links carry `rel="noopener noreferrer"`. No user data collected or stored. No secrets in repo (links only). Repo can be public or private — Pages works either way.

## 5. Risks & Roadmap

**Phased Rollout**

- **MVP**: `index.html` + `style.css` + `tools.js` with categories + search. Deploy: push to `main`, enable Pages on root. Done.
- **v1.1** *(only if needed)*: dark mode toggle (CSS `prefers-color-scheme` + a button), favorites via localStorage.
- **v2.0** *(only if it ever earns it)*: in-browser link editing — but that pulls in storage/sync complexity the current need doesn't justify.

**Risks** (all low)

- *Link rot*: dead URLs go unnoticed → optional: periodic manual check, or a GitHub Action link-checker if it becomes a chore.
- *Scope creep*: the v2 editing temptation. The whole value here is "no backend." Keep it static until that genuinely hurts.
