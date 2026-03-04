"use client";

import { useState, useEffect } from "react";
import { Utensils, Compass, MapPin, Plus, Heart, MessageSquare, Bookmark, RefreshCw } from "lucide-react";
import ContributionModal from "./ContributionModal";
import { supabase } from "@/lib/supabase";
import ExperienceDetail from "./ExperienceDetail";
import { getSessionId } from "@/utils/session";

interface CountryContentProps {
    countryName: string;
}

type Category = "eat" | "do" | "visit";

const categoryIcons: Record<string, any> = {
    eat: Utensils,
    do: Compass,
    visit: MapPin
};

const categoryColors: Record<string, string> = {
    eat: "bg-orange-500",
    do: "bg-blue-500",
    visit: "bg-green-500"
};

const categoryLabels: Record<string, string> = {
    eat: "Must Eat",
    do: "Must Do",
    visit: "Must Visit"
};

export default function CountryContent({ countryName }: CountryContentProps) {
    const [hasMounted, setHasMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [likedItems, setLikedItems] = useState<Record<string | number, boolean>>({});
    const [savedItems, setSavedItems] = useState<Record<string | number, boolean>>({});

    // State for Experience Detail Modal
    const [selectedExp, setSelectedExp] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [realItems, setRealItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const countryId = countryName.toLowerCase().replace(/\s+/g, '-');

    const fetchContributions = async () => {
        setIsLoading(true);
        try {
            const sessionId = getSessionId();

            // Fetch contributions
            const { data: contribs, error: error } = await supabase
                .from('contributions')
                .select('*, comments(id)')
                .eq('country_id', countryId)
                .order('likes_count', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch user's likes from DB
            const { data: userLikes, error: likesError } = await supabase
                .from('likes')
                .select('contribution_id')
                .eq('user_id', sessionId);

            if (likesError) throw likesError;

            const likedMap: Record<string, boolean> = {};
            userLikes?.forEach(like => {
                likedMap[like.contribution_id] = true;
            });

            // Format data for the gallery
            const formatted = (contribs || []).map(item => {
                const isVideo = item.image_url?.match(/\.(mp4|webm|ogg|mov)$|^data:video/i);
                return {
                    id: `real-${item.id}`, // Ensure unique keys
                    dbId: item.id,
                    title: item.title,
                    category: (item.category || "visit") as Category,
                    author: item.author_name,
                    img: item.image_url,
                    isVideo: !!isVideo,
                    likes: item.likes_count || 0,
                    comments: item.comments?.length || 0,
                    description: item.description,
                    location: item.metadata?.location,
                    budget: item.metadata?.budget,
                    difficulty: item.metadata?.difficulty,
                    spiceLevel: item.metadata?.spice_level,
                    activities: item.metadata?.activities
                };
            });

            setRealItems(formatted);

            // Handle deep linking from Home Page or shared links
            const params = new URLSearchParams(window.location.search);
            const expId = params.get('exp');
            if (expId) {
                const targetExp = formatted.find(item => item.id === expId);
                if (targetExp) {
                    setSelectedExp(targetExp);
                    setIsDetailOpen(true);
                }
            }
        } catch (error) {
            console.error("Error fetching contributions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setHasMounted(true);
        fetchContributions();
    }, [countryId]);

    const toggleLike = async (id: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        const isCurrentlyLiked = likedItems[id];
        const numericId = typeof id === 'string' && id.startsWith('real-') ? id.replace('real-', '') : id;

        // Optimistic UI update
        const increment = isCurrentlyLiked ? -1 : 1;
        setLikedItems(prev => ({ ...prev, [id]: !isCurrentlyLiked }));

        setRealItems(prev => prev.map(item =>
            item.id === id ? { ...item, likes: Math.max(0, item.likes + increment) } : item
        ));

        if (selectedExp && selectedExp.id === id) {
            setSelectedExp((prev: any) => ({ ...prev, likes: Math.max(0, prev.likes + increment) }));
        }

        // Persist to DB if it's a real item
        if (typeof id === 'string' && id.startsWith('real-')) {
            const sessionId = getSessionId();
            try {
                // 1. Update the counter via RPC
                const { error: rpcError } = await supabase.rpc('toggle_contribution_like', {
                    target_id: numericId,
                    increment_val: increment
                });

                if (rpcError) {
                    // Fallback to simpler update if RPC isn't available yet or fails
                    const { data: item } = await supabase.from('contributions').select('likes_count').eq('id', numericId).single();
                    await supabase.from('contributions').update({
                        likes_count: Math.max(0, (item?.likes_count || 0) + increment)
                    }).eq('id', numericId);
                }

                // 2. Add/Remove from likes table
                if (!isCurrentlyLiked) {
                    await supabase.from('likes').insert({
                        user_id: sessionId,
                        contribution_id: numericId
                    });
                } else {
                    await supabase.from('likes')
                        .delete()
                        .match({ user_id: sessionId, contribution_id: numericId });
                }
            } catch (err) {
                console.error("Error persisting like:", err);
            }
        }
    };

    const toggleSave = (id: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const openDetail = (item: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedExp(item);
        setIsDetailOpen(true);
    };

    const allItems = realItems;

    if (!hasMounted) return <div className="min-h-[400px]" />;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-notion-text-light opacity-60">
                    Community Picks
                </h3>
                <button
                    onClick={fetchContributions}
                    className="p-2 rounded-full hover:bg-notion-bg-secondary transition-colors group"
                >
                    <RefreshCw className={`h-4 w-4 text-notion-text-light group-hover:text-notion-text ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Masonry Grid */}
            <div className="columns-2 gap-4 sm:columns-3 space-y-4">
                {/* Always show Add Your Experience Card */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    className="break-inside-avoid flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-notion-border bg-notion-bg-secondary hover:bg-white transition-all text-notion-text-light hover:text-notion-text hover:border-notion-text/20 group mb-4"
                >
                    <Plus className="h-8 w-8 mb-2 transition-transform group-hover:scale-125" />
                    <p className="text-xs font-bold uppercase tracking-widest text-center px-4">Share Your Experience</p>
                </div>

                {/* Skeleton Loader Grid */}
                {isLoading ? (
                    <>
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={`skeleton-${i}`}
                                className={`break-inside-avoid rounded-xl bg-notion-bg-secondary/50 animate-pulse mb-4 ${i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]'
                                    }`}
                            >
                                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {/* Real Items */}
                        {allItems.map((item) => {
                            const Icon = categoryIcons[item.category];
                            const isLiked = likedItems[item.id];
                            const isSaved = savedItems[item.id];

                            return (
                                <div
                                    key={item.id}
                                    onClick={(e) => openDetail(item, e)}
                                    className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-xl border border-notion-border bg-notion-bg-secondary transition-all hover:shadow-2xl shadow-notion-text/10 mb-4"
                                >
                                    {/* Media (Image or Video) */}
                                    {item.isVideo ? (
                                        <video
                                            src={item.img}
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-auto"
                                            onMouseOver={(e) => e.currentTarget.play()}
                                            onMouseOut={(e) => e.currentTarget.pause()}
                                        />
                                    ) : (
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className="w-full h-auto"
                                        />
                                    )}

                                    {/* Category Badge */}
                                    <div className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold text-white shadow-lg ${categoryColors[item.category] || 'bg-gray-500'} uppercase tracking-tighter`}>
                                        {Icon && <Icon className="h-3 w-3" />}
                                        {categoryLabels[item.category] || 'Must See'}
                                    </div>

                                    {/* Content & Social Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <p className="text-sm font-bold text-white uppercase tracking-tight mb-3">{item.title}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={(e) => toggleLike(item.id, e)}
                                                    className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'text-white hover:text-red-400'}`}
                                                >
                                                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500' : 'fill-white'}`} />
                                                    <span className="text-[10px] font-bold text-white">{item.likes}</span>
                                                </button>
                                                <button
                                                    onClick={(e) => openDetail(item, e)}
                                                    className="flex items-center gap-1 text-white hover:text-blue-400 transition-colors"
                                                >
                                                    <MessageSquare className="h-4 w-4 fill-white" />
                                                    <span className="text-[10px] font-bold">{item.comments}</span>
                                                </button>
                                            </div>
                                            <button
                                                onClick={(e) => toggleSave(item.id, e)}
                                                className={`transition-colors ${isSaved ? 'text-yellow-400' : 'text-white hover:text-yellow-400'}`}
                                            >
                                                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-yellow-400' : 'fill-white'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Ghost Card (Only if no real items and NOT loading) */}
                        {allItems.length === 0 && (
                            <div className="break-inside-avoid group relative overflow-hidden rounded-xl border border-notion-border bg-notion-bg-secondary/40 p-6 text-center mb-4 aspect-square flex flex-col items-center justify-center animate-in fade-in duration-700">
                                <div className="h-14 w-14 mb-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-notion-border text-notion-text-light opacity-20">
                                    <MapPin className="h-7 w-7" />
                                </div>

                                <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-notion-text mb-3 px-4">
                                    Waiting for discovery
                                </h4>
                                <p className="text-xs text-notion-text-light opacity-60 leading-relaxed max-w-[180px] mx-auto">
                                    Be the first to share a hidden gem in {countryName}
                                </p>

                                {/* Faded Social Overlay to mimic real items */}
                                <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between opacity-5">
                                    <div className="flex gap-3">
                                        <Heart className="h-3 w-3" />
                                        <MessageSquare className="h-3 w-3" />
                                    </div>
                                    <Bookmark className="h-3 w-3" />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>


            <ContributionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    fetchContributions(); // Refresh after adding
                }}
                countryName={countryName}
            />

            <ExperienceDetail
                experience={selectedExp ? {
                    id: selectedExp.id,
                    title: selectedExp.title,
                    description: selectedExp.description,
                    image_url: selectedExp.img, // Mapping 'img' back to 'image_url' for the detail view
                    country_id: countryId,
                    category: selectedExp.category,
                    likes_count: selectedExp.likes,
                    metadata: {
                        location: selectedExp.location,
                        budget: selectedExp.budget,
                        difficulty: selectedExp.difficulty,
                        spice_level: selectedExp.spiceLevel,
                        activities: selectedExp.activities
                    }
                } : null}
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    // Clear the experience ID from URL to prevent it from re-opening
                    if (typeof window !== 'undefined') {
                        const url = new URL(window.location.href);
                        if (url.searchParams.has('exp')) {
                            url.searchParams.delete('exp');
                            window.history.replaceState({}, '', url.toString());
                        }
                    }
                    fetchContributions(); // Refresh counts when closing detail view
                }}
                isLiked={selectedExp ? likedItems[selectedExp.id] : false}
                isSaved={selectedExp ? savedItems[selectedExp.id] : false}
                onLike={(e) => selectedExp && toggleLike(selectedExp.id, e)}
                onSave={(e) => selectedExp && toggleSave(selectedExp.id, e)}
                relatedItems={allItems.filter(item => item.id !== selectedExp?.id).map(item => ({
                    ...item,
                    image_url: item.img // Mapping 'img' to 'image_url' for related items too
                }))}
                onSelectExperience={(item: any) => setSelectedExp(item)}
                countryName={countryName}
            />
        </div>
    );
}
