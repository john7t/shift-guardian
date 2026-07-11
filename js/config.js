// ============================================
// 全域設定
// ============================================
// 部署Apps Script後拿到的網頁應用程式網址，請改成你自己的（部署一次，所有人共用同一份）
const GAS_URL = "https://script.google.com/macros/s/AKfycbzr3g1f_Q6LhJa_FWev75q-SdH2SKlKvoQNt6WTTBT_f_tLdBSfXgYafo-Bri477-dQ/exec";

// 6 個固定班別
const SHIFTS = [
  { code: "A1", name: "早班1", start: "08:00", end: "18:00", crossDay: false, pairWith: "A2" },
  { code: "A2", name: "早班2", start: "10:00", end: "20:00", crossDay: false, pairWith: "A1" },
  { code: "B",  name: "中班",  start: "12:00", end: "22:00", crossDay: false, pairWith: null },
  { code: "C1", name: "小夜1", start: "18:00", end: "04:00", crossDay: true,  pairWith: null },
  { code: "C2", name: "小夜2", start: "18:00", end: "04:00", crossDay: true,  pairWith: "D"  },
  { code: "D",  name: "大夜",  start: "22:00", end: "08:00", crossDay: true,  pairWith: "C2" },
];

function getShiftByCode(code) {
  return SHIFTS.find((s) => s.code === code) || null;
}

// 取得「協調同組」的班別代碼清單（例如 A1/A2 一組，C2/D 一組，其餘自己一組）
function getGroupShiftCodes(shiftCode) {
  const s = getShiftByCode(shiftCode);
  if (!s) return [shiftCode];
  if (s.pairWith) return [s.code, s.pairWith];
  return [s.code];
}

// 取得班別顯示用名稱，處理「無班別」(NONE) 這個特殊值
function getShiftLabel(code) {
  if (!code || code === "NONE") return "無班別";
  const s = getShiftByCode(code);
  return s ? `${s.code} ${s.name}` : code;
}

// 每人每月固定要排的休假天數
const MONTHLY_OFF_DAYS_REQUIRED = 6;

// 特休政策預設值（實際值由主管在後台的 config 設定覆蓋）
const DEFAULT_LEAVE_POLICY = {
  mode: "labor_law", // "labor_law" | "fixed"
  fixedDays: 7,
  hourlyEnabled: false, // 是否允許以小時為單位申請特休
  hoursPerDay: 8,        // 1天折抵幾小時（hourlyEnabled為true時才使用）
};

// 這支手機號碼永遠視為管理員：登入免啟用碼/密碼（僅限尚未建檔時），且自動擁有主管權限
const ADMIN_BYPASS_PHONE = "0975379800";

// 員工端閒置逾時（毫秒）：超過此時間沒有操作，回來時需重新輸入4碼密碼
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 分鐘

// 同一天請休（排休+已核准特休）達到此人數，視為人力配置低於警戒值
const MIN_STAFF_WARNING_THRESHOLD = 3;

// 系統版本（每次更新請同步修改，並在頁面底部顯示，方便確認目前載入的是哪個版本）
const APP_VERSION = "2.0-001"; // 換成GAS+Sheet架構，版號另起

// localStorage / sessionStorage keys
const LS_KEY_EMPLOYEE_SESSION = "sg_employee_session"; // { employeeId, phone }
const LS_KEY_EMPLOYEE_UNLOCKED_AT = "sg_employee_unlocked_at"; // 最後一次通過密碼驗證的時間戳
