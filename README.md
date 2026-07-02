# Shift Guardian｜24小時店家排班系統

前端純靜態網頁（GitHub Pages），以 GitHub Repo 當資料庫。
只有主管持有 GitHub Token 可以寫入資料；員工端所有異動都是「產生連結 → 傳 LINE → 主管審核後才真正寫入」。

## 一、建立 GitHub Repo

1. 到 GitHub 建立一個新的 **public** repo，名稱建議 `shift-guardian`
   （若你要用別的名稱，記得改 `js/config.js` 裡的 `REPO_NAME`）
2. 把這個資料夾（`shift-guardian/`）裡的所有檔案上傳 / push 到這個 repo 的 `main` 分支
3. 到 repo 的 **Settings → Pages**，Source 選擇 `main` 分支、根目錄 `/ (root)`，儲存後會產生一個網址，例如：
   `https://你的帳號.github.io/shift-guardian/`

> 為什麼要 public？因為公開月曆（`index.html`）需要讓任何人不登入就能查看班表，
> 而 GitHub Pages 要對外公開網頁，repo 必須是 public（除非升級付費方案）。
> 這代表班表資料（姓名、代號、休假日）在網路上是公開可讀的，請留意個資揭露程度是否符合你的需求。

## 二、修改設定檔

打開 `js/config.js`，把這一行改成你自己的 GitHub 帳號：

```js
const GITHUB_OWNER = "YOUR_GITHUB_USERNAME"; // 改成你的 GitHub 帳號
const REPO_NAME = "shift-guardian";          // 如果你的 repo 名稱不同，這裡也要改
```

## 三、產生主管用的 GitHub Token

1. 到 GitHub → 右上角頭像 → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. 建立新 Token，**Repository access** 選「Only select repositories」→ 選你剛建立的 `shift-guardian`
3. **Permissions** 只勾選 **Contents: Read and write**（其他一律不給，最小權限原則）
4. 設定過期時間（建議 90 天，到期前記得換新的）
5. 產生後複製這組 Token，妥善保管，之後在「主管後台」（`admin.html`）登入時要輸入這組 Token

⚠️ 這組 Token 只會存在主管使用的瀏覽器（`sessionStorage`，關閉分頁就清除），不會上傳到任何地方，
但因為擁有寫入權限，**請勿分享給他人，也不要在公用電腦上登入**。

## 四、開始使用

- **公開月曆**：`index.html` — 任何人打開都能看，不需登入
- **員工登入**：`employee.html` — 員工用手機號碼+主管給的啟用碼登入，排休、申請特休
- **主管後台**：`admin.html` — 輸入 Token 登入，開通新員工、審核申請、鎖定月份、設定特休政策

### 開通第一位員工的流程
1. 主管打開 `admin.html` 輸入 Token 登入
2. 在「開通新員工」輸入該員工手機號碼 → 產生啟用碼 → 按「用 LINE 傳送給員工」
3. 員工打開 `employee.html`，輸入手機+收到的啟用碼登入
4. 首次登入會要求填寫姓名、代號、班別、到職日 → 送出後會跳出 LINE，把確認連結傳給主管
5. 主管點開該連結（會自動導到 `admin.html?apply=...`），確認資料後按「核准並寫入」，該員工才正式生效

## 五、資料檔案結構

```
data/
  employees.json             員工主檔（姓名、手機、啟用碼、班別、到職日、狀態）
  config.json                商店設定、特休政策（固定天數 / 依勞基法）
  schedule-YYYY-MM.json      每月排休與特休申請紀錄（自動依需要建立）
```

`schedule-YYYY-MM.json` 範例：

```json
{
  "month": "2026-08",
  "status": "draft",
  "lockedAt": null,
  "days": {
    "emp_xxxxx": ["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-11", "2026-08-12", "2026-08-25"]
  },
  "specialLeave": [
    {
      "id": "req_xxxxx",
      "employeeId": "emp_xxxxx",
      "date": "2026-08-20",
      "type": "annual",
      "status": "approved",
      "requestedAt": "2026-07-01T10:00:00.000Z",
      "decidedAt": "2026-07-01T11:00:00.000Z"
    }
  ]
}
```

## 六、班別設定（已寫死在 `js/config.js`）

| 代號 | 名稱 | 時間 | 協調配對 |
|---|---|---|---|
| A1 | 早班1 | 08:00–18:00 | ↔ A2 |
| A2 | 早班2 | 10:00–20:00 | ↔ A1 |
| B  | 中班  | 12:00–22:00 | 無 |
| C1 | 小夜1 | 18:00–次日04:00 | 無 |
| C2 | 小夜2 | 18:00–次日04:00 | ↔ D |
| D  | 大夜  | 22:00–次日08:00 | ↔ C2 |

如需調整班別時間或新增班別，修改 `js/config.js` 內的 `SHIFTS` 陣列即可。

## 七、已知限制 / 之後可以強化的地方

- 目前「協調對象撞期」只在員工排休畫面用藍色框提示，系統不會擋申請（符合你原本「先不阻擋、大家自己看空檔協調」的需求）
- 沒有做「同時多人送出申請」的鎖定機制，若主管同時處理多筆連結，寫入時有極小機率因版本衝突需要重新整理再試一次（程式已內建自動重試）
- Repo 目前需為 public，資料公開可讀，若之後要做成 private 需另外導入付費方案或改用其他後端
