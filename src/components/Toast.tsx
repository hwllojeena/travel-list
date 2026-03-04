"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
}

export default function Toast({ message, type, isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-none">
            <div className={`
                flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md pointer-events-auto
                ${type === "success" ? "bg-white/90 border-green-100 text-green-800" : ""}
                ${type === "error" ? "bg-white/90 border-red-100 text-red-800" : ""}
                ${type === "info" ? "bg-white/90 border-blue-100 text-blue-800" : ""}
            `}>
                {type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {type === "error" && <XCircle className="h-5 w-5 text-red-500" />}

                <p className="text-sm font-bold tracking-tight">{message}</p>

                <button
                    onClick={onClose}
                    className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                    <X className="h-4 w-4 opacity-50" />
                </button>
            </div>
        </div>
    );
}

export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false,
    });

    const showToast = (message: string, type: ToastType = "success") => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    return { toast, showToast, hideToast };
}
