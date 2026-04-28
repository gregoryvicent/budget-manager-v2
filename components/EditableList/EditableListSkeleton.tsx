import Skeleton from "@/components/Skeleton";
import { COLORS, RADIUS } from "@/lib/theme";

/**
 * Skeleton placeholder for EditableList during loading.
 * Replicates the EditableList layout: header with icon + title, rows, and a total.
 *
 * @param {number} [rows=3] - Number of placeholder rows to display
 */
export default function EditableListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="flex flex-col gap-3 h-auto max-h-[400px] md:h-[380px] md:max-h-none p-6 rounded-[16px]"
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
      }}
    >
      {/* Header: icon + title */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Skeleton width={36} height={36} borderRadius={RADIUS.lg} />
        <Skeleton width={120} height={16} borderRadius={RADIUS.sm} />
      </div>

      {/* Rows */}
      <div className="flex-1 flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: COLORS.surface }}
          >
            <Skeleton width="50%" height={14} borderRadius={RADIUS.sm} />
            <Skeleton width={60} height={14} borderRadius={RADIUS.sm} />
          </div>
        ))}
      </div>

      {/* Total */}
      <div
        className="flex justify-between items-center pt-3 shrink-0"
        style={{ borderTop: `1px solid ${COLORS.cardBorder}` }}
      >
        <Skeleton width={40} height={14} borderRadius={RADIUS.sm} />
        <Skeleton width={80} height={20} borderRadius={RADIUS.sm} />
      </div>
    </div>
  );
}
