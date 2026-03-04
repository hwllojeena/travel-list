import { X, Heart, MessageSquare, Bookmark, Send, User, Share2, MoreHorizontal, ChevronLeft, Maximize2, RefreshCw, MapPin, DollarSign, Zap, Flame, Compass } from "lucide-react";
import { getCurrencySymbol } from "@/utils/currency";
import { useState } from "react";

interface Comment {
    id: number;
    user: string;
    text: string;
    time: string;
}

interface ExperienceDetailProps {
    experience: {
        id: number;
        title: string;
        category: "eat" | "do" | "visit";
        author: string;
        img: string;
        likes: number;
        comments: number;
        description?: string;
        location?: string;
        budget?: string;
        difficulty?: string;
        spiceLevel?: string;
        activities?: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    isLiked: boolean;
    isSaved: boolean;
    onLike: (e: React.MouseEvent) => void;
    onSave: (e: React.MouseEvent) => void;
    relatedItems?: any[];
    onSelectExperience?: (experience: any) => void;
    countryName: string;
}

export default function ExperienceDetail({
    experience,
    isOpen,
    onClose,
    isLiked,
    isSaved,
    onLike,
    onSave,
    relatedItems = [],
    onSelectExperience,
    countryName
}: ExperienceDetailProps) {
    const [newComment, setNewComment] = useState("");
    const [showComments, setShowComments] = useState(true);

    // Mock comments
    const [comments, setComments] = useState<Comment[]>([
        { id: 1, user: "Traveler_A", text: "This looks absolutely amazing! Thanks for sharing.", time: "2h ago" },
        { id: 2, user: "Explorer_Jim", text: "I've been there last year, highly recommended!", time: "5h ago" },
    ]);

    if (!isOpen || !experience) return null;

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now(),
            user: "You",
            text: newComment,
            time: "Just now"
        };

        setComments([comment, ...comments]);
        setNewComment("");
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[110] flex items-start justify-center bg-white sm:bg-gray-50/90 sm:backdrop-blur-md overflow-y-auto p-0 sm:p-12 cursor-pointer"
        >
            <div
                className="relative flex flex-col lg:flex-row w-full max-w-[1200px] gap-8 items-start pb-20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Side: Detail Card */}
                <div className="w-full lg:w-[65%] flex flex-col sm:animate-in sm:fade-in sm:slide-in-from-bottom-4 duration-500 cursor-default">
                    <div className="bg-white sm:rounded-[32px] overflow-hidden sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border sm:border-gray-100 flex flex-col">
                        {/* Pinterest-Style Top Bar */}
                        <div className="flex items-center justify-between p-4 sm:px-6 sm:py-4">
                            <div className="flex items-center gap-4">
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-notion-text">
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="flex items-center gap-0 sm:gap-1">
                                <button
                                    onClick={onLike}
                                    className={`flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-full transition-colors ${isLiked ? 'text-red-500' : 'text-notion-text'}`}
                                >
                                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500' : 'fill-black'}`} />
                                    <span className="text-sm font-bold">{experience.likes + (isLiked ? 1 : 0)}</span>
                                </button>

                                <button className="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-full transition-colors text-notion-text">
                                    <MessageSquare className="h-5 w-5 fill-black" />
                                    <span className="text-sm font-bold">2</span>
                                </button>

