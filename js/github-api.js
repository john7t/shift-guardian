// ============================================
// GitHub Contents API 封裝
// 讀取：一律用公開的 raw.githubusercontent.com（不需要 token，任何人都能查看）
// 寫入：一律需要主管的 Personal Access Token（僅限 contents 讀寫權限）
// ============================================

/**
 * 讀取 Repo 中的 JSON 檔案（公開讀取，任何人都可以）
 * @param {string} path 例如 "data/employees.json"
 * @returns {Promise<any>} 解析後的 JSON 內容；檔案不存在則回傳 null
 */
async function readJSON(path) {
  const url = `${GITHUB_RAW_BASE}/${path}?t=${Date.now()}`; // 避免快取
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`讀取 ${path} 失敗：${res.status}`);
  return res.json();
}

/**
 * 寫入 Repo 中的 JSON 檔案（需要主管 Token）
 * @param {string} path 例如 "data/employees.json"
 * @param {any} data 要寫入的物件，會自動 JSON.stringify
 * @param {string} message commit message
 * @param {string} token 主管的 GitHub Personal Access Token
 */
async function writeJSON(path, data, message, token) {
  if (!token) throw new Error("缺少 GitHub Token，請先在主管後台登入");

  const apiUrl = `${GITHUB_API_BASE}/${path}`;

  // 1. 先取得目前檔案的 sha（若存在），更新既有檔案時 GitHub API 需要這個值
  let sha = undefined;
  const getRes = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (getRes.ok) {
    const getData = await getRes.json();
    sha = getData.sha;
  } else if (getRes.status !== 404) {
    const errBody = await getRes.text();
    throw new Error(`讀取現有檔案失敗：${getRes.status} ${errBody}`);
  }

  // 2. 寫入（新增或更新）
  const content = b64EncodeUnicode(JSON.stringify(data, null, 2));
  const body = {
    message,
    content,
    branch: REPO_BRANCH,
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const errBody = await putRes.text();
    // 409 通常代表 sha 過期（有人同時寫入），需要重試
    throw new Error(`寫入 ${path} 失敗：${putRes.status} ${errBody}`);
  }

  return putRes.json();
}

/**
 * 驗證Token是否有效、且對這個repo擁有寫入(push)權限
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
async function validateAdminToken(token) {
  if (!token || token.trim().length < 10) {
    return { ok: false, reason: "Token 格式看起來不完整" };
  }
  let res;
  try {
    res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${REPO_NAME}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
  } catch (e) {
    return { ok: false, reason: "無法連線到 GitHub，請檢查網路" };
  }

  if (res.status === 401) {
    return { ok: false, reason: "Token 無效或已過期（401 Bad credentials）" };
  }
  if (res.status === 404) {
    return { ok: false, reason: `找不到 repo ${GITHUB_OWNER}/${REPO_NAME}，請確認 config.js 設定或 Token 的 repository access` };
  }
  if (!res.ok) {
    return { ok: false, reason: `驗證失敗（${res.status}）` };
  }

  const info = await res.json();
  if (!info.permissions || !info.permissions.push) {
    return { ok: false, reason: "此 Token 沒有寫入(push)權限，請確認 Fine-grained token 的 Contents 設定為 Read and write" };
  }
  return { ok: true };
}

/**
 * 帶重試機制的寫入（處理並發寫入衝突：sha 過期時重新抓一次再試一次）
 */
async function writeJSONWithRetry(path, data, message, token, maxRetry = 2) {
  let lastErr;
  for (let i = 0; i <= maxRetry; i++) {
    try {
      return await writeJSON(path, data, message, token);
    } catch (err) {
      lastErr = err;
      if (String(err.message).includes("409") && i < maxRetry) {
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// 支援中文的 base64 編碼
function b64EncodeUnicode(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode("0x" + p1)
    )
  );
}
