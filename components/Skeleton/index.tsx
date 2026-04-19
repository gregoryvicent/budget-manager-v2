/**
 * Base Skeleton component for loading placeholders with shimmer animation.
 *
 * @param {string | number} [width] - Width of the skeleton element
 * @param {string | number} [height] - Height of the skeleton element
 * @param {string} [className] - Additional CSS classes
 * @param {string | number} [borderRadius] - Border radius of the skeleton element
 */

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  borderRadius?: string | number;
}

export default function Skeleton({ width, height, className = "", borderRadius }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
      }}
    />
  );
}
