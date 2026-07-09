document.getElementById("year").textContent = new Date().getFullYear();

// Optional per tool: color (any CSS color) and icon (one SVG <path d="…">).
// Omit either and you get a hashed color / generic icon.
const ICONS = {
  chart: "M3 3v18h18M7 14l4-4 3 3 5-6",                    // line up
  bell:  "M6 8a6 6 0 1112 0c0 7 3 7 3 7H3s3 0 3-7M9 21h6", // alert bell
  box:   "M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7",         // cube
};
const GENERIC = "M4 4h16v16H4zM4 9h16";
const SVG_NS = "http://www.w3.org/2000/svg";

const TOOLS = [
  { name: "Office Kit", url: "https://officekit.maplescraps.com/", category: "General", desc: "Mini tools" },
  { name: "Task Management", url: "https://yfyjupiter-my.github.io/task-management/", category: "General", desc: "Centralize your tasks for simple manage" },
  { name: "Knowledge Board", url: "https://knowledge-board-lovat.vercel.app/", category: "General", desc: "Self-study knowledge manage"},
  { name: "Calculator", url: "https://yfyjupiter-my.github.io/calculator/", category: "General", desc: "Simple math calculation"},
  { name: "Example CI/CD Tool", url: "https://example.com", category: "CI/CD", desc: "Coming soon" },
  { name: "Web-file", url: "https://web-file-delta.vercel.app/", category: "IT Support", desc: "Portable file store"},
  { name: "IT Knowledge-Base", url: "https://example.com", category: "IT Support", desc: "Coming soon" },
  // Internal-only tools: point these hostnames at real internal DNS (LAN/VPN).
  // Do NOT hardcode raw private IPs here — this file may be served publicly.
  { name: "Endpoit Central", url: "https://endpoint-central.internal:8383/webclient#/uems/home/getting-started", category: "IT Support", desc: "Unified Endpoint Management and Security Platform"},
  { name: "Snipe-IT Asset Management", url: "https://snipe-it.internal", category: "IT Support", desc: "Asset and Financial Tracking"},
  { name: "Example Infrastructure Tool", url: "https://example.com", category: "Infrastructure", desc: "Coming soon", icon: ICONS.box },
  { name: "Grafana", url: "https://grafana.com", category: "Observability", desc: "Coming soon", color: "#f46800", icon: ICONS.chart },
  { name: "Sentry", url: "https://sentry.io", category: "Observability", desc: "Coming soon", color: "#6c5fc7", icon: ICONS.bell },
  { name: "Datadog", url: "https://www.datadoghq.com", category: "Observability", desc: "Coming soon", color: "#632ca6", icon: ICONS.chart },
  { name: "Prometheus", url: "https://prometheus.io", category: "Observability", desc: "Coming soon", color: "#e6522c", icon: ICONS.bell },
  { name: "Loki", url: "https://grafana.com/oss/loki/", category: "Observability", desc: "Coming soon", color: "#fbcb0a" },
];

// Stable color from name when none given: hash → hue.
const hashHue = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const colorFor = (t) => t.color ?? `hsl(${hashHue(t.name)} 60% 45%)`;

const main = document.getElementById("tools");
const search = document.getElementById("search");

// Render once: group by category, build sections.
const byCat = TOOLS.reduce((m, t) => ((m[t.category] ??= []).push(t), m), {});

// Persisted custom order of category cards (drag to rearrange).
const ORDER_KEY = "toolsPortal.catOrder";
const loadOrder = () => { try { return JSON.parse(localStorage.getItem(ORDER_KEY)) ?? []; } catch { return []; } };
const saveOrder = () => localStorage.setItem(ORDER_KEY,
  JSON.stringify([...main.children].map((s) => s.dataset.cat)));

const cats = Object.keys(byCat);
const saved = loadOrder().filter((c) => cats.includes(c));
const orderedCats = [...saved, ...cats.filter((c) => !saved.includes(c))];

