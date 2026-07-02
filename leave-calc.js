// ============================================
// 特休天數計算
// ============================================

/**
 * 依勞基法級距計算特休天數
 * @param {number} years 到職滿幾年（可為小數，如 0.5 代表滿半年）
 */
function laborLawLeaveDays(years) {
  if (years < 0.5) return 0;
  if (years < 1) return 3;
  if (years < 2) return 7;
  if (years < 3) return 10;
  if (years < 5) return 14;
  if (years < 10) return 15;
  // 滿10年起，每滿1年多1天，上限30天
  const extra = Math.floor(years - 10) + 1;
  return Math.min(15 + extra, 30);
}

/**
 * 計算某位員工到「今天」為止，已滿的年資（以年為單位，含小數）
 */
function yearsOfService(hireDateStr, today = new Date()) {
  const hire = new Date(hireDateStr);
  const ms = today - hire;
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

/**
 * 計算員工目前的特休總額度
 * @param {string} hireDateStr 到職日 YYYY-MM-DD
 * @param {object} policy { mode: "labor_law"|"fixed", fixedDays: number }
 */
function calcAnnualLeaveQuota(hireDateStr, policy) {
  if (!hireDateStr) return 0;
  if (policy.mode === "fixed") {
    // 固定天數：滿半年後才開始享有（沿用勞基法起算精神），可依需求調整
    const years = yearsOfService(hireDateStr);
    return years >= 0.5 ? policy.fixedDays : 0;
  }
  const years = yearsOfService(hireDateStr);
  return laborLawLeaveDays(years);
}

/**
 * 計算某員工特休已使用天數（只計入 approved 狀態的特休申請）
 */
function calcUsedAnnualLeave(employeeId, leaveRequests) {
  return leaveRequests.filter(
    (r) => r.employeeId === employeeId && r.type === "annual" && r.status === "approved"
  ).length;
}
