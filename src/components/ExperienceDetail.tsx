import { X, Heart, MessageSquare, Bookmark, Send, User, Share2, MoreHorizontal, ChevronLeft, Maximize2, RefreshCw, MapPin, DollarSign, Zap, Flame, Compass, CornerDownRight, Loader2, Utensils } from "lucide-react";
import { getCurrencySymbol } from "@/utils/currency";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "./Toast";
import Toast from "./Toast";

interface ExperienceDetailProps {
    experience: {
        id: string;
        title: string;
        description: string;
        image_url: string;
        country_id: string;
        category: string;
        likes_count: number;
        metadata?: any;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    isLiked: boolean;
    isSaved: boolean;
    onLike: (e: React.MouseEvent) => void;
    onSave: (e: React.MouseEvent) => void;
    relatedItems?: any[];
    onSelectExperience: (experience: any) => void;
    countryName: string;
}

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
    const { toast, showToast, hideToast } = useToast();
    const [showComments, setShowComments] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [replyingToName, setReplyingToName] = useState<string | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(true);

    // Fetch comments from Supabase
    useEffect(() => {
        if (!isOpen || !experience) return;

        const fetchComments = async () => {
            setIsLoadingComments(true);
            try {
                // Get the real DB ID (stripping 'real-' prefix if present)
                const dbId = typeof experience.id === 'string' && experience.id.startsWith('real-')
                    ? experience.id.replace('real-', '')
                    : experience.id;

                const { data, error } = await supabase
                    .from('comments')
                    .select('*')
                    .eq('contribution_id', dbId)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                // Organize comments into threads
                const commentMap: any = {};
                const topLevelComments: any[] = [];

                data?.forEach(comment => {
                    const formatted = {
                        id: comment.id,
                        user: comment.author_name || "Anonymous",
                        text: comment.content,
                        time: new Date(comment.created_at).toLocaleDateString(),
                        replies: []
                    };
                    commentMap[comment.id] = formatted;

                    if (comment.parent_id) {
                        if (commentMap[comment.parent_id]) {
                            commentMap[comment.parent_id].replies.push(formatted);
                        }
                    } else {
                        topLevelComments.push(formatted);
                    }
                });

                setComments(topLevelComments.reverse()); // Newest first
            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setIsLoadingComments(false);
            }
        };

        fetchComments();
    }, [isOpen, experience]);

    if (!isOpen || !experience) return null;

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const dbId = typeof experience.id === 'string' && experience.id.startsWith('real-')
                ? experience.id.replace('real-', '')
                : experience.id;

            const insertData: any = {
                contribution_id: dbId,
                content: newComment,
                author_name: "You"
            };

            if (replyToId) {
                insertData.parent_id = replyToId;
            }

            const { data, error } = await supabase
                .from('comments')
                .insert([insertData])
                .select();

            if (error) throw error;

            const savedComment = data?.[0];
            const newCommentObj = {
                id: savedComment.id,
                user: savedComment.author_name,
                text: savedComment.content,
                time: "Just now",
                replies: []
            };

