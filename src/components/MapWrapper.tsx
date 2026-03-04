"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/TravelMap"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-notion-bg-secondary text-notion-text-light">
            <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-notion-border border-t-notion-text" />
                <span className="text-xs font-medium">Loading map...</span>
            </div>
        </div>
    ),
});

export default function MapWrapper() {
    return <Map />;
}
