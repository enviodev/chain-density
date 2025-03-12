import { useEffect, useState } from "react";
import NetworkCarousel from "./NetworkCarousel";

export default function Hero() {
  const [networks, setNetworks] = useState<string[]>([]);

  // Fetch available networks
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const response = await fetch(`${apiBaseUrl}/networks`);
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
    <div className="relative min-h-[80vh] overflow-hidden flex items-center">
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto animate-fadeIn">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100/90 text-orange-800 border border-orange-200/70 shadow-sm mb-5 animate-pulse">
            <svg
              className="mr-1.5 h-2 w-2 text-orange-500"
              fill="currentColor"
              viewBox="0 0 8 8"
            >
              <circle cx="4" cy="4" r="3" />
            </svg>
            Powered by Hypersync
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4 sm:mb-6 animate-slideUp">
            Visualize Blockchain
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-envio-500 to-orange-600">
              {" Activity Density"}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4 animate-slideUp animation-delay-300">
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
