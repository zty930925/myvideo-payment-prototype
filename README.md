# MyVideo 付費方案決策 Prototype — Full-stack v3

這是一個從 UX / Product Research Prototype 逐步發展而來的 full-stack MVP。目標是驗證：使用者能否用自然語言或片單圖片，快速理解「目前權益能不能看某部作品」以及「作品目前有哪些觀看方式」。

> 重要：目前作品、價格、授權與會員權益資料皆為 **Mock Data**，不代表 MyVideo 即時真實資料。

## 已完成

- 保留既有 MyVideo 方案介紹與決策 Prototype UI
- 右下角 作品詳情頁觀看決策模組聊天室
- 先詢問使用者目前觀看權益
- 真實 `POST /api/chat` API request
- Node.js 原生 HTTP backend（零外部套件）
- Mock 作品片庫與方案資料
- 會員權益判斷服務
- 自然語言文字查詢
- 圖片上傳 / 貼上流程：圖片會真的送到 backend
- 圖片辨識尚未接 Vision，避免假裝已辨識

## 快速啟動

需要 Node.js 18 以上。

```bash
npm start
```

瀏覽：

```text
http://localhost:3000
```

健康檢查：

```text
http://localhost:3000/api/health
```

## 可測試問題

選擇一個會員權益後，可以輸入：

```text
蜘蛛人：無家日可以看嗎？
今晚想看的電影我可以直接看嗎？
自由選示意電影可以用 4 片自由選嗎？
未上架示意作品有嗎？
為什麼有訂閱還要另外付費？
```

## 專案結構

```text
.
├── index.html
├── config.js
├── server.js
├── package.json
├── data/
│   ├── titles.json
│   ├── plans.json
│   └── faq.json
├── services/
│   ├── catalogService.js
│   ├── entitlementService.js
│   └── chatService.js
└── docs/
    ├── architecture.md
    └── api.md
```

## GitHub Pages 與 Backend

GitHub Pages 只能部署靜態前端，不能常駐執行 Node.js backend。

本 repo 可以完整放在 GitHub，但如果前端繼續使用 GitHub Pages，需要另外部署 backend，然後將 `config.js`：

```js
window.MYVIDEO_API_BASE = "/api";
```

改成例如：

```js
window.MYVIDEO_API_BASE = "https://your-backend.example.com/api";
```

如果直接執行 `npm start`，Node.js server 會同時提供前端與 backend，因此 `/api` 不需要修改。

## 下一階段

- Vision API：從片單截圖抽出作品名稱
- 真實內容 API / DB：取代 `titles.json`
- 真實會員登入與 entitlement API
- RAG：只放方案規則、FAQ、說明文件等文字知識
- LLM：只負責理解問題與組織語言，觀看權益仍由 backend tool/data 決定


## 2026-10 plan-model update

The prototype now distinguishes two subscription families based on the current MyVideo plan page supplied for this iteration:

- 豪華月租: annual NT$1,780 / 365 days, quarterly NT$550 / 90 days, monthly NT$250 / 30 days.
- 頻道訂閱: annual NT$1,320 / 365 days, quarterly NT$360 / 90 days, monthly NT$128 / 30 days.
- 4 片自由選 remains modeled as rental credit, not as the same entitlement as the subscription families.
- MyVideo 儲值金 remains a payment tool, not a viewing entitlement.

The mock entitlement service now distinguishes VOD content (`luxury`) from channel content (`channel`).


## v3 UX 收斂

本版將聊天機器人從主要使用流程移除。研究假設改為：使用者有明確觀看目標時，最自然的路徑是「搜尋作品 → 進入作品詳情頁 → 直接判斷目前權益是否可看」。

因此作品詳情頁 Prototype 現在會：

- 直接讀取／模擬目前帳號權益。
- 優先回答「現在能不能看」。
- 僅呈現該作品實際支援的觀看方式。
- 已有可用權益時優先「立即觀看」，避免重複付費。
- 不因使用者持有 4 片自由選，就自行推定所有租借作品都可使用。
- 以《蜘蛛人：無家日》作為作品詳情頁介面情境示意；價格與授權仍須以 MyVideo 即時頁面為準。

Backend / Mock API 程式仍保留在 repository 中，方便未來要做權益查詢或資料串接時繼續使用，但 v3 的主要 UX 不依賴聊天機器人。