for (const cat of orderedCats) {
  const tools = byCat[cat];
  const section = document.createElement("section");
  section.dataset.cat = cat;
  section.style.setProperty("--cat", `hsl(${hashHue(cat)} 60% 45%)`);
  // Static markup only here; the category name is appended as a text node
  // (never interpolated into innerHTML) so it can't inject DOM.
  section.innerHTML = `<h2><span class="grip" title="Drag to rearrange" aria-label="Drag to rearrange">⠿</span></h2><div class="grid"></div>`;
  section.querySelector("h2").append(cat);
  const grid = section.querySelector(".grid");
  for (const t of tools) {
    const a = document.createElement("a");
    a.className = "tool";
    a.href = t.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.dataset.text = `${t.name} ${t.desc ?? ""}`.toLowerCase();
    a.style.setProperty("--c", colorFor(t));
    // Build the icon via DOM: setAttribute("d", …) never parses HTML, so an
    // arbitrary icon path string cannot break out and inject markup.
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "ico");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "22");
    svg.setAttribute("height", "22");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", t.icon ?? GENERIC);
    svg.append(path);
    const body = document.createElement("div");
    body.className = "body";
    const nameEl = document.createElement("div");
    nameEl.className = "name";
    nameEl.textContent = t.name;
    body.append(nameEl);
    if (t.desc) {
      const descEl = document.createElement("div");
      descEl.className = "desc";
      descEl.textContent = t.desc;
      body.append(descEl);
    }
    a.append(svg, body);
    grid.append(a);
  }
  main.append(section);
}

// Drag to rearrange category cards. Dragging is armed only from the grip
// handle so tool links and text selection keep working normally.
let dragged = null;
main.addEventListener("mousedown", (e) => {
  const grip = e.target.closest(".grip");
  if (grip) grip.closest("section").draggable = true;
});
main.addEventListener("dragstart", (e) => {
  dragged = e.target.closest("section");
  dragged.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
});
// FLIP: smoothly slide siblings from their old spot to the new one.
const noMotion = matchMedia("(prefers-reduced-motion: reduce)");
function flipMove(mutate) {
  if (noMotion.matches) return mutate();
  const sibs = [...main.children].filter((s) => s !== dragged);
  const first = new Map(sibs.map((s) => [s, s.getBoundingClientRect()]));
  mutate();
  for (const s of sibs) {
    const a = first.get(s), b = s.getBoundingClientRect();
    const dx = a.left - b.left, dy = a.top - b.top;
    if (!dx && !dy) continue;
    s.style.transition = "none";
    s.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      s.style.transition = "transform .22s ease-out";
      s.style.transform = "";
    });
  }
}
main.addEventListener("dragover", (e) => {
  if (!dragged) return;
  e.preventDefault();
  const over = e.target.closest("section");
  if (!over || over === dragged) return;
  const r = over.getBoundingClientRect();
  const after = (e.clientY - r.top) / r.height > 0.5;
  const ref = after ? over.nextSibling : over;
  if (ref === dragged) return;         // no-op move, skip animation
  flipMove(() => main.insertBefore(dragged, ref));
});
main.addEventListener("dragend", () => {
  if (!dragged) return;
  dragged.classList.remove("dragging");
  dragged.draggable = false;
  dragged = null;
  for (const s of main.children) { s.style.transition = ""; s.style.transform = ""; }
  saveOrder();
});

// Filter on input: hide non-matching tools, then hide empty sections.
function filter() {
  const q = search.value.trim().toLowerCase();
  for (const section of main.children) {
    let any = false;
    for (const a of section.querySelectorAll(".tool")) {
      const hit = !q || a.dataset.text.includes(q);
      a.classList.toggle("hidden", !hit);
      any ||= hit;
    }
    section.classList.toggle("hidden", !any);
  }
}
search.addEventListener("input", filter);
search.addEventListener("keydown", (e) => { if (e.key === "Escape") { search.value = ""; filter(); } });
