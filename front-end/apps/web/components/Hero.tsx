import { useEffect, useState } from "react";
import NetworkCarousel from "./NetworkCarousel";

export default function Hero() {
  const [networks, setNetworks] = useState<string[]>([]);

  // Fetch available networks
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/networks");
        const data = await response.json();
        if (data.networks && Array.isArray(data.networks)) {
          // Filter out any non-string values
          const validNetworks = data.networks.filter(
            (network: any): network is string => typeof network === "string"
          );
          setNetworks(validNetworks);
        }
      } catch (error) {
        console.error("Error fetching networks for carousel:", error);
        // Use fallback networks if API fails
        setNetworks([
          "ethereum",
          "optimism",
          "arbitrum",
          "polygon",
          "avalanche",
          "base",
          "bsc",
          "fantom",
          "gnosis",
          "celo",
          "moonbeam",
          "unichain",
        ]);
      }
    };

    fetchNetworks();
  }, []);

  return (
    <div className="relative min-h-[80vh] bg-gray-50 overflow-hidden flex items-center">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-gray-50 opacity-70"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute h-40 inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent"></div>

        {/* Enhanced animated elements */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-1/3 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* Additional animated elements */}
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-envio-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-3000"></div>
        <div className="absolute bottom-1/4 right-1/5 w-56 h-56 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-5000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto animate-fadeIn">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mb-5 animate-pulse">
            <svg
              className="mr-1.5 h-2 w-2 text-orange-400"
              fill="currentColor"
              viewBox="0 0 8 8"
            >
              <circle cx="4" cy="4" r="3" />
            </svg>
            Powered by Hypersync
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 animate-slideUp">
            Visualize Blockchain
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-envio-500 to-orange-600">
              {" Activity Density"}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4 animate-slideUp animation-delay-300">
            Analyze and visualize event and transaction density for any address
            across 60+ chains. Useful for trends and understanding indexing
            efforts.
          </p>

          {/* Network Carousel - reduced margin */}
          <div className="animate-fadeIn animation-delay-500">
            <NetworkCarousel networks={networks} />
          </div>

          <div className="mt-8 animate-bounce animation-delay-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
