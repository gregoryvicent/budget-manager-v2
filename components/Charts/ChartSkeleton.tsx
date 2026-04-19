import Skeleton from "@/components/Skeleton";
import { COLORS, RADIUS, SPACING } from "@/lib/theme";

/**
 * Skeleton placeholder for chart components during loading.
 * Supports "bar" and "donut" variants to match the shape of the target chart.
 *
 * @param {"bar" | "donut"} variant - Chart type to determine placeholder shape
 */
export default function ChartSkeleton({ variant }: { variant: "bar" | "donut" }) {
  return (
    <div
      className="flex flex-col gap-4 p-6 rounded-[16px]"
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
      }}
    >
      {/* Title */}
      <Skeleton width={160} height={16} borderRadius={RADIUS.sm} />

      {/* Chart area */}
      <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
        {variant === "bar" ? (
          <div className="flex items-end gap-3 w-full" style={{ height: 180 }}>
            {[0.6, 0.8, 0.45, 0.9, 0.5, 0.7].map((h, i) => (
              <Skeleton
                key={i}
                className="flex-1"
                height={`${h * 100}%`}
                borderRadius={RADIUS.sm}
              />
            ))}
          </div>
        ) : (
          <Skeleton width={180} height={180} borderRadius="50%" />
        )}
      </div>
    </div>
  );
}
