# Scribe

**Pay the source behind the answer.**

Scribe is a citation-based micropayment layer that pays creators, researchers, and publishers when AI answers use their work as grounding material.

---

## 1. What Scribe is

Scribe turns "AI used my work" into "AI paid for my work." A creator registers a source (an article, note, or memo) with a price per use and a payout address. When a user asks a question, the **Scribe agent autonomously** retrieves the most relevant sources, pays for each one in USDC over the [x402](https://www.x402.org/) payment protocol, generates a grounded answer, and returns it with a payment receipt — with **no human payment confirmation**. The agent decides, pays, and acts.

## 2. Why it exists — the payment floor problem

For two decades the web's economics rewarded attention over authorship. When AI systems answer questions by absorbing creative work without compensation, they remove even the advertising floor that once sustained writers, researchers, and publishers.

Scribe restores that floor. Every time a grounded answer leans on a creator's words, the creator earns a small, automatic fee. The amount per use is tiny, but across millions of grounded answers it becomes a durable income stream for the people whose work makes those answers possible.

## 3. How it works

1. **Register a source** — Add an article, note, or memo with a price per use and a payout address.
2. **The agent asks and pays** — Scribe ranks sources by relevance, pays to unlock the top matches in USDC (no human confirmation), and writes a grounded answer.
3. **The creator earns** — Every answer returns a receipt showing exactly who was paid and how much.

## 4. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (zero `any`) |
| Styling | CSS Modules |
| Forms | react-hook-form + zod |
| AI / LLM | Groq SDK — `llama-3.3-70b-versatile` |
| Database | Prisma ORM + SQLite (local) / PostgreSQL (Vercel) |
| Payments | Circle / Arc — USDC micropayments on Arc testnet |
| Payment protocol | x402 (HTTP 402 Payment Required) |
| Deployment | Vercel |

## 5. Local setup

```bash
# 1. Clone
git clone https://github.com/MIKELELE001/scribe.git
cd scribe

# 2. Install
npm install

# 3. Environment variables
#    Create .env.local (runtime) and .env (Prisma CLI). See section 6.
#    At minimum set DATABASE_URL and GROQ_API_KEY; keep PAYMENT_MODE=mock for local dev.

# 4. Create the database schema
npm run db:push

# 5. Seed example sources
npm run db:seed

# 6. Run the dev server
npm run dev
# → http://localhost:3000
```

> **Note:** `.env` is read by the Prisma CLI (`db:push`, `db:seed`); the Next.js runtime reads `.env.local`. Keep `DATABASE_URL` in sync across both. Secrets (`GROQ_API_KEY`, `CIRCLE_API_KEY`, treasury keys) live in `.env.local` only and are never exposed to the client.

## 6. Environment variable reference

All variables are server-side only unless prefixed `NEXT_PUBLIC_`.

```bash
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=file:./dev.db          # SQLite for local dev

# AI
GROQ_API_KEY=                       # required — server-side only

# Payments
PAYMENT_MODE=mock                   # "mock" | "real"
CIRCLE_API_KEY=
CIRCLE_BASE_URL=https://api-sandbox.circle.com
ARC_RPC_URL=
ARC_CHAIN_ID=
SCRIBE_TREASURY_WALLET=
SCRIBE_TREASURY_PRIVATE_KEY=
```

## 7. Demo walkthrough

1. **Add a source** — Go to `/sources/new`, register an article with a title, content, payout address, and a price per use (e.g. `0.01`). It appears on `/sources`. (Three example sources are already seeded.)
2. **Ask a question** — Go to `/ask` and ask something the sources can answer, e.g. *"Why do creators need a price per use?"*
3. **Watch the agent pay** — The agent ranks sources, pays each top match over x402, and returns a grounded answer with inline `[Source N]` citations, the price paid per source, and a payment receipt (total paid + tx/mock reference).
4. **View receipts** — Go to `/receipts` to see every settlement the agent has made, most recent first.

## 8. Hackathon fit

Built for the **Lepton Agents Hackathon** (Jun 15–29 2026).

- **RFB 06 — Creator & Publisher Monetization (primary):** Scribe is a working monetization rail that pays sources per citation.
- **RFB 01 — Autonomous Paying Agents (secondary):** The agent pays autonomously — no human "Confirm Payment" step. It ranks, settles, and answers on its own.
- **x402:** Sources are served behind an HTTP 402 boundary (`GET /api/sources/[id]/content`). The agent handles the 402 challenge, authorizes a USDC micropayment, and retries with the `X-Payment` header — the same code path for mock and real settlement.

## 9. Dev mock mode

With `PAYMENT_MODE=mock` (the default for local dev):

- The payment adapter skips real Arc/Circle calls and returns a mock receipt with a generated reference, timestamp, and `mock_*` tx hash.
- Mock receipts are written to the database **exactly** as real receipts would be — only the `isMock` flag differs.
- A **`DEV MODE — Mock Payment`** badge is shown wherever payment info appears.
- All mock code paths are clearly commented.

Switch to `PAYMENT_MODE=real` to route settlement through the Circle/Arc provider (`src/lib/payments/providers/circleArcProvider.ts`) — the single swap-in point for live USDC transfers. The rest of the app is already agnostic to which provider runs.
