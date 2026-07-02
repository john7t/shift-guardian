// ============================================
// 全域設定
// ============================================
const GITHUB_OWNER = "YOUR_GITHUB_USERNAME"; // TODO: 改成你的 GitHub 帳號
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

// localStorage / sessionStorage keys
const LS_KEY_EMPLOYEE_SESSION = "sg_employee_session"; // { phone, code }
const SS_KEY_ADMIN_TOKEN = "sg_admin_token";
