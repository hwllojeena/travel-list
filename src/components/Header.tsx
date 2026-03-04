"use client";

import Link from "next/link";
import { Search, Plus, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { countryMapping } from "@/lib/country-mapping";

export default function Header() {
    const [query, setQuery] = useState("");
    const [countries, setCountries] = useState<string[]>([]);
    const [filteredResults, setFilteredResults] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        // Use pre-mapping names for instant search
        const names = Object.keys(countryMapping).map(slug =>
            slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        );
        setCountries(names.sort());
    }, []);

    useEffect(() => {
        if (query.length > 0) {
            const results = countries.filter(c =>
                c.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 8);
            setFilteredResults(results);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [query, countries]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (name: string) => {
        const countryId = name.toLowerCase().replace(/\s+/g, '-');
        setQuery("");
        setIsOpen(false);
        router.push(`/country/${countryId}`);
    };

    return (
        <header className="relative z-50 w-full border-b border-notion-border bg-notion-bg/80 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-8 gap-4">
                <div className="flex-1 max-w-[280px] sm:max-w-md relative" ref={dropdownRef}>
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-notion-text-light" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => query.length > 0 && setIsOpen(true)}
                            placeholder="Search countries..."
                            className="h-8 w-full rounded-md bg-notion-bg-secondary pl-8 pr-4 text-xs text-notion-text outline-none focus:ring-1 focus:ring-notion-text/20 transition-all border border-transparent"
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {isOpen && filteredResults.length > 0 && (
                        <div className="absolute top-10 left-0 right-0 z-[100] mt-1 overflow-hidden rounded-md border border-notion-border bg-white shadow-lg">
                            <div className="max-h-60 overflow-y-auto py-1">
                                {filteredResults.map((name) => {
                                    const slug = name.toLowerCase().replace(/\s+/g, '-');
                                    const isoCode = countryMapping[slug];
                                    return (
                                        <button
                                            key={name}
                                            onClick={() => handleSelect(name)}
                                            className="flex w-full items-center px-3 py-2 text-left text-xs text-notion-text hover:bg-notion-bg-secondary transition-colors"
                                        >
                                            {isoCode ? (
                                                <img
                                                    src={`https://flagcdn.com/w40/${isoCode}.png`}
                                                    alt={name}
                                                    className="mr-2 h-3.5 w-5 object-contain rounded-sm brightness-[0.97]"
                                                />
                                            ) : (
                                                <Globe className="mr-2 h-3.5 w-3.5 text-notion-text-light opacity-60" />
                                            )}
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex h-8 w-8 items-center justify-center rounded-md bg-notion-bg-secondary text-notion-text hover:bg-notion-text/10 transition-colors">
                        <span className="text-xs font-medium">U</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
