type LoadingProps = {
  name?: string;  // Make optional with ?
};

export default function Loading({ name = "data" }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="relative w-16 h-16">
        {/* Spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        {/* QuickBooks logo or icon */}
        <div className="absolute inset-1 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-700">
        {name ? `Loading ${name}...` : "Loading, please wait..."}
      </p>
      <p className="text-sm text-gray-500">Please wait a moment</p>
    </div>
  );
}