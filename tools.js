const TOOLS = [
  { name: "Example Tool", url: "https://example.com", category: "General", desc: "Replace me." },
  { name: "Project Management", url: "https://example.com", category: "General", desc: "Replace me." },
  { name: "Example CI/CD Tool", url: "https://example.com", category: "CI/CD", desc: "Replace me." },
  { name: "Example IT Support Tool", url: "https://example.com", category: "IT Support", desc: "Replace me." },
  { name: "Example Infrastructure Tool", url: "https://example.com", category: "Infrastructure", desc: "Replace me." },
  { name: "Grafana", url: "https://grafana.com", category: "Observability", desc: "Dashboards & metrics." },
  { name: "Sentry", url: "https://sentry.io", category: "Observability", desc: "Error tracking." },
  { name: "Datadog", url: "https://www.datadoghq.com", category: "Observability", desc: "Monitoring & APM." },
  { name: "Prometheus", url: "https://prometheus.io", category: "Observability", desc: "Metrics & alerting." },
  { name: "Loki", url: "https://grafana.com/oss/loki/", category: "Observability", desc: "Log aggregation." },
];

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
    a.innerHTML = `<div class="name"></div>${t.desc ? `<div class="desc"></div>` : ""}`;
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
