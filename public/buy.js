const $ = (sel) => document.querySelector(sel);

let currentUser = null;
let rawListings = [];
let focusLotId = null;

async function refreshMe() {
  const r = await fetch("/api/me");
  const data = await r.json();
  currentUser = data.user;
  const btnLogin = $("#btnLogin");
  const userBox = $("#userBox");
  if (currentUser) {
    btnLogin.classList.add("hidden");
    userBox.classList.remove("hidden");
    $("#avatar").src = currentUser.avatar || "";
    $("#avatar").alt = currentUser.displayName;
    window.CS2OrbitAuthHeader?.updateBalanceDisplay(currentUser);
  } else {
    btnLogin.classList.remove("hidden");
    userBox.classList.add("hidden");
    window.CS2OrbitAuthHeader?.updateBalanceDisplay(null);
  }
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function steamEconomyThumb(iconPath) {
  return `https://community.cloudflare.steamstatic.com/economy/image/${iconPath}/128fx64f`;
}


function getBuyCategoryDropdowns() {
  return window.CS2ItemCategories?.CATEGORIES || [];
}

function getActiveCategoryFilters() {
  const bar = document.getElementById("buyCategoryBar");
  if (!bar) return [];
  const filters = [];
  bar.querySelectorAll(".buy-cat").forEach((wrap) => {
    const catId = wrap.id.replace(/^buy-cat-/, "");
    const panel = wrap.querySelector(".buy-cat-panel");
    if (!panel) return;
    const allCb = panel.querySelector(".buy-cat-all");
    const items = [...panel.querySelectorAll(".buy-cat-item")];
    const checked = items.filter((cb) => cb.checked);
    if (!checked.length) return;
    if (allCb?.checked && !allCb.indeterminate) {
      filters.push({ type: "category", id: catId });
      return;
    }
    for (const cb of checked) {
      const needle = cb.getAttribute("data-needle") || "";
      if (needle) filters.push({ type: "needle", needle });
    }
  });
  return filters;
}

function syncBuyCatTriggerStates() {
  const bar = document.getElementById("buyCategoryBar");
  if (!bar) return;
  bar.querySelectorAll(".buy-cat").forEach((wrap) => {
    const hasChecked = !!wrap.querySelector(".buy-cat-item:checked");
    wrap.classList.toggle("buy-cat--filtered", hasChecked);
  });
}

function closeAllBuyCategoryPanels() {
  const bar = document.getElementById("buyCategoryBar");
  if (!bar) return;
  bar.querySelectorAll(".buy-cat--open").forEach((w) => w.classList.remove("buy-cat--open"));
  bar.querySelectorAll(".buy-cat-trigger").forEach((t) => t.setAttribute("aria-expanded", "false"));
}

function syncBuyCatSelectAll(panel) {
  const allCb = panel.querySelector(".buy-cat-all");
  const items = [...panel.querySelectorAll(".buy-cat-item")];
  if (!allCb || !items.length) return;
  const n = items.filter((cb) => cb.checked).length;
  if (n === 0) {
    allCb.checked = false;
    allCb.indeterminate = false;
  } else if (n === items.length) {
    allCb.checked = true;
    allCb.indeterminate = false;
  } else {
    allCb.checked = false;
    allCb.indeterminate = true;
  }
}

const BUY_CAT_TRIGGER_CHEV = `<span class="buy-cat-trigger-chev" aria-hidden="true"><svg class="buy-cat-trigger-chev-svg" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 1.75L6 6.25l4.5-4.5" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;

function buildBuyCategoryBar() {
  const bar = document.getElementById("buyCategoryBar");
  if (!bar) return;
  bar.innerHTML = "";
  const tray = document.createElement("div");
  tray.className = "buy-category-tray";
  bar.appendChild(tray);
  for (const cat of getBuyCategoryDropdowns()) {
    const wrap = document.createElement("div");
    wrap.className = "buy-cat";
    wrap.id = `buy-cat-${cat.id}`;

    const panelId = `buy-cat-panel-${cat.id}`;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "buy-cat-trigger";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-controls", panelId);
    trigger.innerHTML = `<span class="buy-cat-trigger-label">${escapeHtml(cat.label)}</span>${BUY_CAT_TRIGGER_CHEV}`;

    const panel = document.createElement("div");
    panel.className = "buy-cat-panel";
    panel.id = panelId;
    panel.setAttribute("role", "listbox");
    panel.setAttribute("aria-label", cat.label);

    const rowAll = document.createElement("label");
    rowAll.className = "buy-cat-row buy-cat-row--all";
    rowAll.innerHTML = `<span class="buy-cat-name">Выбрать все</span><input type="checkbox" class="buy-cat-all" aria-label="Выбрать все: ${escapeAttr(cat.label)}" />`;
    panel.appendChild(rowAll);

    for (const it of cat.items) {
      const thumb = it.icon
        ? `<span class="buy-cat-thumb-wrap"><img class="buy-cat-thumb" src="${escapeAttr(steamEconomyThumb(it.icon))}" alt="" width="52" height="24" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></span>`
        : `<span class="buy-cat-thumb-wrap buy-cat-thumb-wrap--empty" aria-hidden="true"></span>`;
      const row = document.createElement("label");
      row.className = "buy-cat-row";
      row.innerHTML = `
        ${thumb}
        <span class="buy-cat-name">${escapeHtml(it.name)}</span>
        <input type="checkbox" class="buy-cat-item" data-needle="${escapeAttr(it.needle)}" aria-label="${escapeAttr(it.name)}" />
      `;
      panel.appendChild(row);
    }

    wrap.appendChild(trigger);
    wrap.appendChild(panel);
    tray.appendChild(wrap);
  }
  syncBuyCatTriggerStates();
}

function wireBuyCategoryBar() {
  const bar = document.getElementById("buyCategoryBar");
  if (!bar) return;

  bar.addEventListener("click", (e) => {
    const tr = e.target.closest(".buy-cat-trigger");
    if (!tr || !bar.contains(tr)) return;
    e.preventDefault();
    const wrap = tr.closest(".buy-cat");
    const wasOpen = wrap.classList.contains("buy-cat--open");
    bar.querySelectorAll(".buy-cat--open").forEach((w) => {
      w.classList.remove("buy-cat--open");
      w.querySelector(".buy-cat-trigger")?.setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      wrap.classList.add("buy-cat--open");
      tr.setAttribute("aria-expanded", "true");
    }
  });

  bar.addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement) || t.type !== "checkbox") return;
    const panel = t.closest(".buy-cat-panel");
    if (!panel) return;
    if (t.classList.contains("buy-cat-all")) {
      panel.querySelectorAll(".buy-cat-item").forEach((cb) => {
        cb.checked = t.checked;
      });
      t.indeterminate = false;
    } else if (t.classList.contains("buy-cat-item")) {
      syncBuyCatSelectAll(panel);
    }
    syncBuyCatTriggerStates();
    applyFiltersAndRender();
  });

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (e.target.closest?.("#buyCategoryRibbon")) return;
      closeAllBuyCategoryPanels();
    },
    true
  );

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeAllBuyCategoryPanels();
  });
}

function wireBuyCategoryRibbonScroll() {
  const vp = document.getElementById("buyCategoryViewport");
  const prev = document.getElementById("buyCatScrollPrev");
  const next = document.getElementById("buyCatScrollNext");
  if (!vp || !prev || !next) return;

  const step = () => Math.max(160, Math.floor(vp.clientWidth * 0.55));

  function syncScrollButtons() {
    const { scrollLeft, scrollWidth, clientWidth } = vp;
    const max = Math.max(0, scrollWidth - clientWidth);
    prev.disabled = scrollLeft <= 2;
    next.disabled = scrollLeft >= max - 2;
  }

  prev.addEventListener("click", () => {
    vp.scrollBy({ left: -step(), behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    vp.scrollBy({ left: step(), behavior: "smooth" });
  });
  vp.addEventListener("scroll", syncScrollButtons, { passive: true });
  window.addEventListener("resize", syncScrollButtons);
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(syncScrollButtons);
    ro.observe(vp);
  }
  syncScrollButtons();
}

function listingTitle(L) {
  return (L.itemName && String(L.itemName).trim()) || "Предмет CS2";
}

function listingCreatedAt(L) {
  const t = Date.parse(L.createdAt || "");
  return Number.isFinite(t) ? t : 0;
}

function compareListings(a, b, sort) {
  const titleA = listingTitle(a);
  const titleB = listingTitle(b);
  const priceA = Number(a.priceRub) || 0;
  const priceB = Number(b.priceRub) || 0;
  const dateA = listingCreatedAt(a);
  const dateB = listingCreatedAt(b);
  const sellerA = String(a.sellerName || "");
  const sellerB = String(b.sellerName || "");

  switch (sort) {
    case "price-asc":
      return priceA - priceB || titleA.localeCompare(titleB, "ru");
    case "price-desc":
      return priceB - priceA || titleB.localeCompare(titleA, "ru");
    case "name-asc":
      return titleA.localeCompare(titleB, "ru") || priceA - priceB;
    case "name-desc":
      return titleB.localeCompare(titleA, "ru") || priceB - priceA;
    case "date-asc":
      return dateA - dateB || priceA - priceB;
    case "seller-asc":
      return sellerA.localeCompare(sellerB, "ru") || priceA - priceB;
    case "date-desc":
    default:
      return dateB - dateA || priceA - priceB;
  }
}

function sortListings(list, sort) {
  return [...list].sort((a, b) => compareListings(a, b, sort));
}

function getFilteredList() {
  let list = [...rawListings];
  const q = ($("#buySearch") && $("#buySearch").value.trim().toLowerCase()) || "";
  if (q) {
    list = list.filter((L) => {
      const t = listingTitle(L).toLowerCase();
      const seller = String(L.sellerName || "").toLowerCase();
      const asset = String(L.assetid || "");
      return t.includes(q) || seller.includes(q) || asset.includes(q);
    });
  }
  const minP = Number($("#buyPriceMin") && $("#buyPriceMin").value);
  const maxP = Number($("#buyPriceMax") && $("#buyPriceMax").value);
  if (Number.isFinite(minP) && minP > 0) {
    list = list.filter((L) => Number(L.priceRub) >= minP);
  }
  if (Number.isFinite(maxP) && maxP > 0) {
    list = list.filter((L) => Number(L.priceRub) <= maxP);
  }
  const catFilters = getActiveCategoryFilters();
  if (catFilters.length) {
    const matchFn = window.CS2ItemCategories?.listingMatchesFilters;
    list = list.filter((L) => {
      const title = listingTitle(L);
      if (matchFn) return matchFn(title, catFilters);
      const t = title.toLowerCase();
      return catFilters.some((f) => f.type === "needle" && t.includes(String(f.needle).toLowerCase()));
    });
  }
  const sort = ($("#buySort") && $("#buySort").value) || "date-desc";
  list = sortListings(list, sort);

  if (focusLotId) {
    const forced = rawListings.find((l) => l.id === focusLotId);
    if (forced && !list.some((l) => l.id === focusLotId)) {
      list = [forced, ...list];
    }
  }
  return list;
}

function scrollToFocusedLot() {
  if (!focusLotId) return;
  const el = document.getElementById(`lot-${focusLotId}`);
  if (!el) return;
  el.classList.add("listing-row--focus");
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => el.classList.remove("listing-row--focus"), 4000);
}

function renderListingRows(list) {
  const host = $("#listingsGrid");
  host.innerHTML = "";
  for (const L of list) {
    const row = document.createElement("div");
    row.className = "listing-row";
    row.id = `lot-${L.id}`;
    const steamProfile = `https://steamcommunity.com/profiles/${L.sellerSteamId}`;
    const tradeBtn = L.tradeOfferUrl
      ? `<a class="btn btn-primary btn-sm" href="${escapeAttr(L.tradeOfferUrl)}" target="_blank" rel="noopener noreferrer">Предложить обмен</a>`
      : `<span class="muted small">Нет Trade URL</span>`;
    const title = listingTitle(L);
    const icon = L.itemIcon && String(L.itemIcon).trim().startsWith("https://") ? String(L.itemIcon).trim() : "";
    const thumb = icon
      ? `<img class="listing-thumb" src="${escapeAttr(icon)}" alt="" width="72" height="72" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
      : `<div class="listing-thumb listing-thumb--placeholder" title="Нет превью: инвентарь продавца закрыт или предмет не найден"></div>`;
    const noteLine =
      L.note && String(L.note).trim()
        ? `<div class="muted small">${escapeHtml(L.note)}</div>`
        : `<div class="muted small">Предмет из инвентаря CS2</div>`;
    row.innerHTML = `
      <div class="listing-row-main">
        <div class="listing-thumb-wrap">
          ${thumb}
        </div>
        <div class="listing-row-text">
          <div class="listing-item-title">${escapeHtml(title)}</div>
          <div class="muted small">${escapeHtml(L.sellerName)} · asset ${escapeHtml(L.assetid)}</div>
          ${noteLine}
        </div>
      </div>
      <div class="listing-row-actions">
        <span><strong>${L.priceRub} ₽</strong></span>
        ${tradeBtn}
        <a class="btn btn-ghost btn-sm" href="${steamProfile}" target="_blank" rel="noopener">Профиль Steam</a>
        ${
          currentUser && currentUser.steamId === L.sellerSteamId
            ? `<button type="button" class="btn btn-ghost btn-sm" data-del="${escapeAttr(L.id)}">Снять</button>`
            : ""
        }
      </div>
    `;
    host.appendChild(row);
  }
  host.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-del");
      await fetch("/api/listings/" + encodeURIComponent(id), { method: "DELETE" });
      loadListings();
    });
  });
  scrollToFocusedLot();
}

function applyFiltersAndRender() {
  const host = $("#listingsGrid");
  if (!host) return;
  if (!rawListings.length) {
    host.innerHTML = '<p class="muted">Пока нет объявлений.</p>';
    return;
  }
  const list = getFilteredList();
  if (!list.length) {
    host.innerHTML = '<p class="muted">Нет объявлений по выбранным фильтрам.</p>';
    return;
  }
  renderListingRows(list);
}

async function loadListings() {
  const host = $("#listingsGrid");
  if (!host) return;
  host.innerHTML = '<p class="muted">Загрузка…</p>';
  try {
    const r = await fetch("/api/listings");
    const data = await r.json();
    rawListings = data.listings || [];
    applyFiltersAndRender();
  } catch {
    host.innerHTML = '<p class="muted">Не удалось загрузить объявления.</p>';
    rawListings = [];
  }
}

function resetBuyFilters() {
  const s = $("#buySearch");
  const min = $("#buyPriceMin");
  const max = $("#buyPriceMax");
  const sort = $("#buySort");
  if (s) s.value = "";
  if (min) min.value = "";
  if (max) max.value = "";
  if (sort) sort.selectedIndex = 0;
  const all = document.querySelector('input[name="buyDelivery"][value="all"]');
  if (all) all.checked = true;
  ["buyChSt", "buyChSouv", "buyChTag"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  document.querySelectorAll(".buy-filter-fold[open]").forEach((d) => d.removeAttribute("open"));
  const bar = document.getElementById("buyCategoryBar");
  if (bar) {
    bar.querySelectorAll(".buy-cat-item, .buy-cat-all").forEach((el) => {
      el.checked = false;
      if (el.classList.contains("buy-cat-all")) el.indeterminate = false;
    });
    bar.querySelectorAll(".buy-cat--open").forEach((w) => w.classList.remove("buy-cat--open"));
    bar.querySelectorAll(".buy-cat-trigger").forEach((t) => t.setAttribute("aria-expanded", "false"));
    syncBuyCatTriggerStates();
  }
  applyFiltersAndRender();
}

function wireBuyChrome() {
  $("#buySearch")?.addEventListener("input", () => applyFiltersAndRender());
  $("#buyPriceMin")?.addEventListener("input", () => applyFiltersAndRender());
  $("#buyPriceMax")?.addEventListener("input", () => applyFiltersAndRender());
  $("#buySort")?.addEventListener("change", () => applyFiltersAndRender());
  $("#buyRefreshToolbar")?.addEventListener("click", () => loadListings());
  $("#buyFilterReset")?.addEventListener("click", () => resetBuyFilters());
  $("#buyPriceRefresh")?.addEventListener("click", () => {
    const min = $("#buyPriceMin");
    const max = $("#buyPriceMax");
    if (min) min.value = "";
    if (max) max.value = "";
    applyFiltersAndRender();
  });
}

document.addEventListener("cs2orbitbalance", (ev) => {
  const n = ev.detail && typeof ev.detail.balanceRub === "number" ? ev.detail.balanceRub : null;
  if (currentUser && n !== null) currentUser.balanceRub = n;
});

async function init() {
  focusLotId = new URLSearchParams(location.search).get("lot");
  buildBuyCategoryBar();
  wireBuyCategoryBar();
  wireBuyCategoryRibbonScroll();
  wireBuyChrome();
  await refreshMe();
  await loadListings();
}

init();
