export function ProductStoriesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Product Stories</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[9/16] rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 border flex items-center justify-center text-gray-600 font-medium">
            Coming soon
          </div>
        ))}
      </div>
    </div>
  );
}
