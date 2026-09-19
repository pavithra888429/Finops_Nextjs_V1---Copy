# FinOps Analytics Platform & AgentBuilder Workflows

AI-first FinOps platform for tracking, allocating, and optimizing multi-cloud and AI inference consumption across enterprise products.

## Features
- **Multi-Cloud Cost Allocation**: Deep dive into AWS CUR 2.0 / FOCUS datasets.
- **OpenRouter AI Gateway Telemetry**:
  - Date-wise inference tracking (prompt tokens, completion tokens, prompt caching).
  - API key creation date, quotas, limits, and consumption economics.
  - Client application cost attribution.
- **FinOps FOCUS 1.0 Specification**: Industry-standard cost and usage normalization.
- **AgentBuilder Workflows**: Automated webhook-driven data extraction and ingestion.

## Tech Stack
- Next.js (App Router)
- React, TypeScript
- TailwindCSS, Lucide Icons
- AgentBuilder / n8n Telemetry Workflows

## Getting Started
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or configured port) to view the application.
