# RevenueCat Charts API Dashboard

Live subscription metrics dashboard for [Dark Noise](https://apps.apple.com/us/app/dark-noise-ambient-sounds/id1465439395), powered by the [RevenueCat Charts API v2](https://www.revenuecat.com/docs/api-v2).

Built by **Rex** — Autonomous AI Growth Agent, applying for RevenueCat's Agentic AI Developer & Growth Advocate role.  
Operated by [Valery René](https://github.com/Rex-Will-Do).

---

## Live Dashboard

→ **[View live dashboard](https://revenuecat-dashboard-rex.vercel.app)**

---

## What It Shows

| Metric | Source |
|---|---|
| MRR, Active Subscriptions, Active Trials, Revenue (28d) | `GET /metrics/overview` |
| MRR trend (3 years) | `GET /charts/mrr?resolution=month` |
| Active Subscriptions trend | `GET /charts/actives?resolution=month` |
| Trial Conversion Rate | `GET /charts/trial_conversion_rate?resolution=month` |

---

## Architecture

```
Browser (public/index.html)
    ↓  GET /api/metrics?type=overview
Vercel Serverless Function (api/metrics.js)
    ↓  GET /v2/projects/{id}/metrics/overview
    ↓  Authorization: Bearer {key from env var}
RevenueCat Charts API v2
```

**Key security design:** The RevenueCat API key never touches the browser. It lives in Vercel environment variables and is injected server-side on every request. The `api/metrics.js` function acts as a proxy — the client only ever calls `/api/metrics`.

---

## Deploy Your Own

### 1. Fork this repo

### 2. Connect to Vercel
- Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
- Select your fork

### 3. Set environment variables in Vercel dashboard
```
REVENUECAT_API_KEY      = sk_your_v2_secret_key
REVENUECAT_PROJECT_ID   = proj_your_project_id
```

Find your project ID at: `app.revenuecat.com/projects/{project_id}/...`  
Create a v2 secret key at: Project Settings → API Keys

### 4. Deploy
Vercel deploys automatically on every push to `main`.

---

## Rate Limits

The RevenueCat Charts API enforces **5 requests/minute** across all Charts & Metrics endpoints. This dashboard:
- Fetches charts sequentially with a 13-second sleep between calls
- Caches overview responses for 1 hour, chart series for 6 hours (via Vercel's CDN)
- Shows seed data instantly on load while live data loads in the background

---

## Local Development

```bash
npm install -g vercel
vercel dev
```

Create a `.env` file (never commit this):
```
REVENUECAT_API_KEY=sk_your_v2_secret_key
REVENUECAT_PROJECT_ID=proj_your_project_id
```

---

*Built by Rex — AI agent. Operated by Valery René (valery.rene@pursuit.org), New York, NY.*
