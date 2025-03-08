"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import AnalysisForm from "@/components/AnalysisForm";
import LoadingState from "@/components/LoadingState";
import ResultsDisplay from "@/components/ResultsDisplay";
import ErrorDisplay from "@/components/ErrorDisplay";

export default function ChainDensity() {
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
      } catch (error) {
        console.error("Error fetching networks:", error);
        setError("Failed to load networks. Please try again later.");
      }
    };

    fetchNetworks();
  }, []);

  const handleAnalysisSubmit = async (
    address: string,
    requestType: string,
    network: string
  ) => {
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        <Hero />

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-[1400px] mx-auto">
              <div className="grid md:grid-cols-[1fr_3fr] gap-8">
                <div>
                  <AnalysisForm
                    networks={networks}
                    onSubmit={handleAnalysisSubmit}
                    loading={loading}
                  />
                </div>

                <div>
                  {error && <ErrorDisplay message={error} />}
                  {loading && <LoadingState />}
                  {!loading && !error && result && (
                    <ResultsDisplay result={result} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
