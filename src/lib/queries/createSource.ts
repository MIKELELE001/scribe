import { prisma } from "@/lib/db/prisma";
import type { SourceFormValues } from "@/lib/validation/source";

/**
 * Persist a new source. Prisma accepts a string for the Decimal
 * pricePerUseUsd column, preserving exact precision for micropayments.
 * Returns the new source id.
 */
export async function createSource(input: SourceFormValues): Promise<string> {
  const source = await prisma.source.create({
    data: {
      title: input.title,
      authorName: input.authorName,
      sourceType: "TEXT",
      sourceUrl: input.sourceUrl ? input.sourceUrl : null,
      content: input.content,
      payoutAddress: input.payoutAddress,
      pricePerUseUsd: input.pricePerUseUsd,
    },
    select: { id: true },
  });
  return source.id;
}
