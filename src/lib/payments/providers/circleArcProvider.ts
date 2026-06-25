import type {
  PaymentExecutionInput,
  PaymentExecutionResult,
} from "../paymentTypes";

/**
 * Real Circle/Arc settlement on Arc testnet (selected when PAYMENT_MODE=real).
 *
 * Not yet wired to the live Circle Agent Stack. It returns a clear failure so
 * the ask pipeline degrades safely instead of pretending to pay. This is the
 * single swap-in point for real USDC transfers — the rest of the app is already
 * agnostic to which provider runs.
 */
export async function circleArcExecutePayment(
  input: PaymentExecutionInput,
): Promise<PaymentExecutionResult> {
  // TODO(real): using CIRCLE_API_KEY / CIRCLE_BASE_URL, transfer USDC to each
  // citation.payoutAddress on Arc (ARC_RPC_URL / ARC_CHAIN_ID), signed from
  // SCRIBE_TREASURY_WALLET, then aggregate into one settlement reference.
  void input;
  return {
    success: false,
    isMock: false,
    error:
      "Real Arc/Circle payments are not implemented yet. Set PAYMENT_MODE=mock.",
  };
}
