import Header from "@/components/Header";
import MapWrapper from "@/components/MapWrapper";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-notion-bg font-sans selection:bg-notion-text/10">
      <Header />

      <main className="flex flex-col flex-1">
        {/* Hero Text Section */}
        <div className="w-full px-4 sm:px-8 py-8 sm:py-12 text-center bg-white border-b border-notion-border">
          <h1 className="text-xl font-bold tracking-tight text-notion-text sm:text-2xl md:text-3xl">
            What You Must Experience <br className="sm:hidden" /> in This Country
          </h1>
          <p className="mt-2 text-xs font-medium text-notion-text-light sm:text-sm">
            Share your must-do, must-eat, and must-visit picks.
          </p>
        </div>

        {/* Map Container */}
        <div className="relative h-[600px] border-b border-notion-border">
          <div className="absolute inset-0 z-0">
            <MapWrapper />
          </div>
        </div>

        {/* Platform Description & Experience Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 sm:py-12">
          <div className="mb-12 pb-12 border-b border-notion-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-notion-text-light mb-4">About the Platform</h2>
            <p className="text-base leading-relaxed text-notion-text sm:text-lg opacity-80 max-w-4xl">
              This website is a travel experience platform designed to help you discover what you truly must do, must eat, and must visit in every country.
              Instead of overwhelming you with endless lists, it highlights curated and community-driven recommendations that focus on unforgettable activities,
              iconic local food, and essential destinations. Each country features a visual, photo-based grid that inspires exploration, and every experience
              has its own detailed page with practical information, tips, budget estimates, and real traveler insights.
            </p>
          </div>

          {/* 3-Column Experience Section */}
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Column: Must Do */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-notion-text">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Must Do
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="group cursor-pointer rounded-md border border-notion-border p-3 hover:bg-notion-bg-secondary transition-colors">
                    <p className="text-xs font-semibold text-notion-text group-hover:underline">Unforgettable Activity {i}</p>
                    <p className="mt-1 text-[10px] text-notion-text-light uppercase tracking-tight">Activity • 4.9 ★</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: Must Eat */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-notion-text">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                Must Eat
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="group cursor-pointer rounded-md border border-notion-border p-3 hover:bg-notion-bg-secondary transition-colors">
                    <p className="text-xs font-semibold text-notion-text group-hover:underline">Iconic Local Food {i}</p>
                    <p className="mt-1 text-[10px] text-notion-text-light uppercase tracking-tight">Cuisine • 5.0 ★</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: Must Visit */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-notion-text">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Must Visit
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="group cursor-pointer rounded-md border border-notion-border p-3 hover:bg-notion-bg-secondary transition-colors">
                    <p className="text-xs font-semibold text-notion-text group-hover:underline">Essential Destination {i}</p>
                    <p className="mt-1 text-[10px] text-notion-text-light uppercase tracking-tight">Landmark • 4.8 ★</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Contributors Section (Below the 3 columns) */}
          <div className="mt-12 pt-12 border-t border-notion-border">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-notion-text mb-6">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              Top Contributors
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Traveler_Ray', 'Jeenaworks', 'Wanderlust_Pro', 'Global_Explorer', 'Local_Guide', 'Travel_Addict'].map((name) => (
                <div key={name} className="flex flex-col items-center gap-3 rounded-md border border-notion-border p-4 hover:bg-notion-bg-secondary cursor-pointer transition-colors text-center">
                  <div className="h-10 w-10 rounded-md bg-notion-bg-secondary flex items-center justify-center text-sm font-bold border border-notion-border">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-notion-text truncate w-full">{name}</p>
                    <p className="text-[10px] text-notion-text-light">{Math.floor(Math.random() * 50) + 10} contributions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
