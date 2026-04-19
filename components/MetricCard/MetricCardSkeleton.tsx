import Skeleton from "@/components/Skeleton";
import { COLORS, RADIUS, SPACING } from "@/lib/theme";

/**
 * Skeleton placeholder for MetricCard during loading.
 * Replicates the MetricCard layout: circular icon, two text lines, and a color side bar.
 */
export default function MetricCardSkeleton() {
  return (
    <div
      className="flex flex-row items-center gap-5 p-4 lg:px-7 lg:py-5 rounded-[16px]"
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
      }}
    >
      {/* Icon placeholder */}
      <Skeleton
        width={48}
        height={48}
        borderRadius={RADIUS["2xl"]}
        className="shrink-0"
      />

      {/* Text lines */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <Skeleton width="60%" height={12} borderRadius={RADIUS.sm} />
        <Skeleton width="80%" height={24} borderRadius={RADIUS.sm} />
      </div>

      {/* Color side bar */}
      <Skeleton
        width={3}
        height="100%"
        borderRadius={RADIUS.sm}
        className="self-stretch shrink-0"
      />
    </div>
  );
}
