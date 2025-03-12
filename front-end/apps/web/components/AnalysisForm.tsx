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
  const [requestType, setRequestType] = useState("event");
  const [network, setNetwork] = useState("");

  // Example addresses for quick testing
  const exampleAddresses = [
    {
      address: "0x1f98400000000000000000000000000000000004",
      type: "event",
      name: "Uniswap V4 Pool Manager",
      network: "unichain",
    },
    {
      address: "0x4200000000000000000000000000000000000042",
      type: "transaction",
      name: "OP Token",
      network: "optimism",
    },
    {
      address: "0xe3490297a08d6fC8Da46Edb7B6142E4F461b62D3",
      type: "event",
      name: "Ethena Mint/Redeem V2",
      network: "ethereum",
    },
    {
      address: "0x858646372CC42E1A627fcE94aa7A7033e7CF075A",
      type: "event",
      name: "EigenLayer Strategy Manager",
      network: "ethereum",
    },
  ];

  // Set initial network when networks are loaded
  useEffect(() => {
    if (networks.length > 0 && !network) {
      // Default to ethereum if available, otherwise first network
      const ethNetwork = networks.find(
        (net) =>
          net.toLowerCase() === "ethereum" ||
          net.toLowerCase() === "eth" ||
          net.toLowerCase() === "mainnet"
      );

      if (ethNetwork) {
        setNetwork(ethNetwork.toLowerCase());
      } else if (networks[0]) {
        setNetwork(networks[0].toLowerCase());
      }
    }
  }, [networks, network]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(address, requestType, network);
  };

  const handleExampleClick = (example: (typeof exampleAddresses)[number]) => {
    setAddress(example.address);
    setRequestType(example.type);

    // Manual mapping for known network names
    let targetNetwork = example.network.toLowerCase();

    // Special case for ethereum - directly check against available networks
    if (targetNetwork === "ethereum") {
      // Look for any ethereum-like network in the list
      const ethNetwork = networks.find(
        (net) =>
          net.toLowerCase() === "ethereum" ||
          net.toLowerCase() === "eth" ||
          net.toLowerCase() === "mainnet"
      );

      if (ethNetwork) {
        targetNetwork = ethNetwork.toLowerCase();
      }
    }

    // Set the network if it exists in the available networks
    const networkExists = networks.some(
      (net) => net.toLowerCase() === targetNetwork
    );
    if (networkExists) {
      setNetwork(targetNetwork);
    } else if (networks.length > 0 && networks[0]) {
      console.warn(
        `Network ${targetNetwork} not found in available networks. Using default.`
      );
      setNetwork(networks[0].toLowerCase());
    } else {
      setNetwork("");
    }
  };

  return (
    <div className="bg-white/90 rounded-xl shadow-md border border-gray-100/50 transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-1 text-gray-900">
          Get Started{" "}
        </h2>
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
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-envio-500 focus:border-envio-500 transition-colors text-gray-800"
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
                    ? "bg-envio-50 border-2 border-envio-400 text-gray-800 shadow-md scale-[1.02]"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
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
                  <span className="font-medium text-gray-800">Events</span>
                </div>
              </button>
              <button
                type="button"
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  requestType === "transaction"
                    ? "bg-envio-50 border-2 border-envio-400 text-gray-800 shadow-md scale-[1.02]"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
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
                  <span className="font-medium text-gray-800">
                    Transactions
                  </span>
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
            <div className="relative">
              <select
                id="network"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-envio-500 focus:border-envio-500 transition-colors appearance-none text-gray-800 pr-10 font-medium"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                required
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                }}
              >
                {networks.length === 0 ? (
                  <option value="ethereum">Loading networks...</option>
                ) : (
                  networks.map((net, index) => (
                    <option
                      key={index}
                      value={net.toLowerCase()}
                      className="text-gray-800"
                    >
                      {net.charAt(0).toUpperCase() + net.slice(1)}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 bg-gray-100 border-l border-gray-200 rounded-r-lg">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
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
