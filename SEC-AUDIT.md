# Security Audit — Tools Portal

Date: 2026-07-09
Scope: `index.html`, `style.css`, `tools.js` (static GitHub Pages site, no backend)

---

## Findings

Item: Internal infrastructure disclosure (private IPs, ports, software)
Verdict: ✅ Fixed (current tree) — ⚠️ git history still exposes IPs (SEC-1.4 open)
Notes:
- FIXED 2026-07-09: raw IPs replaced with internal DNS placeholders `endpoint-central.internal` / `snipe-it.internal` (`tools.js:23-24`) plus a warning comment. Point these at real internal DNS.
- OUTSTANDING: prior commits still contain the IPs — history purge (SEC-1.4) not yet done.
- `tools.js:20` exposes `https://endpoint-central.internal:8383/webclient#/uems/...` — internal ManageEngine Endpoint Central host, port, and console path.
- `tools.js:21` exposes `http://snipe-it.internal:8000` — internal Snipe-IT asset-management host and port.
- If this repo / GitHub Pages site is public, this leaks internal network topology, hostnames, ports, and the exact products running (recon aid for an attacker). Even in a private repo this is fragile — a fork or leak discloses it.
- These are also unreachable to anyone off the LAN, so they don't work as public links anyway.

Item: DOM injection sink — `innerHTML` with interpolated data
Verdict: ✅ Fixed
Notes:
- FIXED 2026-07-09: category name now appended as a text node (`tools.js:61`); icon/card built via `createElementNS` + `setAttribute("d", …)` (`tools.js:73-96`), so no data reaches `innerHTML`. Original notes below.
- `tools.js:55` builds section markup with `` `...${cat}...` `` and assigns via `section.innerHTML` — category name is not escaped.
- `tools.js:65-67` interpolates `t.icon ?? GENERIC` directly into an SVG `<path d="…">` via `innerHTML`.
- Data is currently hardcoded and trusted, so no live XSS. But the pattern is inconsistent: `name`/`desc` are correctly set with `textContent` (`tools.js:68-69`) while `cat` and `icon` are not. Any future data source (JSON fetch, URL param, CMS) turns these into XSS sinks.

Item: Plain-HTTP (mixed-content) tool link
Verdict: ✅ Fixed
Notes:
- FIXED 2026-07-09: Snipe-IT link switched to `https://snipe-it.internal` (`tools.js:24`). Confirm the internal service actually serves TLS on that name.
- `tools.js:21` uses `http://snipe-it.internal:8000` (cleartext). Served from an HTTPS GitHub Pages origin, the navigation still works but transmits any session over unencrypted transport, and browsers may warn/block.

Item: No Content-Security-Policy
Verdict: ✅ Fixed
Notes:
- FIXED 2026-07-09: added `<meta http-equiv="Content-Security-Policy">` to `index.html` — `default-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`. Verified: same-origin CSS/JS load, inline SVG and CSSOM style writes are unaffected, and top-level navigation to external tools is not blocked (no `navigate-to`/`form-action` restriction set).

Item: `localStorage` order parsing
Verdict: ✅ Correct
Notes:
- `tools.js:42` wraps `JSON.parse` in try/catch and `tools.js:47` filters restored categories against the known `cats` list, so tampered/corrupt storage cannot inject unknown DOM or crash rendering. Good.

Item: External link hardening (`target="_blank"`)
Verdict: ✅ Correct
Notes:
- `tools.js:61-62` sets `rel="noopener noreferrer"` on every generated tool link, and the static footer links carry the same intent. No reverse-tabnabbing exposure.

Item: Third-party / supply-chain surface
Verdict: ✅ Correct
Notes:
- Zero external scripts, stylesheets, fonts, or npm dependencies. No CDN, so no SRI needed and no supply-chain surface. Consistent with the PRD's "zero dependencies" goal.

Item: Secrets in repo
Verdict: ✅ Correct
Notes:
- No API keys, tokens, or credentials found. Only URLs (but see the internal-IP disclosure finding above).

---

## Required Actions (subtasks)

### SEC-1 — Remove/relocate internal infrastructure references (High)
- [x] SEC-1.1 Remove the raw internal IPs from `tools.js` (Endpoint Central `endpoint-central.internal:8383`, Snipe-IT `snipe-it.internal:8000`). ✅
- [x] SEC-1.2 Replace with internal DNS hostnames behind the LAN/VPN. ✅ Placeholders `endpoint-central.internal` / `snipe-it.internal` added — repoint at real DNS.
- [ ] SEC-1.3 Confirm the GitHub repo + Pages visibility (public vs private); if public, treat the exposed IPs as disclosed and consider rotating any console paths / access. **(user action)**
- [ ] SEC-1.4 Purge the values from git history if the repo is (or may become) public — `git filter-repo` / BFG, since prior commits still contain them. **(user action — history rewrite)**

### SEC-2 — Harden DOM construction (Warning)
- [x] SEC-2.1 Category name now appended as a text node instead of `innerHTML` interpolation (`tools.js:61`). ✅
- [x] SEC-2.2 `t.icon` set via `path.setAttribute("d", …)` — no HTML parsing, arbitrary strings can't inject (`tools.js:80`). ✅
- [x] SEC-2.3 Icon/card built via `createElementNS`/`textContent`, consistent with `name`/`desc` (`tools.js:73-96`). ✅

### SEC-3 — Fix mixed content (Warning)
- [x] SEC-3.1 Snipe-IT link moved to `https://` (`tools.js:24`). ✅ Confirm the service serves TLS on that hostname.

### SEC-4 — Add Content-Security-Policy (Warning)
- [x] SEC-4.1 Added `<meta http-equiv="Content-Security-Policy">` to `index.html`; verified render, search, and drag are unaffected. ✅

### SEC-5 — Verify
- [x] SEC-5.1 Re-audited after fixes; verdicts flipped to ✅. `node --check tools.js` passes. Remaining open items: SEC-1.3 / SEC-1.4 (user actions).
