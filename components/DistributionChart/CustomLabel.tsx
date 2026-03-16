import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from "@/lib/theme";
import { CustomLabelProps } from "./types/CustomLabelProps";

const RADIAN = Math.PI / 180;

export default function CustomLabel({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name = "", percent = 0, fill = "#fff" }: CustomLabelProps) {
    const pct       = (percent * 100).toFixed(1);
    const lineStart = outerRadius + 4;
    const sx = cx + lineStart * Math.cos(-midAngle * RADIAN);
    const sy = cy + lineStart * Math.sin(-midAngle * RADIAN);
    const mx = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
    const my = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
    const isRight     = mx > cx;
    const ex          = mx + (isRight ? 12 : -12);
    const ey          = my;
    const textAnchor  = isRight ? "start" : "end";

    return (
        <g>
            <path
                d={`M${sx},${sy} L${mx},${my} L${ex},${ey}`}
                stroke={fill} strokeWidth={1} fill="none" opacity={0.6}
            />
            <circle cx={ex} cy={ey} r={2} fill={fill} />
            <text
                x={ex + (isRight ? 5 : -5)} y={ey - 6}
                textAnchor={textAnchor}
                fill={COLORS.muted}
                fontSize={FONT_SIZES.xs}
                fontFamily={FONTS.body}
            >
                {name}
            </text>
            <text
                x={ex + (isRight ? 5 : -5)} y={ey + 6}
                textAnchor={textAnchor}
                fill={fill}
                fontSize={FONT_SIZES.sm}
                fontWeight={FONT_WEIGHTS.bold}
                fontFamily={FONTS.heading}
            >
                {pct}%
            </text>
        </g>
    );
}
