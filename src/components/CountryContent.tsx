"use client";

import { useState } from "react";
import { Utensils, Compass, MapPin, Plus, Heart, MessageSquare, Bookmark } from "lucide-react";
import ContributionModal from "./ContributionModal";
import ExperienceDetail from "./ExperienceDetail";

interface CountryContentProps {
    countryName: string;
}

type Category = "eat" | "do" | "visit";

export default function CountryContent({ countryName }: CountryContentProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});
    const [savedItems, setSavedItems] = useState<Record<number, boolean>>({});

    // State for Experience Detail Modal
    const [selectedExp, setSelectedExp] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const toggleLike = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSave = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const openDetail = (item: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedExp(item);
        setIsDetailOpen(true);
    };

    // Consolidated data for the masonry gallery
    const placeholderItems = [
        {
            id: 1,
            title: "Traditional Dish",
            category: "eat" as const,
            author: "Traveler_A",
            img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
            likes: 24,
            comments: 5,
            description: "Tried this local specialty at a hidden market. The spices were perfectly balanced and it felt so authentic!",
            location: "Kyoto Central Market",
            budget: "1200",
            spiceLevel: "Mild"
        },
        {
            id: 3,
            title: "Mountain Hiking",
            category: "do" as const,
            author: "Explorer_C",
            img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
            likes: 42,
            comments: 12,
            description: "A challenging but rewarding hike. The view from the top is absolutely breathtaking. Make sure to bring enough water!",
            location: "Mount Fuji, 5th Station",
            budget: "0",
            difficulty: "Hard"
        },
        {
            id: 2,
            title: "Street Food Market",
            category: "eat" as const,
            author: "Local_B",
            img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
            likes: 18,
            comments: 3,
            description: "The energy here is amazing! You can find almost anything. My favorite was the grilled octopus skewer.",
            location: "Osaka Dotonbori",
            budget: "500",
            spiceLevel: "None"
        },
        {
            id: 5,
            title: "Iconic Bridge",
            category: "visit" as const,
            author: "City_E",
            img: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80",
            likes: 56,
            comments: 8,
            description: "Best at sunset when the lights start to twinkle. Great spot for photography, though it can get crowded.",
            location: "Tokyo, Odaiba",
            budget: "0",
            activities: "Photography, Walking"
        },
        {
            id: 4,
            title: "Local Festival",
            category: "do" as const,
            author: "Culture_D",
            img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
            likes: 31,
            comments: 7,
            description: "Such a vibrant celebration of culture. The music, the dances, the costumes—everything was just spectacular.",
            location: "Kyoto, Gion District",
            budget: "3000",
            difficulty: "Easy"
        },
        {
            id: 6,
            title: "Ancient Temple",
            category: "visit" as const,
            author: "History_F",
            img: "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=800&q=80",
            likes: 89,
            comments: 15,
            description: "A place of immense peace and history. The carvings on the walls tell such detailed stories of the past.",
            location: "Nara Park",
            budget: "600",
            activities: "Meditation, Sightseeing"
        },
    ];

    const categoryIcons = {
        eat: Utensils,
        do: Compass,
        visit: MapPin
    };

    const categoryColors = {
        eat: "bg-orange-500",
        do: "bg-blue-500",
        visit: "bg-green-500"
    };

    const categoryLabels = {
        eat: "Must Eat",
        do: "Must Do",
        visit: "Must Visit"
    };

    return (
        <div className="space-y-8">
            {/* Pinterest-style Masonry Grid */}
            <div className="columns-2 gap-4 sm:columns-3 space-y-4">
                {/* Add Your Experience Placeholder */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    className="break-inside-avoid flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-notion-border bg-notion-bg-secondary hover:bg-white transition-all text-notion-text-light hover:text-notion-text hover:border-notion-text/20 group mb-4"
                >
                    <Plus className="h-8 w-8 mb-2 transition-transform group-hover:scale-125" />
                    <p className="text-xs font-bold uppercase tracking-widest text-center px-4">Share Your Experience</p>
                </div>

                {placeholderItems.map((item) => {
                    const Icon = categoryIcons[item.category];
                    const isLiked = likedItems[item.id];
                    const isSaved = savedItems[item.id];

                    return (
                        <div
                            key={item.id}
                            onClick={(e) => openDetail(item, e)}
                            className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-xl border border-notion-border bg-notion-bg-secondary transition-all hover:shadow-2xl shadow-notion-text/10 mb-4"
                        >
                            <img
                                src={item.img}
                                alt={item.title}
                                className="w-full h-auto"
                            />

                            {/* Category Badge */}
                            <div className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold text-white shadow-lg ${categoryColors[item.category]} uppercase tracking-tighter`}>
                                <Icon className="h-3 w-3" />
                                {categoryLabels[item.category]}
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
                                            <span className="text-[10px] font-bold text-white">{item.likes + (isLiked ? 1 : 0)}</span>
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
            </div>


            <ContributionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                countryName={countryName}
            />

            <ExperienceDetail
                experience={selectedExp}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                isLiked={selectedExp ? likedItems[selectedExp.id] : false}
                isSaved={selectedExp ? savedItems[selectedExp.id] : false}
                onLike={(e) => selectedExp && toggleLike(selectedExp.id, e)}
                onSave={(e) => selectedExp && toggleSave(selectedExp.id, e)}
                relatedItems={placeholderItems.filter(item => item.id !== selectedExp?.id)}
                onSelectExperience={(item: any) => setSelectedExp(item)}
                countryName={countryName}
            />
        </div>
    );
}
