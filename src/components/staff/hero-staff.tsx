export function HeroStaff() {
  return (
    <div className="relative py-16 md:py-24 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-700">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            VorteKia
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
          Staff UI - Experience the best of VorteKia
        </p>
      </div>
    </div>
  );
}
