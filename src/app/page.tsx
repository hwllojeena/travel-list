"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MapWrapper from "@/components/MapWrapper";
import { supabase } from "@/lib/supabase";
import { getSessionId } from "@/utils/session";
import Link from "next/link";
import { Heart, Utensils, Compass, MapPin, MessageSquare, Loader2 } from "lucide-react";

type Contribution = {
  id: string;
  title: string;
  category: "eat" | "do" | "visit";
  country_id: string;
  country_name: string;
  image_url: string;
  likes_count: number;
  comments?: { id: string }[];
};

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [picks, setPicks] = useState<{
    eat: Contribution[];
    do: Contribution[];
    visit: Contribution[];
  }>({ eat: [], do: [], visit: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHasMounted(true);
    const sessionId = getSessionId();

    async function fetchTopPicks() {
      setLoading(true);
      try {
        const categories: ("eat" | "do" | "visit")[] = ["eat", "do", "visit"];
        const results: any = {};

        await Promise.all(
          categories.map(async (cat) => {
            const { data, error } = await supabase
              .from("contributions")
              .select("*, comments(id)")
              .eq("category", cat)
              .order("likes_count", { ascending: false })
              .limit(3);

            if (error) throw error;
            results[cat] = data || [];
          })
        );

        setPicks(results);

        // Fetch user's likes from DB
        const { data: userLikes, error: likesError } = await supabase
          .from('likes')
          .select('contribution_id')
          .eq('user_id', sessionId);

        if (!likesError && userLikes) {
          const likedMap: Record<string, boolean> = {};
          userLikes.forEach(like => {
            likedMap[like.contribution_id] = true;
          });
          setLikedItems(likedMap);
        }
      } catch (error) {
        console.error("Error fetching top picks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopPicks();
  }, []);

  if (!hasMounted) return <div className="min-h-screen bg-notion-bg" />;

  return (
    <div className="flex min-h-screen flex-col bg-notion-bg font-sans selection:bg-notion-text/10">
      <Header />

      <main className="flex flex-col flex-1">
        {/* Hero Text Section */}
        <div className="w-full px-4 sm:px-8 py-8 sm:py-12 text-center bg-white border-b border-notion-border">
          <h1 className="text-xl font-bold tracking-tight text-notion-text sm:text-2xl md:text-3xl">
            What You Must Experience in This Country
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
              iconic local food, and essential destinations.
            </p>
          </div>

          {/* 3-Column Experience Section */}
          <div className="grid gap-8 sm:grid-cols-3">
            <PickColumn
              title="Must Do"
              category="do"
              items={picks.do}
              loading={loading}
              likedItems={likedItems}
              color="bg-blue-500"
              icon={Compass}
            />
            <PickColumn
              title="Must Eat"
              category="eat"
              items={picks.eat}
              loading={loading}
              likedItems={likedItems}
              color="bg-orange-500"
              icon={Utensils}
            />
            <PickColumn
              title="Must Visit"
              category="visit"
              items={picks.visit}
              loading={loading}
              likedItems={likedItems}
              color="bg-green-500"
              icon={MapPin}
            />
          </div>

          {/* Top Contributors Section (Below the 3 columns) */}
          <div className="mt-12 pt-12 border-t border-notion-border">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-notion-text mb-6">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              Top Contributors
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Traveler_Ray', 'Jeenaworks', 'Wanderlust_Pro', 'Global_Explorer', 'Local_Guide', 'Travel_Addict'].map((name, index) => (
                <div key={name} className="flex flex-col items-center gap-3 rounded-md border border-notion-border p-4 hover:bg-notion-bg-secondary cursor-pointer transition-colors text-center">
                  <div className="h-10 w-10 rounded-md bg-notion-bg-secondary flex items-center justify-center text-sm font-bold border border-notion-border">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-notion-text truncate w-full">{name}</p>
                    <p className="text-[10px] text-notion-text-light">{10 + (index * 7) % 40} contributions</p>
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

function PickColumn({ title, category, items, loading, likedItems, color, icon: Icon }: any) {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-notion-text">
        <span className={`h-2 w-2 rounded-full ${color}`}></span>
        {title}
      </h3>
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-notion-bg-secondary animate-pulse border border-notion-border" />
          ))
        ) : items.length > 0 ? (
          items.map((item: Contribution) => (
            <Link
              key={item.id}
              href={`/country/${item.country_id}?exp=real-${item.id}`}
              className="group flex gap-3 rounded-xl border border-notion-border p-3 hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer bg-notion-bg-secondary/30"
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-notion-border">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-[11px] font-bold text-notion-text truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                  {item.title}
                </p>
                <div className="mt-1 flex items-center gap-1.5 opacity-60">
                  <MapPin className="h-2.5 w-2.5" />
                  <p className="text-[9px] font-bold uppercase tracking-widest truncate">
                    {item.country_name || item.country_id}
                  </p>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className={`flex items-center gap-1 transition-colors ${likedItems[item.id] ? 'text-red-500' : 'opacity-60'}`}>
                    <Heart className={`h-3 w-3 ${likedItems[item.id] ? 'fill-red-500' : 'fill-black'}`} />
                    <span className={`text-[10px] font-black ${likedItems[item.id] ? 'text-red-500' : 'text-notion-text'}`}>{item.likes_count}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-60">
                    <MessageSquare className="h-2.5 w-2.5 fill-black" />
                    <span className="text-[10px] font-black text-notion-text">{item.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-notion-border p-6 text-center opacity-40">
            <Icon className="h-6 w-6 mx-auto mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No picks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
