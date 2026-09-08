# MyVideo Payment Prototype

這是一個針對 **MyVideo 付費方案理解與決策流程** 所製作的互動式前端 Prototype。

本 Prototype 的研究核心不是「減少方案」，而是重新整理方案資訊架構，降低新用戶理解成本，並透過互動機制協助使用者做出付費決策。

> Design Statement：**不是減少選擇，而是降低理解選擇的成本。**

## 研究背景

MyVideo 同時存在多種觀看與付費方式，例如：

- 豪華月租（月訂 / 季訂 / 年訂）
- 4 片自由選
- 單片租借
- 數位珍藏
- 儲值金
- 不同會員身分與權益

問題並不是「方案太少」或「功能不足」，而是不同觀看方式、方案週期、單片交易、會員權益與付款工具容易出現在相近的決策情境中，讓新用戶需要自行理解它們之間的關係。

## Prototype 解法

Prototype 重新整理成：

1. **觀看方式**
   - 訂閱
   - 租借
   - 購買

2. **方案**
   - 訂閱：月訂 / 季訂 / 年訂
   - 租借：4 片自由選 / 單片租借
   - 購買：數位珍藏

3. **決策輔助**
   - 依看片頻率與需求進行互動式方案推薦
   - 顯示平均月成本 / 平均單片成本
   - 說明「適合誰」
   - 推薦完成後自動跳轉到對應方案並 Highlight

4. **其他資訊分層**
   - 儲值金：Payment Tool
   - 會員身分：Member Benefit / Account Entitlement

## 專案目的

這個 Prototype 用來驗證以下假設：

- 使用者是否能更快理解「訂閱 / 租借 / 購買」的差異？
- 使用者是否能正確理解豪華月租與 4 片自由選的不同？
- 平均成本與適用情境提示，是否能降低比較成本？
- 互動式推薦是否能提升使用者的付費決策信心？
- 推薦完成後的自動導流，是否能讓 Use Flow 更流暢？

## 使用方式

這是一個純前端靜態 Prototype，不需要後端。

直接開啟：

```text
index.html
```

即可在瀏覽器使用。

部署至 GitHub Pages 後，可透過公開網址 Demo。

## 專案結構

```text
myvideo-payment-prototype/
├── index.html
├── README.md
├── .gitignore
└── docs/
    └── PROJECT_NOTES.md
```

## 技術

- HTML
- CSS
- Vanilla JavaScript
- 無後端
- 無資料庫
- 無外部 API

## 版本定位

目前版本為研究型 MVP Prototype，主要用於：

- Product Research
- UX / IA Proposal
- Internal Demo
- Stakeholder Presentation
- Usability Test

不代表 MyVideo 正式產品設計，也不包含正式交易、付款或會員授權機制。

## 作者與協作方式

此 Prototype 由產品研究者提出研究問題、整理現況問題與設計方向，並透過 AI 協作完成資訊架構討論、互動流程規劃與前端 Prototype 實作。

## 延伸紀錄

完整背景、研究脈絡、設計決策與未來回顧資訊，請見：

[`docs/PROJECT_NOTES.md`](docs/PROJECT_NOTES.md)
