const byId = (id) => document.getElementById(id);

const THEME_STORAGE_KEY = "daily-briefing-theme";
const DATA_URL = "./data/latest.json";

const statusEl = byId("status");
const cadenceEl = byId("cadenceStatus");
const generatedAtEl = byId("generatedAt");
const snapshotEl = byId("snapshotStatus");
const newsList = byId("newsList");
const redditList = byId("redditList");
const newsMetaEl = byId("newsMeta");
const redditMetaEl = byId("redditMeta");
const refreshBtn = byId("refreshBtn");
const themeToggleBtn = byId("themeToggleBtn");
const loadingOverlay = byId("loadingOverlay");
const loadingMessageEl = byId("loadingMessage");
const template = byId("itemTemplate");
const panelToggleButtons = Array.from(document.querySelectorAll(".panel-toggle"));

const setTextWithType = (element, message, type = "info") => {
  element.textContent = message;
  element.dataset.type = type;
};

const setStatus = (message, type = "info") => {
  setTextWithType(statusEl, message, type);
};

const setCadence = (message, type = "info") => {
  setTextWithType(cadenceEl, message, type);
};

const setSnapshotStatus = (message, type = "info") => {
  setTextWithType(snapshotEl, message, type);
};

const applyTheme = (theme) => {
  document.body.dataset.theme = theme;
  const isDark = theme === "dark";
  themeToggleBtn.textContent = isDark ? "Light mode" : "Dark mode";
  themeToggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
};

const getPreferredTheme = () => {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const setLoading = (value, message = "Loading briefing...") => {
  document.body.classList.toggle("is-loading", value);
  loadingOverlay.hidden = !value;
  loadingOverlay.setAttribute("aria-hidden", value ? "false" : "true");
  loadingMessageEl.textContent = message;
};

const clearList = (list) => {
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
};

const createEmptyState = (message) => {
  const item = document.createElement("li");
  item.className = "empty-state";

  const title = document.createElement("p");
  title.className = "empty-title";
  title.textContent = "No items to show";

  const note = document.createElement("p");
  note.className = "empty-note";
  note.textContent = message;

  item.append(title, note);
  return item;
};

const createSourceLinks = (sources) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "source-links";

  sources.forEach((source, index) => {
    const link = document.createElement("a");
    link.href = source.url || "#";
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = source.title || `Source ${index + 1}`;
    wrapper.appendChild(link);
  });

  return wrapper;
};

const addItem = (list, item) => {
  const fragment = template.content.cloneNode(true);
  const primaryBadgeEl = fragment.querySelector(".badge.primary");
  const secondaryBadgeEl = fragment.querySelector(".badge.secondary");
  const linkEl = fragment.querySelector("a");
  const reasonEl = fragment.querySelector(".reason");
  const detailsContainer = fragment.querySelector(".item-details");

  primaryBadgeEl.textContent = item.primaryBadge;
  linkEl.textContent = item.title;
  linkEl.href = item.url || "#";
  reasonEl.textContent = item.reason;

  if (item.secondaryBadge) {
    secondaryBadgeEl.hidden = false;
    secondaryBadgeEl.textContent = item.secondaryBadge;
  }

  item.detailSections.filter(Boolean).forEach((section) => detailsContainer.appendChild(section));

  const sourceLinks = createSourceLinks(item.sources);
  if (sourceLinks) {
    detailsContainer.appendChild(sourceLinks);
  }

  list.appendChild(fragment);
};

const renderSectionMeta = (element, section) => {
  if (!section) {
    element.textContent = "Metadata unavailable.";
    return;
  }

  const details = [
    section.status.toUpperCase(),
    `${section.item_count} item${section.item_count === 1 ? "" : "s"}`,
    `${section.duration_ms}ms`,
    section.source,
  ];

  if (section.warning) {
    details.push(section.warning);
  } else if (section.error) {
    details.push(section.error);
  }

  element.textContent = details.join(" • ");
};

const renderList = (list, items, emptyMessage, mapper) => {
  clearList(list);
  if (!items || items.length === 0) {
    list.appendChild(createEmptyState(emptyMessage));
    return;
  }

  items.forEach((item) => addItem(list, mapper(item)));
};

const renderBriefing = (briefing) => {
  const metadata = briefing?.metadata ?? {
    overall_status: "partial",
    warnings: ["This generated briefing is missing metadata."],
    sections: {},
  };

  const generatedLabel = new Date(briefing.generated_at).toLocaleString();
  generatedAtEl.textContent = `${generatedLabel} • static snapshot`;

  const refreshInterval = metadata.refresh_interval_hours ?? 6;
  setCadence(`GitHub Pages snapshot updates every ${refreshInterval} hours.`, "ok");
  setSnapshotStatus(
    metadata.generated_for === "github-pages"
      ? "Published from the private source repo by GitHub Actions."
      : "Static snapshot loaded.",
    "ok",
  );

  renderSectionMeta(newsMetaEl, metadata.sections?.news);
  renderSectionMeta(redditMetaEl, metadata.sections?.reddit);

  renderList(
    newsList,
    briefing.news_summary,
    metadata.sections?.news?.error ||
      metadata.sections?.news?.warning ||
      "No recent news stories were selected.",
    (item) => ({
      primaryBadge: item.region.toUpperCase(),
      secondaryBadge: null,
      title: item.headline,
      url: item.sources[0]?.url,
      reason: item.summary || "",
      detailSections: [],
      sources: item.sources || [],
    }),
  );

  renderList(
    redditList,
    briefing.reddit_ai_summary,
    metadata.sections?.reddit?.error ||
      metadata.sections?.reddit?.warning ||
      "No Reddit AI stories were selected.",
    (item) => ({
      primaryBadge: `r/${item.subreddit}`,
      secondaryBadge: null,
      title: item.title,
      url: item.source_link,
      reason: item.summary || "",
      detailSections: [],
      sources: item.source_link
        ? [{ title: "Open discussion", url: item.source_link }]
        : [],
    }),
  );

  if (metadata.overall_status === "failed") {
    setStatus("Snapshot generation failed across all sections.", "error");
  } else if (metadata.overall_status === "partial") {
    setStatus(
      metadata.warnings?.[0] || "Snapshot loaded with partial source failures.",
      "warn",
    );
  } else {
    setStatus("Snapshot loaded and ready to review.", "ok");
  }
};

const loadBriefing = async () => {
  try {
    setLoading(true, "Loading the latest generated snapshot...");
    setStatus("Loading latest snapshot...", "info");
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Snapshot request failed (${response.status})`);
    }

    const briefing = await response.json();
    renderBriefing(briefing);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Failed to load snapshot.", "error");
    setCadence("GitHub Pages snapshot unavailable.", "warn");
    setSnapshotStatus("Publish workflow may not have generated the site yet.", "warn");
  } finally {
    setLoading(false);
  }
};

const setPanelCollapsed = (button, collapsed) => {
  const target = byId(button.dataset.target);
  if (!target) {
    return;
  }

  target.hidden = collapsed;
  button.textContent = collapsed ? "Expand" : "Collapse";
  button.setAttribute("aria-expanded", collapsed ? "false" : "true");
};

panelToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    setPanelCollapsed(button, expanded);
  });
});

themeToggleBtn.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
});

refreshBtn.addEventListener("click", () => {
  window.location.reload();
});

applyTheme(getPreferredTheme());
loadBriefing();
