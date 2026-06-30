document.getElementById("year").textContent = new Date().getFullYear();

// Optional per tool: color (any CSS color) and icon (one SVG <path d="…">).
// Omit either and you get a hashed color / generic icon.
const ICONS = {
  chart: "M3 3v18h18M7 14l4-4 3 3 5-6",                    // line up
  bell:  "M6 8a6 6 0 1112 0c0 7 3 7 3 7H3s3 0 3-7M9 21h6", // alert bell
  box:   "M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7",         // cube
};
const GENERIC = "M4 4h16v16H4zM4 9h16";

const TOOLS = [
  { name: "Office Kit", url: "https://officekit.maplescraps.com/", category: "General", desc: "Mini tools" },
  { name: "Project Management", url: "https://example.com", category: "General", desc: "Replace me." },
  { name: "Example CI/CD Tool", url: "https://example.com", category: "CI/CD", desc: "Replace me." },
  { name: "Example IT Support Tool", url: "https://example.com", category: "IT Support", desc: "Replace me." },
  { name: "Example Infrastructure Tool", url: "https://example.com", category: "Infrastructure", desc: "Replace me.", icon: ICONS.box },
  { name: "Grafana", url: "https://grafana.com", category: "Observability", desc: "Dashboards & metrics.", color: "#f46800", icon: ICONS.chart },
  { name: "Sentry", url: "https://sentry.io", category: "Observability", desc: "Error tracking.", color: "#6c5fc7", icon: ICONS.bell },
  { name: "Datadog", url: "https://www.datadoghq.com", category: "Observability", desc: "Monitoring & APM.", color: "#632ca6", icon: ICONS.chart },
  { name: "Prometheus", url: "https://prometheus.io", category: "Observability", desc: "Metrics & alerting.", color: "#e6522c", icon: ICONS.bell },
  { name: "Loki", url: "https://grafana.com/oss/loki/", category: "Observability", desc: "Log aggregation.", color: "#fbcb0a" },
];

// Stable color from name when none given: hash → hue.
const hashHue = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const colorFor = (t) => t.color ?? `hsl(${hashHue(t.name)} 60% 45%)`;

const main = document.getElementById("tools");
const search = document.getElementById("search");

// Render once: group by category, build sections.
const byCat = TOOLS.reduce((m, t) => ((m[t.category] ??= []).push(t), m), {});
for (const [cat, tools] of Object.entries(byCat)) {
  const section = document.createElement("section");
  section.dataset.cat = cat;
  section.innerHTML = `<h2>${cat}</h2><div class="grid"></div>`;
  const grid = section.querySelector(".grid");
  for (const t of tools) {
    const a = document.createElement("a");
    a.className = "tool";
    a.href = t.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.dataset.text = `${t.name} ${t.desc ?? ""}`.toLowerCase();
    a.style.setProperty("--c", colorFor(t));
    a.innerHTML = `<svg class="ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">`
      + `<path d="${t.icon ?? GENERIC}"/></svg>`
      + `<div class="body"><div class="name"></div>${t.desc ? `<div class="desc"></div>` : ""}</div>`;
    a.querySelector(".name").textContent = t.name;
    if (t.desc) a.querySelector(".desc").textContent = t.desc;
    grid.append(a);
  }
  main.append(section);
}

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
