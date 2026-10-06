# Architecture

```text
Browser / GitHub Pages
        |
        | POST /api/chat (application/json)
        v
Node.js native HTTP backend
        |
        +--> catalogService --> data/titles.json
        |
        +--> entitlementService --> rights decision
        |
        +--> chatService --> polite response composition
```

## MVP boundaries

- The API request is real.
- The backend and entitlement decision are real code.
- Title, plan and entitlement data are mock data.
- Image bytes are really uploaded to the backend, but no OCR / Vision model is used yet.
- No response should be interpreted as current MyVideo availability or licensing information.

## Upgrade path

1. Replace `data/titles.json` with a real content API or database.
2. Replace plan mock data with authenticated member entitlements.
3. Add Vision/OCR to extract titles from uploaded screenshots.
4. Add an LLM only after tool/data results are available; the model should phrase results, not invent rights.
