"use client";

import { MapContainer, GeoJSON, ZoomControl, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import { useRouter } from "next/navigation";

export default function TravelMap() {
    const [geoData, setGeoData] = useState<any>(null);
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetch("/world.json")
            .then((res) => res.json())
            .then((data) => setGeoData(data));

        // Clean up leaflet container style
        const container = document.querySelector(".leaflet-container");
        if (container) {
            (container as HTMLElement).style.backgroundColor = "transparent";
        }
    }, []);

    const countryStyle = (feature: any) => {
        const isHovered = hoveredCountry === feature.properties.name;
        return {
            fillColor: isHovered ? "#a3a3a3" : "#e5e5e5",
            weight: 0.5,
            opacity: 1,
            color: "#ffffff",
            fillOpacity: 1,
        };
    };

    const onEachCountry = (feature: any, layer: any) => {
        layer.on({
            mouseover: (e: any) => {
                setHoveredCountry(feature.properties.name);
                e.target.setStyle({
                    fillColor: "#a3a3a3",
                });
            },
            mouseout: (e: any) => {
                setHoveredCountry(null);
                e.target.setStyle({
                    fillColor: "#e5e5e5",
                });
            },
            click: () => {
                const countryId = feature.properties.name.toLowerCase().replace(/\s+/g, '-');
                router.push(`/country/${countryId}`);
            },
        });
    };

    return (
        <div className="relative h-full w-full bg-white overflow-hidden">
            <MapContainer
                center={[20, 0]}
                zoom={2.5}
                minZoom={2}
                className="h-full w-full"
                zoomControl={false}
                scrollWheelZoom={true}
                dragging={true}
                touchZoom={true}
                style={{ background: "#ffffff" }}
                maxBounds={[
                    [-90, -180],
                    [90, 180],
                ]}
                maxBoundsViscosity={1.0}
            >
                {geoData && (
                    <GeoJSON
                        data={geoData}
                        style={countryStyle}
                        onEachFeature={onEachCountry}
                    />
                )}
                <ZoomControl position="bottomright" />
            </MapContainer>

            {/* Bottom Center Country Display */}
            {hoveredCountry && (
                <div className="absolute bottom-10 left-1/2 z-[1000] -translate-x-1/2">
                    <div className="rounded-md border border-zinc-200 bg-white px-6 py-2 shadow-sm backdrop-blur-md">
                        <span className="text-sm font-semibold tracking-tight text-zinc-800">
                            {hoveredCountry}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
