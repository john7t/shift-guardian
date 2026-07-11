// ============================================
// GAS + Google Sheet 資料存取層
// ============================================

async function gasGet(params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GAS_URL}?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`讀取失敗：${res.status}`);
  const data = await res.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

async function gasPost(payload) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify(payload), // 故意不設定Content-Type，瀏覽器預設text/plain可避開CORS preflight
  });
  if (!res.ok) throw new Error(`寫入失敗：${res.status}`);
  const data = await res.json();
  if (data && data.error) throw new Error(data.error === "forbidden" ? "沒有權限執行此操作" : data.error);
  return data;
}

// ---------- 讀取 ----------
function fetchEmployees() {
  return gasGet({ path: "employees" }).catch(() => []);
}
function fetchConfig() {
  return gasGet({ path: "config" }).catch(() => null);
}
function fetchSchedule(month) {
  return gasGet({ path: "schedule", month }).catch(() => null);
}
function fetchScheduleList() {
  return gasGet({ path: "schedule-list" }).catch(() => []);
}
function fetchBackupsList() {
  return gasGet({ path: "backups-list" }).catch(() => []);
}
function fetchBackup(name) {
  return gasGet({ path: "backup", name }).catch(() => null);
}

// ---------- 員工 ----------
function upsertEmployee(employee, actingEmployeeId) {
  return gasPost({ path: "employee_upsert", employee, actingEmployeeId });
}
function activateEmployee(employeeId, actingEmployeeId) {
  return gasPost({ path: "employee_activate", employeeId, actingEmployeeId });
}
function deleteEmployeeRemote(employeeId, actingEmployeeId) {
  return gasPost({ path: "employee_delete", employeeId, actingEmployeeId });
}
function replaceAllEmployees(employees, actingEmployeeId) {
  return gasPost({ path: "employees_replace_all", employees, actingEmployeeId });
}

// ---------- 系統設定 ----------
function saveConfigRemote(data, actingEmployeeId) {
  return gasPost({ path: "config", data, actingEmployeeId });
}

// ---------- 排班表 ----------
function setOffDaysRemote(month, employeeId, dates, actingEmployeeId) {
  return gasPost({ path: "schedule", month, action: "set_off_days", employeeId, dates, actingEmployeeId });
}
function submitLeaveRequestRemote(month, request, actingEmployeeId) {
  return gasPost({ path: "schedule", month, action: "submit_leave_request", request, actingEmployeeId });
}
function decideLeaveRequestRemote(month, requestId, decision, actingEmployeeId) {
  return gasPost({ path: "schedule", month, action: "decide_leave_request", requestId, decision, actingEmployeeId });
}
function addSupportRemote(month, support, actingEmployeeId) {
  return gasPost({ path: "schedule", month, action: "add_support", support, actingEmployeeId });
}
function removeSupportRemote(month, supportId, actingEmployeeId) {
  return gasPost({ path: "schedule", month, action: "remove_support", supportId, actingEmployeeId });
}
function lockMonthRemote(month, actingEmployeeId) {
  return gasPost({ path: "schedule_lock", month, actingEmployeeId });
}
function unlockMonthRemote(month, actingEmployeeId) {
  return gasPost({ path: "schedule_unlock", month, actingEmployeeId });
}

// ---------- 密碼重設 ----------
function requestPasswordReset(employeeId, newPasswordHash) {
  return gasPost({ path: "password_reset_request", employeeId, newPasswordHash });
}
function approvePasswordReset(employeeId, actingEmployeeId) {
  return gasPost({ path: "password_reset_approve", employeeId, actingEmployeeId });
}

// ---------- 備份 ----------
function saveBackupRemote(name, data) {
  return gasPost({ path: "backup", name, data });
}
function restoreBackupRemote(data, actingEmployeeId) {
  return gasPost({ path: "restore_backup", data, actingEmployeeId });
}
