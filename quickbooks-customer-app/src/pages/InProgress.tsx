export default function InProgress() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Work in Progress</h2>
        <p className="text-gray-600 mb-6">
          This module is currently under development. We're working hard to bring it to you soon!
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full animate-pulse" 
            style={{ width: '65%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}