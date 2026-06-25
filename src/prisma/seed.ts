import { PrismaClient } from "@prisma/client";

// Seed 2–3 example sources so the agent loop is demoable out of the box
// (CLAUDE.md §18). Payout addresses are placeholder Arc-testnet strings.
const prisma = new PrismaClient();

type SeedSource = {
  title: string;
  authorName: string;
  sourceUrl: string | null;
  content: string;
  payoutAddress: string;
  pricePerUseUsd: string;
};

const SOURCES: SeedSource[] = [
  {
    title: "Scaling laws for grounded retrieval agents",
    authorName: "Dr. Mara Quinn",
    sourceUrl: "https://example.org/notes/scaling-laws",
    content:
      "Retrieval-augmented agents improve answer accuracy when grounding " +
      "material is both relevant and recent. Our experiments show that " +
      "keyword overlap between a question and a source's title is a stronger " +
      "signal of usefulness than body overlap alone, which is why title " +
      "matches deserve a higher weight during ranking. Crucially, paying a " +
      "small access fee per source aligns incentives: creators are rewarded " +
      "for material that agents actually cite, and agents are nudged toward " +
      "selecting only the few highest-value sources rather than scraping " +
      "everything indiscriminately.",
    payoutAddress: "0xA11ce0000000000000000000000000000000Re5e",
    pricePerUseUsd: "0.02",
  },
  {
    title: "The payment floor: why creators need a price per use",
    authorName: "Ife Adeyemi",
    sourceUrl: "https://example.org/essays/payment-floor",
    content:
      "For two decades the web's economics rewarded attention over " +
      "authorship. When AI systems answer questions by absorbing creative " +
      "work without compensation, they remove even the advertising floor that " +
      "once sustained writers. A citation-based micropayment fixes the " +
      "incentive: every time an answer leans on a creator's words, the " +
      "creator earns a small, automatic fee. The amount per use is tiny, but " +
      "across millions of grounded answers it restores a durable income floor " +
      "for the people whose work makes those answers possible.",
    payoutAddress: "0xB0b0000000000000000000000000000000Wr1ter",
    pricePerUseUsd: "0.01",
  },
  {
    title: "Stablecoin micropayments and the agentic commerce market",
    authorName: "Priya Nair",
    sourceUrl: "https://example.org/research/agentic-commerce",
    content:
      "Autonomous agents that can hold and spend stablecoins unlock a new " +
      "class of machine-to-machine commerce. USDC settlement on low-fee " +
      "networks makes sub-cent payments economical for the first time, which " +
      "is the precondition for pay-per-use content access. Analysts expect " +
      "agent-initiated transactions to grow fastest where the unit price is " +
      "small and the decision is automatable — exactly the profile of paying " +
      "to unlock a single source. The HTTP 402 status code, long dormant, " +
      "becomes the natural handshake for this market.",
    payoutAddress: "0xC0ffee00000000000000000000000000Ana1yst5",
    pricePerUseUsd: "0.03",
  },
];

async function main() {
  // Idempotent: clear citations referencing sources, then the sources
  // themselves, before re-inserting the canonical seed set.
  await prisma.citation.deleteMany();
  await prisma.source.deleteMany();

  for (const source of SOURCES) {
    await prisma.source.create({
      data: {
        title: source.title,
        authorName: source.authorName,
        sourceType: "TEXT",
        sourceUrl: source.sourceUrl,
        content: source.content,
        payoutAddress: source.payoutAddress,
        pricePerUseUsd: source.pricePerUseUsd,
      },
    });
  }

  console.log(`Seeded ${SOURCES.length} sources.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
