import Skeleton from "@/components/Skeleton";
import { COLORS, RADIUS, SPACING } from "@/lib/theme";

/**
 * Skeleton placeholder for the budget history page during loading.
 * Replicates the history page layout: header with back button + title,
 * year filter, and a large chart area placeholder.
 */
export default function HistoryPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header: back button + icon + title */}
      <div className="flex items-center gap-3">
        <Skeleton width={44} height={44} borderRadius={RADIUS.xl} />
        <Skeleton width={40} height={40} borderRadius={RADIUS.xl} />
        <Skeleton width={220} height={22} borderRadius={RADIUS.sm} />
      </div>

      {/* Year filter */}
      <Skeleton width={200} height={40} borderRadius={RADIUS.md} />

      {/* Chart area */}
      <div
        className="p-6 rounded-[16px]"
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.cardBorder}`,
        }}
      >
        <div className="flex items-end gap-3 w-full" style={{ height: 300 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              height={`${30 + ((i * 17) % 60)}%`}
              borderRadius={RADIUS.sm}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
