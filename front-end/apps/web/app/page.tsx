"use client";

import { useState, useEffect, useRef } from "react";
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
  const resultsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  // Fetch available networks on component mount
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/networks`);

        // Check if response is ok first
        if (!response.ok) {
          setError(`API error: ${response.status} ${response.statusText}`);
          return;
        }

        const contentType = response.headers.get("content-type");

        // Handle non-JSON response gracefully
        if (!contentType || !contentType.includes("application/json")) {
          console.error("API returned non-JSON response:", contentType);
          setError(
            "API returned non-JSON response. Check the API server and CORS settings."
          );
          return;
        }

        const data = await response.json();
        setNetworks(data.networks);
      } catch (error) {
        console.error("Error fetching networks:", error);
        setError("Failed to load networks. Please try again later.");
      }
    };

    fetchNetworks();
  }, [apiBaseUrl]);

  const handleAnalysisSubmit = async (
    address: string,
    requestType: string,
    network: string
  ) => {
    setLoading(true);
    setError("");
    setResult(null);

    // Immediately scroll to loading state
    setTimeout(() => {
      if (loadingRef.current) {
        loadingRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);

    try {
      const response = await fetch(`${apiBaseUrl}/data`, {
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

      // Check response status first
      if (!response.ok) {
        // Try to get error message from JSON response if possible
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `API error: ${response.status} ${response.statusText}`
          );
        } catch (jsonError) {
          // If JSON parsing failed, use status text
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }
      }

      const contentType = response.headers.get("content-type");

      // Handle non-JSON response gracefully
      if (!contentType || !contentType.includes("application/json")) {
        console.error("API returned non-JSON response:", contentType);
        throw new Error(
          "API returned non-JSON response. Check the API server."
        );
      }

      const data = await response.json();
      setResult(data);

      // Scroll to results after they're loaded
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError("");

    // Scroll back to hero section
    setTimeout(() => {
      if (heroRef.current) {
        heroRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-200 to-gray-50 overflow-hidden">
      <Header />

      <main className="flex-grow relative">
        {/* Background animated blobs that span the entire page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top section blobs */}
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute top-40 right-1/3 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

          {/* Form area blobs - more prominent */}
          <div className="absolute top-[60vh] -left-20 w-80 h-80 bg-envio-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-1000"></div>
          <div className="absolute top-[65vh] right-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-3000"></div>

          {/* Bottom section blobs */}
          <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-envio-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-3000"></div>
          <div className="absolute bottom-1/4 right-1/5 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-55 animate-blob animation-delay-5000"></div>
        </div>

        {/* Full-screen hero section */}
        <section
          ref={heroRef}
          className="min-h-screen flex flex-col justify-center items-center relative pt-10"
        >
          <div className="mb-0">
            <Hero />
          </div>

          {/* Centered analysis form - FIXED POSITIONING */}
          <div className="container mx-auto px-4 relative z-20 mt-0">
            <div className="max-w-xl mx-auto transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
              <AnalysisForm
                networks={networks}
                onSubmit={handleAnalysisSubmit}
                loading={loading}
              />
            </div>
          </div>
        </section>

        {/* Results section */}
        <section ref={resultsRef} className="py-4 sm:py-8 md:py-16 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-[1200px] mx-auto">
              {error && <ErrorDisplay message={error} />}
              {loading && (
                <div ref={loadingRef} className="animate-fadeIn">
                  <LoadingState />
                </div>
              )}
              {!loading && !error && result && (
                <div className="animate-slideUp">
                  <ResultsDisplay result={result} onClear={clearResults} />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
