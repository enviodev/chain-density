export default function LoadingState() {
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
          <p className="mt-2 text-sm text-gray-500">
            We're retrieving and processing blockchain data. This may take a
            moment...
          </p>
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
