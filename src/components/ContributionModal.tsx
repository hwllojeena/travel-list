"use client";

import { useState, useRef, useEffect } from "react";
import { X, Camera, Utensils, MapPin, Compass, ChevronRight, ChevronLeft, Globe, DollarSign, Clock, Zap, Flame, RefreshCw, Loader2 } from "lucide-react";
import { getCurrencySymbol } from "@/utils/currency";
import { supabase } from "@/lib/supabase";
import { useToast } from "./Toast";
import Toast from "./Toast";

interface ContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    countryName: string;
}

type Category = "eat" | "do" | "visit";


export default function ContributionModal({ isOpen, onClose, countryName }: ContributionModalProps) {
    const { toast, showToast, hideToast } = useToast();
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState<Category | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form data states
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        budget: "",
        difficulty: "",
        spiceLevel: "",
        activities: "",
    });
    const [isPublishing, setIsPublishing] = useState(false);

    const categories = [
        { id: "do", label: "An activity people must do", icon: Compass, color: "text-blue-500", bg: "bg-blue-50" },
        { id: "eat", label: "A food people must try", icon: Utensils, color: "text-orange-500", bg: "bg-orange-50" },
        { id: "visit", label: "A place people must visit", icon: MapPin, color: "text-green-500", bg: "bg-green-50" },
    ] as const;

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setCategory(null);
            setImage(null);
            setPreview(null);
            setFormData({
                title: "",
                description: "",
                location: "",
                budget: "",
                difficulty: "",
                spiceLevel: "",
                activities: ""
            });
        }
    }, [isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleNext = () => {
        if (category && image) setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !image) return;

        setIsPublishing(true);
        try {
            // 1. Upload media to Supabase Storage
            const fileExt = image.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const countrySlug = countryName.toLowerCase().replace(/\s+/g, '-');
            const filePath = `${countrySlug}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('travel-photos')
                .upload(filePath, image);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('travel-photos')
                .getPublicUrl(filePath);

            // 3. Save contribution to Database
            const { error: insertError } = await supabase
                .from('contributions')
                .insert([{
                    country_id: countryName.toLowerCase().replace(/\s+/g, '-'),
                    country_name: countryName,
                    category,
                    title: formData.title,
                    description: formData.description,
                    image_url: publicUrl,
                    author_name: "Anonymous",
                    metadata: {
                        location: formData.location,
                        budget: formData.budget,
                        difficulty: formData.difficulty,
                        spice_level: formData.spiceLevel,
                        activities: formData.activities
                    }
                }]);

            if (insertError) throw insertError;

            showToast(`Successfully shared your experience in ${countryName}!`, "success");

            // Wait a bit before closing so user sees the success toast
            setTimeout(() => {
                onClose();
                // Reset state
                setStep(1);
                setCategory(null);
                setImage(null);
                setPreview(null);
                setFormData({
                    title: "",
                    description: "",
                    location: "",
                    budget: "",
                    difficulty: "",
                    spiceLevel: "",
                    activities: ""
                });
            }, 1500);

        } catch (error: any) {
            console.error("Error publishing:", error);
            const errorMessage = error.message || "Unknown error";
            showToast(`Failed to publish: ${errorMessage}`, "error");
        } finally {
            setIsPublishing(false);
        }
    };

    if (!isOpen) return null;

    const currencySymbol = getCurrencySymbol(countryName);

    return (
        <div
            className="fixed inset-0 z-[140] flex items-start justify-center bg-white sm:bg-gray-50/90 sm:backdrop-blur-md overflow-y-auto p-0 sm:p-12 cursor-pointer"
            onClick={onClose}
        >
            <div
                className={`relative flex flex-col items-start pb-20 w-full transition-all duration-500 ${step === 2 ? 'max-w-[1200px] lg:flex-row gap-8' : 'max-w-2xl mx-auto'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {step === 1 ? (
                    /* Step 1: Initial Selection (Centered) */
                    <div className="relative w-full max-w-2xl mx-auto">
                        <div className="bg-white sm:rounded-[40px] overflow-hidden sm:shadow-[0_20px_50px_rgba(0,0,0,0.1)] sm:border sm:border-gray-100 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex items-center justify-between border-b border-notion-border p-6 px-10 bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    <h2 className="text-xs font-bold tracking-[0.2em] text-notion-text-light uppercase">
                                        Contributing to {countryName}
                                    </h2>
                                </div>
                            </div>

                            <div className="p-10 md:p-12 space-y-10">
                                <div className="space-y-4">
                                    <label className="text-3xl font-bold tracking-tight text-notion-text block">
                                        First, add a photo or video
                                    </label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`group relative w-full overflow-hidden rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer ${preview ? 'border-notion-text/10 bg-gray-50 shadow-inner p-2' : 'h-64 border-notion-border bg-notion-bg-secondary hover:border-notion-text/30 hover:bg-white'
                                            }`}
                                    >
                                        {preview ? (
                                            <>
                                                {image?.type.startsWith("video/") ? (
                                                    <video
                                                        src={preview}
                                                        className="w-full h-auto max-h-[65vh] object-contain rounded-[24px] pointer-events-none"
                                                        autoPlay
                                                        muted
                                                        loop
                                                        playsInline
                                                    />
                                                ) : (
                                                    <img src={preview} alt="Preview" className="w-full h-auto max-h-[65vh] object-contain rounded-[24px]" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm m-2 rounded-[24px]">
                                                    <div className="bg-white p-3 rounded-full shadow-lg">
                                                        <RefreshCw className="h-6 w-6 text-notion-text animate-spin-slow" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="h-10 w-10 text-notion-text-light group-hover:scale-110 transition-transform duration-300" />
                                                <div className="text-center mt-4">
                                                    <p className="text-sm font-bold text-notion-text">Click to upload media</p>
                                                    <p className="text-[10px] text-notion-text-light mt-1 uppercase tracking-[0.2em] font-medium">High resolution content</p>
                                                </div>
                                            </>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleImageChange} className="hidden" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-2xl font-bold tracking-tight text-notion-text block">
                                        What are you adding?
                                    </label>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                className={`flex flex-col items-center gap-3 rounded-[24px] border p-6 text-center transition-all duration-300 ${category === cat.id
                                                    ? "border-notion-text bg-notion-text/5 ring-4 ring-notion-text/5 shadow-inner"
                                                    : "border-notion-border hover:bg-notion-bg-secondary hover:border-notion-text/20"
                                                    }`}
                                            >
                                                <div className={`rounded-2xl p-3 flex-shrink-0 transition-all ${category === cat.id ? 'bg-white shadow-md scale-110' : cat.bg}`}>
                                                    <cat.icon className={`h-6 w-6 ${cat.color}`} />
                                                </div>
                                                <span className="text-[10px] font-bold text-notion-text uppercase tracking-widest leading-tight">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!category || !image}
                                    className="w-full h-13 flex items-center justify-center gap-3 rounded-[20px] bg-notion-text text-sm font-bold text-white transition-all hover:bg-black hover:shadow-lg disabled:opacity-20 disabled:cursor-not-allowed uppercase tracking-[0.3em] font-mono shadow-[0_5px_15px_rgba(0,0,0,0.1)]"
                                >
                                    Continue
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Standalone Close Button (Step 1) */}
                        <div className="absolute -top-16 right-0 animate-in fade-in duration-1000">
                            <button
                                onClick={onClose}
                                className="bg-white p-4 rounded-full shadow-2xl hover:bg-gray-50 transition-all active:scale-90 group"
                            >
                                <X className="h-6 w-6 text-notion-text group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Step 2: Split-Screen Detail View (Pinterest Style) */
                    <>
                        <div className="w-full lg:w-[65%] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="bg-white sm:rounded-[40px] overflow-hidden sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border sm:border-gray-100 flex flex-col">
                                {/* Top bar (mirroring detail view) */}
                                <div className="flex items-center justify-between p-4 px-8 border-b border-gray-50 bg-white/50 backdrop-blur-sm">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2 p-2 hover:bg-notion-bg-secondary rounded-full transition-colors group"
                                    >
                                        <ChevronLeft className="h-6 w-6 text-notion-text group-hover:-translate-x-1 transition-transform" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-notion-text">Edit Asset</span>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <div className={`rounded-lg p-2 ${categories.find(c => c.id === category)?.bg}`}>
                                            {category === 'eat' && <Utensils className="h-4 w-4 text-orange-500" />}
                                            {category === 'do' && <Compass className="h-4 w-4 text-blue-500" />}
                                            {category === 'visit' && <MapPin className="h-4 w-4 text-green-500" />}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-notion-text-light">
                                            {category === 'eat' ? 'Must Eat' : category === 'do' ? 'Must Do' : 'Must Visit'}
                                        </span>
                                    </div>
                                </div>

                                <div className="px-6 py-6 sm:px-10 pb-10">
                                    <div className="relative overflow-hidden rounded-[24px] bg-notion-bg-secondary group shadow-inner">
                                        {preview && (
                                            image?.type.startsWith("video/") ? (
                                                <video
                                                    src={preview}
                                                    className="w-full h-auto object-contain max-h-[75vh] shadow-2xl block"
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                />
                                            ) : (
                                                <img src={preview} alt="Asset" className="w-full h-auto object-contain max-h-[75vh] shadow-2xl block" />
                                            )
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-10 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60 mb-2 font-mono">Real-time Preview</p>
                                            <p className="text-xl font-bold tracking-tight truncate">{formData.title || "Your Experience Title"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-[35%] flex flex-col animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
                            <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 h-fit">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-1.5 group">
                                            <label className="text-[10px] font-black text-notion-text-light uppercase tracking-[0.3em] opacity-60">
                                                {category === "eat" ? "Food Name" : category === "do" ? "Activity Name" : "Place Name"}
                                            </label>
                                            <input
                                                required
                                                autoFocus
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="What should people know it as?"
                                                className="w-full text-base font-bold text-notion-text bg-gray-50/50 rounded-xl px-4 py-3 border-2 border-transparent focus:border-blue-500/10 outline-none transition-all focus:bg-white shadow-sm placeholder:text-gray-200"
                                            />
                                        </div>

                                        <div className="space-y-1.5 group">
                                            <label className="text-[10px] font-black text-notion-text-light uppercase tracking-[0.3em] opacity-60">Why is this a must?</label>
                                            <textarea
                                                required
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Describe the vibe, the taste, or the thrill..."
                                                className="min-h-[140px] w-full rounded-[24px] border-2 border-transparent bg-gray-50/50 px-5 py-4 text-sm text-notion-text outline-none focus:bg-white focus:border-blue-500/10 transition-all resize-none leading-relaxed shadow-sm scrollbar-hide"
                                            />
                                        </div>

                                        <div className="space-y-6 pt-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-notion-text-light/50 border-b border-gray-100 pb-3">Metadata Info</h4>

                                            {/* Category Specific Fields */}
                                            <div className="grid grid-cols-1 gap-5">
                                                {category === "do" && (
                                                    <>
                                                        <DetailInput icon={MapPin} label="Best place(s) to do this" value={formData.location} onChange={(val) => setFormData({ ...formData, location: val })} />
                                                        <DetailInput icon={DollarSign} label="Estimated budget" value={formData.budget} prefix={currencySymbol} onChange={(val) => setFormData({ ...formData, budget: val })} />
                                                        <DetailOptions icon={Zap} label="Difficulty" value={formData.difficulty} options={["Easy", "Med", "Hard"]} onChange={(val) => setFormData({ ...formData, difficulty: val })} />
                                                    </>
                                                )}

                                                {category === "eat" && (
                                                    <>
                                                        <DetailInput icon={Globe} label="Origin region" value={formData.location} onChange={(val) => setFormData({ ...formData, location: val })} />
                                                        <DetailInput icon={DollarSign} label="Est. price range" value={formData.budget} prefix={currencySymbol} onChange={(val) => setFormData({ ...formData, budget: val })} />
                                                        <DetailOptions icon={Flame} label="Spice level" value={formData.spiceLevel} options={["None", "Mild", "Hot", "Fire"]} onChange={(val) => setFormData({ ...formData, spiceLevel: val })} />
                                                    </>
                                                )}

                                                {category === "visit" && (
                                                    <>
                                                        <DetailInput icon={MapPin} label="Location (Region)" value={formData.location} onChange={(val) => setFormData({ ...formData, location: val })} />
                                                        <DetailInput icon={DollarSign} label="Entrance Fee" value={formData.budget} prefix={currencySymbol} onChange={(val) => setFormData({ ...formData, budget: val })} />
                                                        <DetailInput icon={Compass} label="Activities available" value={formData.activities} onChange={(val) => setFormData({ ...formData, activities: val })} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            type="submit"
                                            disabled={isPublishing || !formData.title.trim() || !formData.description.trim()}
                                            className="w-full h-13 rounded-[24px] bg-notion-text text-sm font-bold text-white transition-all hover:bg-black hover:scale-[1.01] active:scale-95 uppercase tracking-[0.2em] font-mono shadow-xl shadow-notion-text/10 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isPublishing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Publishing...
                                                </>
                                            ) : (
                                                "Publish"
                                            )}
                                        </button>
                                        <p className="text-center text-[9px] uppercase tracking-[0.3em] text-notion-text-light font-bold opacity-40">
                                            Curating {countryName} together
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Standalone Close Button (mirroring detail view) */}
                        <div className="absolute -top-16 right-0 lg:-right-4 animate-in fade-in duration-1000">
                            <button
                                onClick={onClose}
                                className="bg-white p-4 rounded-full shadow-2xl hover:bg-gray-50 transition-all active:scale-90 group"
                            >
                                <X className="h-6 w-6 text-notion-text group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                        </div>
                    </>
                )}
            </div>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    );
}

function DetailInput({ icon: Icon, label, value, prefix, onChange }: { icon: any, label: string, value: string, prefix?: string, onChange: (val: string) => void }) {
    return (
        <div className="space-y-1.5 group">
            <label className="text-[9px] font-black text-notion-text-light uppercase tracking-[0.2em] flex items-center gap-2 group-focus-within:text-blue-500 transition-colors opacity-60 group-focus-within:opacity-100">
                <Icon className="h-3 w-3" /> {label}
            </label>
            <div className="relative">
                {prefix && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-notion-text-light opacity-60">
                        {prefix}
                    </span>
                )}
                <input
                    className={`w-full text-sm font-bold text-notion-text bg-gray-50/50 rounded-xl ${prefix ? 'pl-10' : 'px-4'} py-3 border-2 border-transparent focus:border-blue-500/10 outline-none transition-all focus:bg-white shadow-sm`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}

function DetailOptions({ icon: Icon, label, value, options, onChange }: { icon: any, label: string, value: string, options: string[], onChange: (val: string) => void }) {
    return (
        <div className="space-y-1.5 group">
            <label className="text-[9px] font-black text-notion-text-light uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                <Icon className="h-3 w-3" /> {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${value === option
                            ? "bg-notion-text text-white shadow-md shadow-notion-text/20 scale-105"
                            : "bg-gray-50/50 text-notion-text-light hover:bg-gray-100 border border-transparent"
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}
