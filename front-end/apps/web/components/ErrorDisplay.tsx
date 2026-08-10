import { useState } from "react";

interface ErrorDisplayProps {
  message: string;
}

export default function ErrorDisplay({ message }: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  const isApiError =
    message.includes("API returned non-JSON response") ||
    message.includes("API error:");
  const isNetworkError =
    message.includes("Failed to fetch") || message.includes("Network");

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-md mb-6 animate-fadeIn">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="text-red-700 mt-1">{message}</p>

          {(isApiError || isNetworkError) && (
            <div className="mt-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-red-600 hover:text-red-800 underline focus:outline-none"
              >
                {showDetails
                  ? "Hide troubleshooting steps"
                  : "Show troubleshooting steps"}
              </button>

              {showDetails && (
                <div className="mt-2 text-sm text-red-700 bg-red-100 p-3 rounded">
                  <h4 className="font-medium mb-2">Troubleshooting steps:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Confirm the address and selected network</li>
                    <li>Retry in case the upstream network was unavailable</li>
                    <li>
                      For deployments, verify ENVIO_API_TOKEN is configured in
                      Vercel
                    </li>
                    <li>Try refreshing the page</li>
                    <li>
                      <strong>Check the browser console</strong> for more
                      detailed error messages (F12 or right-click &gt; Inspect
                      &gt; Console)
                    </li>
                  </ul>

                  {isApiError && message.includes("API error:") && (
                    <p className="mt-3">
                      The analysis route returned an error status. Check the
                      Vercel function logs for upstream details.
                    </p>
                  )}

                  {isNetworkError && (
                    <p className="mt-3">
                      A network error occurred. This can happen when your
                      internet connection is unstable or HyperSync is
                      temporarily unreachable.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
