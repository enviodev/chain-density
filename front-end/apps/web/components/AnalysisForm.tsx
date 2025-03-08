import { useState } from "react";

interface AnalysisFormProps {
  networks: string[];
  onSubmit: (address: string, requestType: string, network: string) => void;
  loading: boolean;
}

export default function AnalysisForm({
  networks,
  onSubmit,
  loading,
}: AnalysisFormProps) {
  const [address, setAddress] = useState("");
  const [requestType, setRequestType] = useState("event");
  const [network, setNetwork] = useState("ethereum");

  // Example addresses for quick testing
  const exampleAddresses = [
    {
      address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      type: "event",
      name: "Uniswap V2 Router",
      network: "ethereum",
    },
    {
      address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      type: "transaction",
      name: "Uniswap V3 Router",
      network: "ethereum",
    },
    {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      type: "event",
      name: "WETH",
      network: "ethereum",
    },
    {
      address: "0x1f98400000000000000000000000000000000004",
      type: "event",
      name: "Uniswap V4 Pool Manager",
      network: "unichain",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(address, requestType, network);
  };

  const handleExampleClick = (example: (typeof exampleAddresses)[number]) => {
    setAddress(example.address);
    setRequestType(example.type);
    setNetwork(example.network);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-1">Analysis Parameters</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter an address and select options to generate density visualization
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              id="address"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-envio-500 focus:border-envio-500 transition-colors"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="requestType"
              className="block text-sm font-medium text-gray-700"
            >
              Analysis Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  requestType === "event"
                    ? "bg-envio-100 border-envio-300 text-envio-800 shadow-sm scale-[1.02]"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setRequestType("event")}
                aria-pressed={requestType === "event"}
              >
                <div className="flex items-center justify-center space-x-2">
                  {requestType === "event" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-envio-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  <span>Events</span>
                </div>
              </button>
              <button
                type="button"
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  requestType === "transaction"
                    ? "bg-envio-100 border-envio-300 text-envio-800 shadow-sm scale-[1.02]"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setRequestType("transaction")}
                aria-pressed={requestType === "transaction"}
              >
                <div className="flex items-center justify-center space-x-2">
                  {requestType === "transaction" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-envio-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  <span>Transactions</span>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="network"
              className="block text-sm font-medium text-gray-700"
            >
              Network
            </label>
            <select
              id="network"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-envio-500 focus:border-envio-500 transition-colors"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              required
            >
              {networks.length === 0 ? (
                <option value="">Loading networks...</option>
              ) : (
                networks.map((net) => (
                  <option key={net} value={net}>
                    {net.charAt(0).toUpperCase() + net.slice(1)}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-envio-500 to-orange-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-envio-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-envio-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed transform transition-transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading || networks.length === 0}
            >
              {loading ? "Generating..." : "Generate Visualization"}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-3">Quick examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleAddresses.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-700 transition-colors"
                type="button"
              >
                {example.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
