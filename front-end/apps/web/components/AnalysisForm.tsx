import { useState, useEffect } from "react";

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
  const [requestType, setRequestType] = useState("transaction");
  const [network, setNetwork] = useState("");

  useEffect(() => {
    if (networks.length > 0 && !network) {
      setNetwork(networks[0] || "");
    }
  }, [networks, network]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (network) {
      onSubmit(address, requestType, network);
    }
  };

  const exampleAddresses = [
    {
      name: "Blast L2 Bridge",
      address: "0x4d3f5e1d563cd5cc6fbfd3ed6707593d87f5e550",
      type: "event",
    },
    {
      name: "OP Token",
      address: "0x4200000000000000000000000000000000000042",
      type: "transaction",
    },
    {
      name: "Fren Pet",
      address: "0x7c22c04d02b120eadeefde6de6a710c57ad59f0c",
      type: "event",
    },
  ];

  const handleExampleClick = (example: (typeof exampleAddresses)[number]) => {
    setAddress(example.address);
    setRequestType(example.type);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
              Contract Address
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  requestType === "transaction"
                    ? "bg-orange-50 text-orange-700 border border-orange-100"
                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => setRequestType("transaction")}
              >
                Transaction
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  requestType === "event"
                    ? "bg-orange-50 text-orange-700 border border-orange-100"
                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => setRequestType("event")}
              >
                Event
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
            >
              {networks.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
          </div>

          {/* Professional Button with Subtle Styling */}
          <div className="mt-4">
            <button
              type="submit"
              style={{
                backgroundColor: "#f97316", // More subtle orange
                color: "white",
                padding: "12px 16px",
                borderRadius: "8px",
                fontWeight: "600",
                width: "100%",
                fontSize: "15px",
                border: "none",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#ea580c")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#f97316")
              }
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Generate Visualization"}
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 p-4 rounded-b-xl">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Example Searches
        </h3>
        <div className="grid gap-2">
          {exampleAddresses.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="flex justify-between items-center p-2 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-900">{example.name}</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                {example.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
