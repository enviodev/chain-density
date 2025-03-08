export default function Hero() {
  return (
    <div className="relative bg-gray-50 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-gray-50 opacity-70"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute h-40 inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent"></div>

        {/* Animated elements */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-1/3 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mb-5">
            <svg
              className="mr-1.5 h-2 w-2 text-orange-400"
              fill="currentColor"
              viewBox="0 0 8 8"
            >
              <circle cx="4" cy="4" r="3" />
            </svg>
            Powered by Hypersync
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Visualize Blockchain
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-envio-500 to-orange-600">
              {" Activity Density"}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Analyze and visualize event and transaction patterns for any
            contract across Ethereum and other EVM-compatible blockchains
          </p>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-600">
            <span className="px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              Ethereum
            </span>
            <span className="px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              Optimism
            </span>
            <span className="px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              Arbitrum
            </span>
            <span className="px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              Polygon
            </span>
            <span className="px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              Avalanche
            </span>
            <span className="px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              + More
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
