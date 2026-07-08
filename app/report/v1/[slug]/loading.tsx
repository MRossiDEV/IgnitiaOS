export default function LoadingReport() {
  return (
    <div className="min-h-screen p-8 animate-pulse">
      {/* Header */}
      <div className="h-10 w-1/3 bg-gray-200 rounded mb-6" />
      <div className="h-4 w-1/4 bg-gray-200 rounded mb-10" />

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 rounded-xl"
          />
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="h-60 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}