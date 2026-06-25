// Ask pipeline request/response DTOs. See CLAUDE.md §9 (POST /api/ask).
// All money fields are strings to preserve Decimal precision across the API.

export type AskRequest = {
  question: string;
};

// A source the agent cited (and paid for) in an answer.
export type AskCitation = {
  sourceId: string;
  title: string;
  authorName: string;
  pricePerUseUsd: string;
  relevanceScore: number;
};

// The settlement receipt summary returned alongside the answer.
export type AskReceipt = {
  id: string;
  txHash: string | null;
  status: string;
  isMock: boolean;
};

export type AskResponse =
  | {
      success: true;
      querySessionId: string;
      answer: string;
      citations: AskCitation[];
      totalPaymentUsd: string;
      receipt: AskReceipt;
    }
  | { success: false; error: string; empty?: boolean };
