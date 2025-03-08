import { useState, useEffect } from "react";

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progressWidth, setProgressWidth] = useState(15);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Array of informative messages that will rotate
  const loadingMessages = [
    "We're retrieving and processing blockchain data. This may take a moment...",
    "Generally, retrieving one million events can take around 5 seconds, but it depends on the chain and address density.",
    "Addresses with high activity (like DEXes or bridges) may take longer to analyze due to the volume of data.",
    "We're using Hypersync to efficiently query blockchain data across 60+ chains.",
    "The visualization will show you patterns in blockchain activity over time.",
    "Different chains have different block times, which affects how long this analysis takes.",
    "We're analyzing historical data to identify trends and patterns in blockchain activity.",
    "This tool is useful for understanding indexing efforts and activity density.",
  ];

  // Update the message every 5 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 5000);

    // Update progress bar and elapsed time
    const progressInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
      setProgressWidth((prev) => {
        // Gradually increase width but slow down over time
        const increment = Math.max(1, 5 - Math.floor(prev / 20));
        return Math.min(prev + increment, 85);
      });
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-envio-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-white"></div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Analyzing Chain Data
          </h3>
          <div className="h-16 mt-2">
            <p className="text-sm text-gray-500 animate-fadeIn">
              {loadingMessages[messageIndex]}
            </p>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Time elapsed: {elapsedTime}s
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-full max-w-md bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-envio-500 to-orange-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>

        <div className="mt-8 w-full max-w-md">
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-200 rounded-full mr-3 animate-pulse"></div>
              <div className="h-2.5 bg-gray-200 rounded-full w-full"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-300 rounded-full mr-3 animate-pulse"></div>
              <div className="h-2.5 bg-gray-200 rounded-full w-3/4"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-400 rounded-full mr-3 animate-pulse"></div>
              <div className="h-2.5 bg-gray-200 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