            if (replyToId) {
                setComments(comments.map(c => {
                    if (c.id === replyToId) {
                        return { ...c, replies: [...(c.replies || []), newCommentObj] };
                    }
                    return c;
                }));
                setReplyToId(null);
                setReplyingToName(null);
            } else {
                setComments([newCommentObj, ...comments]);
            }
            setNewComment("");
        } catch (error: any) {
            console.error("Error posting comment:", error);
            const errorMessage = error.message || "Unknown error";
            showToast(`Failed to post comment: ${errorMessage}`, "error");
        }
    };

    const startReply = (commentId: any, userName: string) => {
        setReplyToId(commentId);
        setReplyingToName(userName);
        setNewComment("");
    };

    const cancelReply = () => {
        setReplyToId(null);
        setReplyingToName(null);
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
                                    <span className="text-sm font-bold">{experience.likes_count}</span>
                                </button>

                                <button className="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-full transition-colors text-notion-text">
                                    <MessageSquare className="h-5 w-5 fill-black" />
                                    <span className="text-sm font-bold">{isLoadingComments ? "..." : (comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0))}</span>
                                </button>

                                <button
                                    onClick={onSave}
                                    className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${isSaved ? 'text-yellow-500' : 'text-notion-text'}`}
                                >
                                    <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-yellow-500' : 'fill-black'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Main Image/Video Content */}
                        <div className="relative group px-0 sm:px-6 pb-4 cursor-default">
                            <div className="relative overflow-hidden sm:rounded-3xl bg-white flex items-center justify-center shadow-inner">
                                {experience?.image_url?.match(/\.(mp4|webm|ogg|mov)$|^data:video/i) || (experience as any).isVideo ? (
                                    <video
                                        src={experience.image_url}
                                        className="w-full h-auto max-h-[none] lg:max-h-[75vh] object-contain shadow-2xl block"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={experience.image_url}
                                        alt={experience.title}
                                        className="w-full h-auto max-h-[none] lg:max-h-[75vh] object-contain shadow-2xl block"
                                    />
                                )}

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
                                {experience.metadata?.location && (
                                    <DetailBadge icon={MapPin} label="Location" value={experience.metadata.location} />
                                )}
                                {experience.metadata?.budget && (
                                    <DetailBadge icon={DollarSign} label="Cost" value={`${getCurrencySymbol(countryName)}${experience.metadata.budget}`} />
                                )}
                                {experience.metadata?.difficulty && (
                                    <DetailBadge icon={Zap} label="Difficulty" value={experience.metadata.difficulty} />
                                )}
                                {experience.metadata?.spice_level && (
                                    <DetailBadge icon={Flame} label="Spice Level" value={experience.metadata.spice_level} />
                                )}
                                {experience.metadata?.activities && (
                                    <DetailBadge icon={Compass} label="Activities" value={experience.metadata.activities} />
                                )}
                            </div>

                            {/* Author Information */}
                            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                                <div className="h-12 w-12 rounded-full bg-notion-bg-secondary flex items-center justify-center border border-gray-100">
                                    <User className="h-6 w-6 text-notion-text-light" />
                                </div>
                                <div>
                                    <p className="font-bold text-notion-text leading-none">Global Adventurer</p>
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
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {isLoadingComments ? (
                                                [1, 2].map(i => (
                                                    <div key={i} className="flex gap-3 animate-pulse">
                                                        <div className="h-8 w-8 rounded-full bg-notion-bg-secondary" />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-3 w-20 bg-notion-bg-secondary rounded" />
                                                            <div className="h-3 w-full bg-notion-bg-secondary rounded" />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : comments.length > 0 ? (
                                                comments.map((comment) => (
                                                    <div key={comment.id} className="space-y-4">
                                                        <div className="flex gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-notion-bg-secondary flex items-center justify-center flex-shrink-0">
                                                                <User className="h-4 w-4 text-notion-text-light" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold text-notion-text">{comment.user}</span>
                                                                    <span className="text-xs text-notion-text-light">{comment.time}</span>
                                                                    <button
                                                                        onClick={() => startReply(comment.id, comment.user)}
                                                                        className="text-[10px] font-bold text-blue-500 uppercase tracking-wider hover:underline transition-colors"
                                                                    >
                                                                        Reply
                                                                    </button>
                                                                </div>
                                                                <p className="text-sm text-notion-text mt-1 leading-relaxed">{comment.text}</p>
                                                            </div>
                                                        </div>

                                                        {/* Nested Replies */}
                                                        {comment.replies && comment.replies.length > 0 && (
                                                            <div className="ml-11 border-l-2 border-gray-100 pl-4 space-y-4">
                                                                {comment.replies.map((reply: any) => (
                                                                    <div key={reply.id} className="flex gap-3">
                                                                        <div className="h-6 w-6 rounded-full bg-notion-bg-secondary flex items-center justify-center flex-shrink-0">
                                                                            <User className="h-3 w-3 text-notion-text-light" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs font-bold text-notion-text">{reply.user}</span>
                                                                                <span className="text-[10px] text-notion-text-light">{reply.time}</span>
                                                                            </div>
                                                                            <p className="text-xs text-notion-text mt-1 leading-relaxed">{reply.text}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 opacity-40">
                                                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">No comments yet. Start the conversation!</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Comment input at bottom */}
                                        <div className="pt-6 border-t border-gray-100 mt-4">
                                            {replyToId && (
                                                <div className="flex items-center justify-between mb-2 px-1">
                                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                                        Replying to {replyingToName}
                                                    </span>
                                                    <button onClick={cancelReply} className="text-[10px] font-bold text-notion-text-light hover:text-red-500 flex items-center gap-1">
                                                        <X className="h-3 w-3" /> Cancel
                                                    </button>
                                                </div>
                                            )}
                                            <form onSubmit={handleCommentSubmit} className="flex items-start gap-3">
                                                <div className="h-9 w-9 rounded-full bg-notion-bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <User className="h-5 w-5 text-notion-text-light" />
                                                </div>
                                                <div className="relative flex-1">
                                                    <textarea
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder={replyToId ? "Write a reply..." : "Add a comment"}
                                                        rows={1}
                                                        className="w-full rounded-2xl bg-gray-50 px-5 py-3 text-sm text-notion-text outline-none focus:ring-2 focus:ring-blue-100 transition-all border border-transparent focus:bg-white focus:border-gray-200 resize-none min-h-[44px] overflow-hidden"
                                                        onInput={(e) => {
                                                            const target = e.target as HTMLTextAreaElement;
                                                            target.style.height = "auto";
                                                            target.style.height = `${target.scrollHeight}px`;
                                                        }}
                                                    />
                                                    <button
                                                        type="submit"
                                                        className={`absolute right-3 top-[22px] -translate-y-1/2 transition-all p-1.5 rounded-full ${newComment ? 'text-blue-500 hover:bg-blue-50' : 'text-notion-text-light opacity-0 pointer-events-none'}`}
                                                    >
                                                        <Send className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
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
                        {relatedItems.map((item) => {
                            const isVideo = item.image_url?.match(/\.(mp4|webm|ogg|mov)$|^data:video/i);
                            const Icon = categoryIcons[item.category];
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onSelectExperience?.(item)}
                                    className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-xl border border-notion-border bg-notion-bg-secondary transition-all hover:shadow-xl shadow-notion-text/10"
                                >
                                    {/* Media */}
                                    {isVideo ? (
                                        <video
                                            src={item.image_url}
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-auto"
                                        />
                                    ) : (
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="w-full h-auto"
                                        />
                                    )}

                                    {/* Category Badge */}
                                    <div className={`absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold text-white shadow-lg ${categoryColors[item.category] || 'bg-gray-500'} uppercase tracking-tight`}>
                                        {Icon && <Icon className="h-3 w-3" />}
                                        {categoryLabels[item.category] || 'Must See'}
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <p className="text-xs font-bold text-white uppercase tracking-tight mb-3 line-clamp-1">{item.title}</p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <Heart className="h-3.5 w-3.5 fill-white text-white" />
                                                <span className="text-[10px] font-bold text-white">{item.likes_count || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MessageSquare className="h-3.5 w-3.5 fill-white text-white" />
                                                <span className="text-[10px] font-bold text-white">{(item as any).comments_count || (item as any).comments || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
