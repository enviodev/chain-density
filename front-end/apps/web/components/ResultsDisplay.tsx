import { useState } from "react";

interface ResultsDisplayProps {
  result: {
    plot_url: string;
    stats: Record<string, string | number>;
    request_type: string;
    address: string;
    network: string;
    total_blocks: number;
    total_items: number;
    elapsed_time: number;
  };
  onClear: () => void;
}

export default function ResultsDisplay({
  result,
  onClear,
}: ResultsDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative w-full max-w-[95vw] h-[90vh]">
            <button
              className="absolute top-4 right-4 text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={result.plot_url}
                alt="Density Visualization (Fullscreen)"
                className="max-w-full max-h-full object-contain"
                style={{ minWidth: "90%" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/50 relative">
        {/* Clear button */}
        <button
          onClick={onClear}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10 group"
          aria-label="Clear results"
          title="Clear results"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Clear results
          </span>
        </button>

        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 pr-10">
            <div>
              <h2 className="text-xl font-semibold">
                {result.request_type === "event" ? "Event" : "Transaction"}{" "}
                Density
              </h2>
              <p className="text-sm text-gray-500 mt-1">
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
            <div className="text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-600 md:mr-8">
              Completed in {result.elapsed_time.toFixed(2)}s
            </div>
          </div>
        </div>

        {/* Visualization Section - Now Full Width */}
        <div className="p-6">
          {result.plot_url && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Visualization
                </h3>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="text-xs flex items-center gap-1 text-envio-500 hover:text-orange-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                    />
                  </svg>
                  View Fullscreen
                </button>
              </div>
              <div
                className="rounded-lg overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setIsFullscreen(true)}
              >
                <img
                  src={result.plot_url}
                  alt="Density Visualization"
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click on the visualization to view in fullscreen
              </p>
            </div>
          )}

          {/* Stats Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Analysis Results
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard
                title="Total Blocks"
                value={result.total_blocks.toLocaleString()}
                description="Number of blocks analyzed"
              />
              <StatsCard
                title="Total Items"
                value={result.total_items.toLocaleString()}
                description={`Number of ${result.request_type === "event" ? "events" : "transactions"}`}
              />
              {Object.entries(result.stats).map(([key, value]) => (
                <StatsCard
                  key={key}
                  title={key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  value={
                    typeof value === "number" ? value.toLocaleString() : value
                  }
                  description=""
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
}

function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}
