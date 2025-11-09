## Agentic Social Media Strategist

Autonomous AI agent that absorbs your brand persona, spins up channel-specific campaigns, and delivers ready-to-publish social media assets.

### ✨ Feature Highlights

- Persona-aware launch planning with editable brand DNA
- Hero post blueprints plus multi-platform variations
- Auto-generated publishing calendar and engagement playbook
- KPI guardrails to keep execution focused
- API route connects to OpenAI (with graceful offline fallback)

### 🚀 Quick Start

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to configure your brand and run the agent.

### 🔑 AI Provider

Set an `OPENAI_API_KEY` environment variable to enable LLM-powered generations. Without a key the toolkit falls back to on-device heuristics for deterministic output.

### 🧱 Tech Stack

- Next.js App Router & React Server Components
- Tailwind v4 for glassmorphism-inspired UI
- Lucide icons, date-fns utilities, Zod runtime validation
- API route orchestrating OpenAI `responses` endpoint

### 📦 Available Scripts

- `npm run dev` – start the development server
- `npm run build` – create a production build
- `npm run start` – run the production server
- `npm run lint` – lint with ESLint

Deploy anywhere Next.js runs. Optimized for Vercel out of the box.
