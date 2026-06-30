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

**Grounded-first, never stuck.** Scribe always tries registered sources first. When a relevant source exists, the answer is grounded on it and the creator is paid (above). When *no* registered source is relevant, Scribe still answers — from the model's general knowledge, paying no one and writing no receipt — and logs the question as an unmet topic on the **Creator Demand board** (`/demand`). Creators see what people are asking about that nobody has covered yet, register content for it, and earn the next time it's asked.

## 4. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (zero `any`) |
| Styling | CSS Modules |
| Forms | react-hook-form + zod |
| AI / LLM | Groq SDK — `llama-3.3-70b-versatile` |
| Database | Prisma ORM + PostgreSQL (Neon/Supabase) |
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
#    Copy the template, then fill in DATABASE_URL, DIRECT_URL, and GROQ_API_KEY.
cp .env.example .env.local
cp .env.example .env
#    Point both at a PostgreSQL database (a free Neon project works well) and
#    keep PAYMENT_MODE=mock for local dev. See section 6 for all variables.

# 4. Create the database schema
npm run db:push

# 5. Seed example sources
npm run db:seed

# 6. Run the dev server
npm run dev
# → http://localhost:3000
```

> **Note:** `.env` is read by the Prisma CLI (`db:push`, `db:seed`); the Next.js runtime reads `.env.local`. Keep `DATABASE_URL` / `DIRECT_URL` in sync across both. Secrets (`GROQ_API_KEY`, `CIRCLE_API_KEY`, treasury keys) live in `.env.local` only and are never exposed to the client.
>
> **Offline local dev (optional):** to run without Postgres, set `provider = "sqlite"` in `src/prisma/schema.prisma`, drop the `directUrl` line, and use `DATABASE_URL="file:./dev.db"`.

## Deploying to Vercel

1. Provision a PostgreSQL database (e.g. a [Neon](https://neon.tech) project) and copy both the **pooled** connection string (`DATABASE_URL`, with `?pgbouncer=true`) and the **direct** one (`DIRECT_URL`).
2. Import the repo into Vercel. In **Project → Settings → Environment Variables**, add every variable from section 6 — at minimum `DATABASE_URL`, `DIRECT_URL`, `GROQ_API_KEY`, `PAYMENT_MODE=mock`, and `NEXT_PUBLIC_APP_URL` (your deployment URL).
3. Deploy. The `build` script runs `prisma generate && prisma db push && next build`, so the schema is applied to your Postgres database automatically on each build.
4. **Seed once** against the production database (the build does not seed): run `DATABASE_URL=... DIRECT_URL=... npm run db:seed` locally pointed at prod, or trigger it from a one-off job. Seeding is idempotent — it resets the example sources.

## 6. Environment variable reference

All variables are server-side only unless prefixed `NEXT_PUBLIC_`.

```bash
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (PostgreSQL — Neon/Supabase)
DATABASE_URL=                       # pooled connection string (runtime)
DIRECT_URL=                         # direct connection (prisma db push)

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
4. **Ask something unregistered** — Ask an off-topic question, e.g. *"What is the capital of France?"* Scribe answers from general knowledge, shows an "answered from general knowledge — no payment" notice, and writes no receipt. The question now appears on `/demand`; ask it again and its count increments.
5. **View receipts** — Go to `/receipts` to see every settlement the agent has made, most recent first.
6. **View demand** — Go to `/demand` to see the unmet topics ranked by how often they've been asked, each with a one-click link to register a source.

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
