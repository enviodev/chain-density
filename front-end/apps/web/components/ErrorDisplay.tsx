interface ErrorDisplayProps {
  message: string;
}

export default function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-red-100/50 overflow-hidden">
      <div className="bg-red-50/90 p-4 border-b border-red-100/50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm text-gray-700 mb-4">{message}</div>

        <div className="bg-gray-50/70 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Suggestions:
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Verify the contract address is correct</li>
            <li>Try a different network for this address</li>
            <li>Check if the contract has the requested type of activity</li>
            <li>Try with a different contract address</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
