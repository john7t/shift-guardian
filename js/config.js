// ============================================
// 全域設定
// ============================================
const GITHUB_OWNER = "john7t"; // TODO: 改成你的 GitHub 帳號
const REPO_NAME = "shift-guardian";          // repo 名稱
const REPO_BRANCH = "main";

const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${REPO_NAME}/contents`;
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${REPO_NAME}/${REPO_BRANCH}`;

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

// 每人每月固定要排的休假天數
const MONTHLY_OFF_DAYS_REQUIRED = 6;

// 特休政策預設值（實際值由主管在後台的 config.json 設定覆蓋）
const DEFAULT_LEAVE_POLICY = {
  mode: "labor_law", // "labor_law" | "fixed"
  fixedDays: 7,
};

// 這支手機號碼永遠視為管理員：登入免啟用碼/密碼，且自動擁有主管權限
const ADMIN_BYPASS_PHONE = "0975379800";

// 員工端閒置逾時（毫秒）：超過此時間沒有操作，回來時需重新輸入4碼密碼
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 分鐘

// 同一天請休（排休+已核准特休）達到此人數，視為人力配置低於警戒值
const MIN_STAFF_WARNING_THRESHOLD = 3;

// 系統版本（每次更新請同步修改，並在頁面底部顯示，方便確認目前載入的是哪個版本）
const APP_VERSION = "1.0-005";

// localStorage / sessionStorage keys
const LS_KEY_EMPLOYEE_SESSION = "sg_employee_session"; // { employeeId, phone }
const LS_KEY_EMPLOYEE_UNLOCKED_AT = "sg_employee_unlocked_at"; // 最後一次通過密碼驗證的時間戳
const LS_KEY_ADMIN_TOKEN = "sg_admin_token_v2"; // 存在本機，每位主管各自在自己裝置輸入
const LS_KEY_PENDING_PREFIX = "sg_pending_"; // + employeeId，暫存尚未經主管核准的送出內容
