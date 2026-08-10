import type { AnalysisResult } from "@/lib/types";

interface DensityChartProps {
  result: AnalysisResult;
  expanded?: boolean;
}

const formatNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function DensityChart({
  result,
  expanded = false,
}: DensityChartProps) {
  const width = 1120;
  const height = 560;
  const margin = { top: 64, right: 82, bottom: 84, left: 82 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxCount = Math.max(result.max_count, 1);
  const maxTotal = Math.max(result.total_items, 1);
  const slotWidth = plotWidth / result.buckets.length;
  const barWidth = Math.max(2, slotWidth * 0.72);
  const labelEvery = Math.max(1, Math.ceil(result.buckets.length / 9));
  const maxBucketIndex = result.buckets.findIndex(
    (bucket) => bucket.count === result.max_count
  );
  const cumulativePoints = result.buckets
    .map((bucket, index) => {
      const x = margin.left + (index + 0.5) * slotWidth;
      const y =
        margin.top + plotHeight * (1 - bucket.cumulative_count / maxTotal);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className={`w-full overflow-hidden rounded-xl bg-white ${
        expanded ? "h-full" : "aspect-[2/1] min-h-[360px]"
      }`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label={`${result.request_type} density by block interval`}
      >
        <rect width={width} height={height} fill="white" />

        <text
          x={width / 2}
          y={30}
          textAnchor="middle"
          className="fill-gray-900 text-[22px] font-semibold"
        >
          {result.request_type === "event" ? "Events" : "Transactions"} per
          block interval
        </text>
        <text
          x={width / 2}
          y={52}
          textAnchor="middle"
          className="fill-gray-500 text-[13px]"
        >
          Interval size: {result.interval_size.toLocaleString()} blocks
        </text>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = margin.top + plotHeight * (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4 5"
              />
              <text
                x={margin.left - 12}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-500 text-[12px]"
              >
                {formatNumber.format(maxCount * ratio)}
              </text>
              <text
                x={width - margin.right + 12}
                y={y + 4}
                className="fill-slate-600 text-[12px]"
              >
                {formatNumber.format(maxTotal * ratio)}
              </text>
            </g>
          );
        })}

        {result.buckets.map((bucket, index) => {
          const barHeight = (bucket.count / maxCount) * plotHeight;
          const x = margin.left + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = margin.top + plotHeight - barHeight;
          return (
            <g key={bucket.start_block}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, bucket.count > 0 ? 1 : 0)}
                rx={Math.min(3, barWidth / 3)}
                fill={index === maxBucketIndex ? "#dc2626" : "#ff6347"}
                opacity="0.82"
              >
                <title>
                  {bucket.start_block.toLocaleString()}–
                  {bucket.end_block.toLocaleString()}: {bucket.count.toLocaleString()}
                </title>
              </rect>
              {index % labelEvery === 0 && (
                <text
                  x={margin.left + (index + 0.5) * slotWidth}
                  y={margin.top + plotHeight + 24}
                  textAnchor="end"
                  transform={`rotate(-38 ${
                    margin.left + (index + 0.5) * slotWidth
                  } ${margin.top + plotHeight + 24})`}
                  className="fill-gray-500 text-[11px]"
                >
                  {formatNumber.format(bucket.start_block)}
                </text>
              )}
            </g>
          );
        })}

        <polyline
          points={cumulativePoints}
          fill="none"
          stroke="#2a4365"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <line
          x1={margin.left}
          x2={width - margin.right}
          y1={margin.top + plotHeight}
          y2={margin.top + plotHeight}
          stroke="#9ca3af"
        />
        <text
          x={width / 2}
          y={height - 12}
          textAnchor="middle"
          className="fill-gray-600 text-[13px] font-medium"
        >
          Block number
        </text>
        <text
          x={18}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90 18 ${height / 2})`}
          className="fill-gray-600 text-[13px] font-medium"
        >
          Per interval
        </text>
        <text
          x={width - 18}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(90 ${width - 18} ${height / 2})`}
          className="fill-slate-700 text-[13px] font-medium"
        >
          Cumulative total
        </text>

        <g transform={`translate(${width - margin.right - 310} 22)`}>
          <rect width="14" height="10" y="-8" rx="2" fill="#ff6347" />
          <text x="20" className="fill-gray-600 text-[12px]">
            Per interval
          </text>
          <line x1="112" x2="134" y1="-3" y2="-3" stroke="#2a4365" strokeWidth="3" />
          <text x="141" className="fill-gray-600 text-[12px]">
            Cumulative
          </text>
        </g>
      </svg>
    </div>
  );
}
