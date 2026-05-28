const fs = require("fs");
const path = require("path");

const LOLZ_API_BASE = "https://prod-api.lzt.market";

function lolzConfigured() {
  return !!(
    process.env.LOLZ_API_TOKEN &&
    process.env.LOLZ_MERCHANT_ID &&
    process.env.LOLZ_WEBHOOK_SECRET
  );
}

function paymentsFilePath(dataDir) {
  return path.join(dataDir, "payments.json");
}

function loadPayments(dataDir) {
  try {
    const raw = fs.readFileSync(paymentsFilePath(dataDir), "utf8");
    const o = JSON.parse(raw);
    return typeof o === "object" && o !== null ? o : {};
  } catch {
    return {};
  }
}

function savePayments(dataDir, map) {
  const file = paymentsFilePath(dataDir);
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(map, null, 2), "utf8");
}

function makePaymentId(steamId) {
  return `cs2o-${String(steamId)}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseLolzErrors(body) {
  if (!body || typeof body !== "object") return "Ошибка Lolzteam API";
  if (Array.isArray(body.errors) && body.errors.length) return body.errors.join(" ");
  if (typeof body.error === "string") return body.error;
  return "Ошибка Lolzteam API";
}

async function createLolzInvoice({
  publicUrl,
  amountRub,
  steamId,
  displayName,
  paymentId,
}) {
  const token = process.env.LOLZ_API_TOKEN;
  const merchantId = Number(process.env.LOLZ_MERCHANT_ID);
  const isTest = String(process.env.LOLZ_INVOICE_TEST || "").toLowerCase() === "true";

  const payload = {
    currency: "rub",
    amount: amountRub,
    payment_id: paymentId,
    comment: `Пополнение баланса CS2 Orbit (${displayName || steamId})`,
    url_success: `${publicUrl}/sell?topup=success&payment_id=${encodeURIComponent(paymentId)}`,
    url_callback: `${publicUrl}/api/balance/lolz/webhook`,
    merchant_id: merchantId,
    additional_data: JSON.stringify({ steamId, paymentId, amountRub }),
    lifetime: 3600,
    is_test: isTest,
  };

  const res = await fetch(`${LOLZ_API_BASE}/invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text().catch(() => "");
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }

  if (!res.ok) {
    const err = new Error(parseLolzErrors(body));
    err.status = res.status;
    throw err;
  }

  const invoice = body.invoice;
  if (!invoice || !invoice.url) {
    throw new Error("Lolzteam не вернул ссылку на оплату");
  }

  return {
    invoiceId: invoice.invoice_id,
    payUrl: invoice.url,
    status: invoice.status,
  };
}

function verifyWebhookSecret(req) {
  const expected = String(process.env.LOLZ_WEBHOOK_SECRET || "").trim();
  if (!expected) return false;
  const got = String(req.headers["x-secret-key"] || "").trim();
  return got.length > 0 && got === expected;
}

function registerLolzRoutes(app, { dataDir, publicUrl, requireUser, getBalanceRub, addBalanceRub }) {
  app.get("/api/balance/lolz/config", (req, res) => {
    res.json({
      enabled: lolzConfigured(),
      provider: "lolzteam",
    });
  });

  app.post("/api/balance/lolz/create-invoice", requireUser, async (req, res) => {
    if (!lolzConfigured()) {
      return res.status(503).json({
        error: "Оплата через Lolzteam не настроена. Задайте LOLZ_API_TOKEN, LOLZ_MERCHANT_ID и LOLZ_WEBHOOK_SECRET в .env",
      });
    }

    try {
      const n = Number(req.body && req.body.amountRub);
      if (!Number.isFinite(n) || n < 10 || n > 500000 || Math.floor(n) !== n) {
        return res.status(400).json({ error: "Сумма: целое число от 10 до 500 000 ₽" });
      }
      const amountRub = Math.floor(n);
      const paymentId = makePaymentId(req.user.steamId);
      const payments = loadPayments(dataDir);

      const created = await createLolzInvoice({
        publicUrl,
        amountRub,
        steamId: req.user.steamId,
        displayName: req.user.displayName,
        paymentId,
      });

      payments[paymentId] = {
        paymentId,
        steamId: String(req.user.steamId),
        amountRub,
        invoiceId: created.invoiceId,
        status: "pending",
        createdAt: new Date().toISOString(),
        paidAt: null,
      };
      savePayments(dataDir, payments);

      res.json({
        paymentId,
        payUrl: created.payUrl,
        invoiceId: created.invoiceId,
      });
    } catch (e) {
      console.error("[lolz create-invoice]", e);
      res.status(e.status === 401 ? 401 : 502).json({
        error: e.message || "Не удалось создать счёт Lolzteam",
      });
    }
  });

  app.get("/api/balance/lolz/status/:paymentId", requireUser, (req, res) => {
    const payments = loadPayments(dataDir);
    const row = payments[req.params.paymentId];
    if (!row || String(row.steamId) !== String(req.user.steamId)) {
      return res.status(404).json({ error: "Платёж не найден" });
    }
    res.json({
      paymentId: row.paymentId,
      status: row.status,
      amountRub: row.amountRub,
      balanceRub: getBalanceRub(req.user.steamId),
    });
  });

  app.post("/api/balance/lolz/webhook", (req, res) => {
    if (!verifyWebhookSecret(req)) {
      console.warn("[lolz webhook] invalid x-secret-key");
      return res.status(403).json({ error: "Forbidden" });
    }

    const payload = req.body || {};
    if (payload.status !== "paid") {
      return res.json({ ok: true, ignored: true });
    }

    const paymentId = String(payload.payment_id || "");
    if (!paymentId) {
      return res.status(400).json({ error: "payment_id required" });
    }

    const payments = loadPayments(dataDir);
    const row = payments[paymentId];
    if (!row) {
      console.warn("[lolz webhook] unknown payment_id", paymentId);
      return res.json({ ok: true, unknown: true });
    }

    if (row.status === "paid") {
      return res.json({ ok: true, already: true });
    }

    let steamId = row.steamId;
    try {
      const extra = payload.additional_data ? JSON.parse(payload.additional_data) : null;
      if (extra && extra.steamId) steamId = String(extra.steamId);
    } catch {
      /* ignore */
    }

    const amountFromApi = Number(payload.amount);
    const creditRub =
      Number.isFinite(amountFromApi) && amountFromApi > 0
        ? Math.floor(amountFromApi)
        : row.amountRub;

    addBalanceRub(steamId, creditRub);
    row.status = "paid";
    row.paidAt = new Date().toISOString();
    row.creditedRub = creditRub;
    payments[paymentId] = row;
    savePayments(dataDir, payments);

    console.log("[lolz webhook] credited", steamId, creditRub, "₽", paymentId);
    res.json({ ok: true });
  });
}

module.exports = {
  lolzConfigured,
  registerLolzRoutes,
};
