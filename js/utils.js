// ============================================
// 共用工具
// ============================================

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function currentMonthKey(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function daysInMonth(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function monthLabel(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return `${y} 年 ${m} 月`;
}

// 產生 6 碼啟用碼，格式 xxx-xxx
function generateActivationCode() {
  const n = () => Math.floor(Math.random() * 1000);
  return `${pad2(n() % 100)}${n() % 10}-${pad2(n() % 100)}${n() % 10}`.slice(0, 7);
}

// 產生簡單的員工 ID
function generateEmployeeId() {
  return "emp_" + Math.random().toString(36).slice(2, 10);
}

function generateRequestId() {
  return "req_" + Math.random().toString(36).slice(2, 10);
}

// 將物件編碼進 URL 參數（給「產生連結傳LINE給主管」使用）
function encodePayload(obj) {
  const json = JSON.stringify(obj);
  return encodeURIComponent(b64EncodeUnicode(json));
}

function decodePayload(str) {
  const json = decodeURIComponent(
    atob(decodeURIComponent(str))
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(decodeURIComponent(json));
}

// 簡易 toast 提示
function toast(msg, type = "info") {
  let el = document.getElementById("sg-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "sg-toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `sg-toast show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 3200);
}

// 產生 LINE 分享連結（跳出LINE選好友畫面）
function lineShareUrl(text) {
  return `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
}

// 產生 QRCode（依賴 qrcode.js CDN，見 HTML 內引入）
function renderQRCode(elementId, text) {
  const el = document.getElementById(elementId);
  el.innerHTML = "";
  // eslint-disable-next-line no-undef
  new QRCode(el, { text, width: 180, height: 180 });
}

// ---------- 密碼雜湊（4碼密碼不存明碼，改存 SHA-256 雜湊） ----------
async function hashText(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- 台北時區（UTC+8）時間格式化 ----------
function taipeiTimestampForFilename(d = new Date()) {
  // 回傳可用於檔名的字串，例如 2026-07-05_08-47-37（台北時間）
  const parts = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}_${get("hour")}-${get("minute")}-${get("second")}`;
}

function taipeiTimeDisplay(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false });
}

// ---------- 按鈕「寫入中」狀態（取代單純toast，讓按鈕本身反映狀態） ----------
function setButtonLoading(btn, loadingText = "處理中…") {
  if (!btn) return;
  btn.dataset.originalText = btn.textContent;
  btn.disabled = true;
  btn.classList.add("is-loading");
  btn.innerHTML = `<span class="spinner"></span>${loadingText}`;
}
function clearButtonLoading(btn) {
  if (!btn) return;
  btn.disabled = false;
  btn.classList.remove("is-loading");
  btn.textContent = btn.dataset.originalText || btn.textContent;
}

// ---------- 按鈕下方紅字/綠字提示（取代 toast 彈窗） ----------
function showInline(elementId, message, type = "error") {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `inline-alert ${type}`;
}

// ---------- 二次確認按鈕（第一次點顯示「確定？」，第二次點才真正執行） ----------
function confirmButtonClick(btn, actionFn, confirmLabel = "確定？再按一次") {
  if (btn.dataset.confirming === "1") {
    btn.dataset.confirming = "0";
    btn.classList.remove("btn-confirming");
    btn.textContent = btn.dataset.originalLabel || btn.textContent;
    actionFn();
  } else {
    btn.dataset.confirming = "1";
    btn.dataset.originalLabel = btn.textContent;
    btn.classList.add("btn-confirming");
    btn.textContent = confirmLabel;
    setTimeout(() => {
      if (btn.dataset.confirming === "1") {
        btn.dataset.confirming = "0";
        btn.classList.remove("btn-confirming");
        btn.textContent = btn.dataset.originalLabel;
      }
    }, 4000);
  }
}

// ---------- 置頂列滾動縮小 50% ----------
function initTopbarShrink() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  window.addEventListener("scroll", () => {
    topbar.classList.toggle("shrink", window.scrollY > 30);
  });
}