                                <button
                                    onClick={onSave}
                                    className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${isSaved ? 'text-yellow-500' : 'text-notion-text'}`}
                                >
                                    <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-yellow-500' : 'fill-black'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Main Image Content */}
                        <div className="relative group px-0 sm:px-6 pb-4">
                            <div className="relative overflow-hidden sm:rounded-3xl bg-white flex items-center justify-center">
                                <img
                                    src={experience.img}
                                    alt={experience.title}
                                    className="w-full h-auto max-h-[none] lg:max-h-[70vh] object-cover sm:object-contain"
                                />

                                {/* Overlay Controls */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="bg-white/90 backdrop-blur p-2.5 rounded-full shadow-lg hover:bg-white text-notion-text transition-colors">
                                        <Maximize2 className="h-5 w-5" />
                                    </button>
                                    <button className="bg-white/90 backdrop-blur p-2.5 rounded-full shadow-lg hover:bg-white text-notion-text transition-colors">
                                        <RefreshCw className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Text & Comments Side (Mobile: Below, Desktop: Same Card) */}
                        <div className="flex flex-col p-6 sm:px-8 sm:pb-8">
                            <h2 className="text-3xl font-bold tracking-tight text-notion-text mb-4 leading-tight">{experience.title}</h2>
                            <p className="text-base text-notion-text-light mb-8 leading-relaxed">
                                {experience.description || "No specific tips shared yet. Just enjoy the amazing view and culture!"}
                            </p>

                            {/* Shared Metadata Details */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-10 p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                                {experience.location && (
                                    <DetailBadge icon={MapPin} label="Location" value={experience.location} />
                                )}
                                {experience.budget && (
                                    <DetailBadge icon={DollarSign} label="Cost" value={`${getCurrencySymbol(countryName)}${experience.budget}`} />
                                )}
                                {experience.difficulty && (
                                    <DetailBadge icon={Zap} label="Difficulty" value={experience.difficulty} />
                                )}
                                {experience.spiceLevel && (
                                    <DetailBadge icon={Flame} label="Spice Level" value={experience.spiceLevel} />
                                )}
                                {experience.activities && (
                                    <DetailBadge icon={Compass} label="Activities" value={experience.activities} />
                                )}
                            </div>

                            {/* Author Information */}
                            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                                <div className="h-12 w-12 rounded-full bg-notion-bg-secondary flex items-center justify-center border border-gray-100">
                                    <User className="h-6 w-6 text-notion-text-light" />
                                </div>
                                <div>
                                    <p className="font-bold text-notion-text leading-none">{experience.author}</p>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="space-y-6">
                                <div
                                    className="flex items-center justify-between cursor-pointer group/header"
                                    onClick={() => setShowComments(!showComments)}
                                >
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-notion-text-light group-hover/header:text-blue-500 transition-colors">
                                        Comments ({comments.length})
                                    </h3>
                                    <ChevronLeft className={`h-4 w-4 transition-transform duration-300 text-notion-text-light ${showComments ? '-rotate-90' : 'rotate-180'}`} />
                                </div>

                                {showComments && (
                                    <>
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {comments.map((comment) => (
                                                <div key={comment.id} className="flex gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-notion-bg-secondary flex items-center justify-center flex-shrink-0">
                                                        <User className="h-4 w-4 text-notion-text-light" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-notion-text">{comment.user}</span>
                                                            <span className="text-xs text-notion-text-light">{comment.time}</span>
                                                        </div>
                                                        <p className="text-sm text-notion-text mt-1 leading-relaxed">{comment.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Comment input at bottom */}
                                        <form onSubmit={handleCommentSubmit} className="pt-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-notion-bg-secondary flex items-center justify-center flex-shrink-0">
                                                    <User className="h-6 w-6 text-notion-text-light" />
                                                </div>
                                                <div className="relative flex-1">
                                                    <input
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Add a comment"
                                                        className="w-full rounded-2xl bg-gray-50 px-5 py-3 text-sm text-notion-text outline-none focus:ring-2 focus:ring-blue-100 transition-all border border-transparent focus:bg-white focus:border-gray-200"
                                                    />
                                                    <button
                                                        type="submit"
                                                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all p-1.5 rounded-full ${newComment ? 'text-blue-500 hover:bg-blue-50' : 'text-notion-text-light opacity-0 pointer-events-none'}`}
                                                    >
                                                        <Send className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Related Suggestions */}
                <div className="w-full lg:w-[35%] flex flex-col cursor-default px-4 lg:px-0">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-notion-text-light mb-6">More like this</h3>

                    <div className="columns-2 gap-4 space-y-4">
                        {relatedItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onSelectExperience?.(item)}
                                className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)]"
                            >
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                        ))}
                    </div>

                    {/* Footer / More button */}
                    <div className="mt-8 flex justify-center text-center">
                        <button className="bg-notion-bg-secondary hover:bg-gray-200 px-6 py-2.5 rounded-full font-bold text-notion-text transition-colors text-[10px] uppercase tracking-widest">
                            Show more related experiences in {countryName}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailBadge({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-notion-text-light opacity-60">
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <p className="text-sm font-bold text-notion-text leading-tight">{value}</p>
        </div>
    );
}
