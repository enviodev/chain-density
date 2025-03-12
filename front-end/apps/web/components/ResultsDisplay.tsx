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
    cached?: boolean;
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
      <div className="bg-white/90 rounded-xl shadow-sm border border-gray-100/50 relative">
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

        <div className="p-6 border-b border-gray-100/50">
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
            <div className="flex items-center gap-2 md:mr-8">
              <div className="text-xs bg-gray-100/80 px-3 py-1.5 rounded-full text-gray-600">
                Completed in {result.elapsed_time.toFixed(2)}s
              </div>
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
                className="rounded-lg overflow-hidden border border-gray-100/50 bg-white/80 hover:shadow-md transition-shadow cursor-pointer"
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

          {/* Stats Section - Improved Layout */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-envio-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Analysis Results
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Total Blocks Processed */}
              <StatsCard
                title="Total Blocks Processed"
                value={result.total_blocks.toLocaleString()}
                icon="blocks"
              />

              {/* Total Events/Transactions Processed */}
              <StatsCard
                title={`Total ${result.request_type === "event" ? "Events" : "Transactions"} Processed`}
                value={result.total_items.toLocaleString()}
                icon="items"
              />

              {/* Elapsed Time */}
              <StatsCard
                title="Elapsed Time (seconds)"
                value={result.elapsed_time.toFixed(2)}
                icon="time"
              />

              {/* Blocks per Second */}
              <StatsCard
                title="Blocks per Second"
                value={Math.round(
                  result.total_blocks / result.elapsed_time
                ).toLocaleString()}
                icon="density"
              />

              {/* Events/Transactions per Second */}
              <StatsCard
                title={`${result.request_type === "event" ? "Events" : "Transactions"} per Second`}
                value={Math.round(
                  result.total_items / result.elapsed_time
                ).toLocaleString()}
                icon="density"
              />
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
  description?: string;
  icon?: "blocks" | "items" | "density" | "time" | "average" | "max";
}

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "blocks":
        return (
          <svg
            className="h-4 w-4 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8 4l-8 4m8-4l-8-4m8-4l-8-4m8 8l-8 4"
            />
          </svg>
        );
      case "items":
        return (
          <svg
            className="h-4 w-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      case "density":
        return (
          <svg
            className="h-4 w-4 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        );
      case "time":
        return (
          <svg
            className="h-4 w-4 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "average":
        return (
          <svg
            className="h-4 w-4 text-envio-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z M9 17v-6 M12 17v-10 M15 17v-4"
            />
          </svg>
        );
      case "max":
        return (
          <svg
            className="h-4 w-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50/70 backdrop-blur-sm p-4 rounded-lg border border-gray-100/50 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-1.5 mb-1">
        {icon && getIcon()}
        <p className="text-xs font-medium text-gray-600 uppercase">{title}</p>
      </div>
      <p className="text-xl font-semibold mt-1 text-gray-800">{value}</p>
      {description && (
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      )}
    </div>
  );
}
