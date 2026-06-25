import { prisma } from "@/lib/db/prisma";
import type { SourceListItem } from "@/lib/types/source";

/**
 * List all sources, most recent first, as serializable DTOs. Decimal and Date
 * fields are converted to strings so the result can cross the API boundary.
 */
export async function listSources(): Promise<SourceListItem[]> {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      authorName: true,
      pricePerUseUsd: true,
      createdAt: true,
    },
  });

  return sources.map((source) => ({
    id: source.id,
    title: source.title,
    authorName: source.authorName,
    pricePerUseUsd: source.pricePerUseUsd.toString(),
    createdAt: source.createdAt.toISOString(),
  }));
}
