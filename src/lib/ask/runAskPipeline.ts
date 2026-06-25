import { listSourcesWithContent } from "@/lib/queries/listSourcesWithContent";
import { rankSources } from "@/lib/retrieval/rankSources";
import { accessSourceContent } from "@/lib/payments/x402Client";
import { generateGroundedAnswer } from "@/lib/ai/generateGroundedAnswer";
import type { UnlockedSource } from "@/lib/ai/buildAnswerPrompt";
import { createQuerySession } from "@/lib/queries/createQuerySession";
import { attachCitations } from "@/lib/queries/attachCitations";
import { createReceipt } from "@/lib/queries/createReceipt";
import { markSessionComplete } from "@/lib/queries/markSessionComplete";
import { executeScribePayment } from "@/lib/payments/executeScribePayment";
import { sumUsd } from "@/lib/format/usd";
import type { AskCitation, AskResponse } from "@/lib/types/query";
import type { RankedSource } from "@/lib/retrieval/rankSources";

// One ranked source after the agent has paid to unlock its content via x402.
type UnlockedRanked = {
  ranked: RankedSource;
  unlocked: UnlockedSource;
  amountUsd: string;
};

// Step 5: pay each top source through the x402 handshake and collect content.
async function unlockSources(
  baseUrl: string,
  ranked: RankedSource[],
): Promise<UnlockedRanked[]> {
  const results: UnlockedRanked[] = [];
  for (const entry of ranked) {
    const access = await accessSourceContent({
      baseUrl,
      sourceId: entry.source.id,
    });
    results.push({
      ranked: entry,
      unlocked: {
        title: access.title,
        authorName: access.authorName,
        content: access.content,
      },
      amountUsd: access.payment.amountUsd,
    });
  }
  return results;
}

/**
 * The autonomous ask pipeline (CLAUDE.md §10). Ranks sources, pays to unlock
 * the top matches via x402, generates a grounded answer, then persists the
 * session, citations and payment receipt. No human payment confirmation.
 */
export async function runAskPipeline(
  question: string,
  baseUrl: string,
): Promise<AskResponse> {
  const sources = await listSourcesWithContent();
  if (sources.length === 0) {
    return {
      success: false,
      empty: true,
      error: "No sources are registered yet. Add a source first.",
    };
  }

  const { ranked, empty } = rankSources(sources, question);
  if (empty) {
    return { success: false, empty: true, error: "No relevant sources found." };
  }

  const unlocked = await unlockSources(baseUrl, ranked);
  const answer = await generateGroundedAnswer(
    question,
    unlocked.map((entry) => entry.unlocked),
  );

  const totalPaymentUsd = sumUsd(unlocked.map((entry) => entry.amountUsd));
  const querySessionId = await createQuerySession({
    question,
    answer,
    totalPaymentUsd,
  });

  await attachCitations(
    querySessionId,
    unlocked.map((entry) => ({
      sourceId: entry.ranked.source.id,
      relevanceScore: entry.ranked.score,
    })),
  );

  // Settle the aggregated micropayment and record the receipt exactly the same
  // way for mock or real mode (only isMock differs).
  const payment = await executeScribePayment({
    querySessionId,
    citations: unlocked.map((entry) => ({
      sourceId: entry.ranked.source.id,
      payoutAddress: entry.ranked.source.payoutAddress,
      amountUsd: entry.amountUsd,
    })),
  });

  const receipt = await createReceipt({
    querySessionId,
    totalAmountUsd: totalPaymentUsd,
    status: payment.success ? "SUCCEEDED" : "FAILED",
    txHash: payment.txHash ?? null,
    providerReference: payment.providerReference ?? null,
    isMock: payment.isMock,
  });

  await markSessionComplete(querySessionId, payment.success ? "PAID" : "FAILED");

  const citations: AskCitation[] = unlocked.map((entry) => ({
    sourceId: entry.ranked.source.id,
    title: entry.ranked.source.title,
    authorName: entry.ranked.source.authorName,
    pricePerUseUsd: entry.amountUsd,
    relevanceScore: entry.ranked.score,
  }));

  return {
    success: true,
    querySessionId,
    answer,
    citations,
    totalPaymentUsd,
    receipt: {
      id: receipt.id,
      txHash: receipt.txHash,
      status: receipt.status,
      isMock: receipt.isMock,
    },
  };
}
