(function () {
  let lolzTopupEnabled = false;

  function formatRub(n) {
    const x = Math.max(0, Math.floor(Number(n) || 0));
    return new Intl.NumberFormat("ru-RU").format(x) + "\u00A0₽";
  }

  function updateBalanceDisplay(user) {
    const el = document.getElementById("userBalanceValue");
    if (!el) return;
    const v = user && typeof user.balanceRub === "number" ? user.balanceRub : 0;
    el.textContent = formatRub(v);
    if (user && typeof user.lolzTopup === "boolean") {
      lolzTopupEnabled = user.lolzTopup;
      syncTopupModalCopy();
    }
  }

  function syncTopupModalCopy() {
    const hint = document.getElementById("topupHint");
    const submit = document.getElementById("topupSubmitBtn");
    if (hint) {
      hint.textContent = lolzTopupEnabled
        ? "Оплата через Lolzteam (карта, СБП и др.). После оплаты баланс зачислится автоматически."
        : "Демо-режим: сумма зачисляется сразу без оплаты (на сервере не настроен Lolzteam).";
    }
    if (submit) {
      submit.textContent = lolzTopupEnabled ? "Оплатить через Lolz" : "Зачислить (демо)";
    }
  }

  async function refreshMeBalance() {
    try {
      const r = await fetch("/api/me", { credentials: "same-origin" });
      const data = await r.json();
      if (data.user) {
        updateBalanceDisplay(data.user);
        window.dispatchEvent(
          new CustomEvent("cs2orbitbalance", { detail: { balanceRub: data.user.balanceRub } })
        );
      }
    } catch {
      /* ignore */
    }
  }

  async function pollPaymentStatus(paymentId) {
    for (let i = 0; i < 12; i += 1) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const r = await fetch(`/api/balance/lolz/status/${encodeURIComponent(paymentId)}`, {
          credentials: "same-origin",
        });
        if (!r.ok) continue;
        const data = await r.json();
        if (data.status === "paid") {
          updateBalanceDisplay({ balanceRub: data.balanceRub, lolzTopup: true });
          window.dispatchEvent(
            new CustomEvent("cs2orbitbalance", { detail: { balanceRub: data.balanceRub } })
          );
          return true;
        }
      } catch {
        /* retry */
      }
    }
    return false;
  }

  function handleTopupReturn() {
    const params = new URLSearchParams(location.search);
    if (params.get("topup") !== "success") return;
    const paymentId = params.get("payment_id");
    params.delete("topup");
    params.delete("payment_id");
    const qs = params.toString();
    const clean = location.pathname + (qs ? `?${qs}` : "");
    history.replaceState({}, "", clean);

    (async () => {
      if (paymentId) {
        const ok = await pollPaymentStatus(paymentId);
        if (ok) {
          alert("Оплата прошла успешно. Баланс обновлён.");
          return;
        }
      }
      await refreshMeBalance();
      alert(
        "Вы вернулись с оплаты. Если деньги списались, баланс обновится в течение минуты — обновите страницу."
      );
    })();
  }

  async function loadLolzConfig() {
    try {
      const r = await fetch("/api/balance/lolz/config", { credentials: "same-origin" });
      const data = await r.json();
      if (typeof data.enabled === "boolean") {
        lolzTopupEnabled = data.enabled;
        syncTopupModalCopy();
      }
      return data;
    } catch {
      return null;
    }
  }

  function initTopup() {
    const btn = document.getElementById("btnBalanceTopup");
    const dlg = document.getElementById("modalTopup");
    const cancel = document.getElementById("modalTopupCancel");
    const form = document.getElementById("formTopup");
    if (!btn || !dlg || !form) return;

    loadLolzConfig();
    syncTopupModalCopy();
    handleTopupReturn();

    btn.addEventListener("click", async () => {
      const cfg = await loadLolzConfig();
      if (cfg && !cfg.enabled && Array.isArray(cfg.missingKeys) && cfg.missingKeys.length) {
        console.warn("[topup] Lolz не настроен на сервере:", cfg.missingKeys.join(", "));
      }
      dlg.showModal();
    });
    if (cancel) cancel.addEventListener("click", () => dlg.close());

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const amountRub = Number(fd.get("amount"));
      const min = lolzTopupEnabled ? 10 : 1;
      if (!Number.isFinite(amountRub) || amountRub < min || amountRub > 500000) {
        alert(`Укажите сумму от ${min} до 500 000 ₽`);
        return;
      }
      const submitBtn = document.getElementById("topupSubmitBtn");
      if (submitBtn) submitBtn.disabled = true;

      try {
        const endpoint = lolzTopupEnabled ? "/api/balance/lolz/create-invoice" : "/api/balance/top-up";
        const r = await fetch(endpoint, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountRub: Math.floor(amountRub) }),
        });
        const raw = await r.text();
        let data = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = {};
        }
        if (!r.ok) {
          const hint =
            data.error ||
            (r.status === 404 && raw.includes("Cannot POST")
              ? "Сервер без маршрута пополнения — перезапустите Node (npm start)."
              : null) ||
            (raw && raw.length < 200 ? raw.trim() : null) ||
            `Ошибка ${r.status}`;
          throw new Error(hint);
        }

        if (lolzTopupEnabled && data.payUrl) {
          dlg.close();
          window.location.href = data.payUrl;
          return;
        }

        updateBalanceDisplay({ balanceRub: data.balanceRub, lolzTopup: false });
        window.dispatchEvent(
          new CustomEvent("cs2orbitbalance", { detail: { balanceRub: data.balanceRub } })
        );
        dlg.close();
      } catch (e) {
        alert(e.message);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  window.CS2OrbitAuthHeader = { updateBalanceDisplay, refreshMeBalance };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTopup);
  } else {
    initTopup();
  }
})();
