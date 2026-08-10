import { useState } from "react";

import DensityChart from "@/components/DensityChart";
import type { AnalysisResult } from "@/lib/types";

interface ResultsDisplayProps {
  result: AnalysisResult;
  onClear: () => void;
}

export default function ResultsDisplay({
  result,
  onClear,
}: ResultsDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const itemLabel =
    result.request_type === "event" ? "Events" : "Transactions";

  return (
    <>
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative h-[92vh] w-full max-w-[96vw] rounded-xl bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-6 top-6 z-10 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen chart"
            >
              <CloseIcon />
            </button>
            <DensityChart result={result} expanded />
          </div>
        </div>
      )}

      <div className="relative rounded-xl border border-gray-100/50 bg-white/90 shadow-sm">
        <button
          onClick={onClear}
          className="group absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          aria-label="Clear results"
          title="Clear results"
        >
          <CloseIcon />
        </button>

        <div className="border-b border-gray-100/50 p-6">
          <div className="flex flex-col justify-between gap-2 pr-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold">{itemLabel} Density</h2>
              <p className="mt-1 text-sm text-gray-500">
                Analysis for{" "}
                <span className="font-medium text-gray-800">
                  {result.address}
                </span>{" "}
                on{" "}
                <span className="font-medium text-gray-800">
                  {result.network}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 md:mr-8">
              {result.cached && (
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                  Warm result
                </span>
              )}
              <span className="rounded-full bg-gray-100/80 px-3 py-1.5 text-xs text-gray-600">
                Completed in {result.elapsed_time.toFixed(2)}s
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Visualization
              </h3>
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1 text-xs text-envio-500 transition-colors hover:text-orange-700"
              >
                <ExpandIcon />
                View fullscreen
              </button>
            </div>
            <button
              type="button"
              className="block w-full overflow-hidden rounded-lg border border-gray-100/50 bg-white/80 text-left transition-shadow hover:shadow-md"
              onClick={() => setIsFullscreen(true)}
              aria-label="Open chart fullscreen"
            >
              <DensityChart result={result} />
            </button>
            <p className="mt-2 text-center text-xs text-gray-500">
              Snapshot through block {result.snapshot_block.toLocaleString()}.
              Hover a bar for its exact interval count.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Analysis results
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <StatsCard
                title="Blocks scanned"
                value={result.total_blocks.toLocaleString()}
              />
              <StatsCard
                title={`${itemLabel} found`}
                value={result.total_items.toLocaleString()}
              />
              <StatsCard
                title="Elapsed seconds"
                value={result.elapsed_time.toFixed(2)}
              />
              <StatsCard
                title="Blocks / second"
                value={Math.round(
                  result.total_blocks / result.elapsed_time
                ).toLocaleString()}
              />
              <StatsCard
                title={`${itemLabel} / second`}
                value={Math.round(
                  result.total_items / result.elapsed_time
                ).toLocaleString()}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatsCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100/50 bg-gray-50/70 p-4 backdrop-blur-sm transition-shadow hover:shadow-sm">
      <p className="text-xs font-medium uppercase text-gray-600">{title}</p>
      <p className="mt-1 text-xl font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
    </svg>
  );
}
