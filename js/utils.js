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
