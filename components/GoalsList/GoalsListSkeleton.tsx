import Skeleton from "@/components/Skeleton";
import { COLORS, RADIUS } from "@/lib/theme";

/**
 * Skeleton placeholder for GoalsList during loading.
 * Replicates the GoalsList layout: section header and goal cards with progress rings.
 *
 * @param {number} [cards=2] - Number of placeholder goal cards to display
 */
export default function GoalsListSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <Skeleton width={140} height={16} borderRadius={RADIUS.sm} />
        <Skeleton width={100} height={32} borderRadius={RADIUS.lg} />
      </div>

      {/* Goal cards */}
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-5 p-6 rounded-[16px]"
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
          }}
        >
          {/* Card header: icon + title + slider */}
          <div className="flex items-center gap-2.5">
            <Skeleton width={32} height={32} borderRadius={RADIUS.lg} />
            <Skeleton width="40%" height={14} borderRadius={RADIUS.sm} />
          </div>

          {/* Body: ring + stats */}
          <div className="flex flex-col items-center md:flex-row md:items-center gap-5">
            {/* Progress ring placeholder */}
            <Skeleton width={96} height={96} borderRadius="50%" className="shrink-0" />

            {/* Stats lines */}
            <div className="flex-1 flex flex-col gap-3 w-full">
              <Skeleton width="70%" height={12} borderRadius={RADIUS.sm} />
              <Skeleton width="50%" height={12} borderRadius={RADIUS.sm} />
              <Skeleton width="60%" height={12} borderRadius={RADIUS.sm} />
            </div>
          </div>

          {/* Progress bar */}
          <Skeleton width="100%" height={6} borderRadius={RADIUS.sm} />
        </div>
      ))}
    </div>
  );
}
