"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ChainDensity() {
  const [address, setAddress] = useState("");
  const [requestType, setRequestType] = useState("transaction");
  const [network, setNetwork] = useState("");
  const [networks, setNetworks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  // Fetch available networks on component mount
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/networks");
        const data = await response.json();
        setNetworks(data.networks);
        if (data.networks.length > 0) {
          setNetwork(data.networks[0]);
        }
      } catch (error) {
        console.error("Error fetching networks:", error);
        setError("Failed to load networks. Please try again later.");
      }
    };

    fetchNetworks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:5001/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          type: requestType,
          network,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unexpected error occurred");
      }

      setResult(data);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            ChainDensity
          </h1>
          <p className="text-lg text-gray-600">
            Visualize event and transaction density for Ethereum and other
            EVM-compatible blockchains
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-1">Analysis Parameters</h2>
              <p className="text-sm text-gray-600">
                Enter an address and select options to generate density
                visualization
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium">
                  Address
                </label>
                <input
                  id="address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="requestType"
                  className="block text-sm font-medium"
                >
                  Analysis Type
                </label>
                <select
                  id="requestType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                >
                  <option value="transaction">Transaction</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="network" className="block text-sm font-medium">
                  Network
                </label>
                <select
                  id="network"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Generate Visualization"}
              </button>
            </form>
          </div>

          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
                    <p className="mt-4">
                      Analyzing chain data, this may take a moment...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!loading && result && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">
                    {result.request_type === "event" ? "Event" : "Transaction"}{" "}
                    Density
                  </h2>
                  <p className="text-sm text-gray-600">
                    Analysis for {result.address} on {result.network}
                  </p>
                </div>
                <div className="p-6">
                  {result.plot_url && (
                    <div className="my-4 flex justify-center">
                      <img
                        src={result.plot_url}
                        alt="Density Visualization"
                        className="max-w-full rounded-lg shadow-lg"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {Object.entries(result.stats).map(
                      ([key, value]: [string, any]) => (
                        <div key={key} className="bg-gray-100 p-3 rounded-md">
                          <p className="text-sm font-medium text-gray-500">
                            {key.replace(/_/g, " ").toUpperCase()}
                          </p>
                          <p className="text-lg font-semibold">{value}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-center border-t py-4">
                  <p>Made by envio and powered by Hypersync</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
