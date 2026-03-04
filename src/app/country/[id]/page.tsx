import Header from "@/components/Header";
import { ChevronLeft, Globe, MapPin, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import CountryContent from "@/components/CountryContent";
import { getIsoCode } from "@/lib/country-mapping";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CountryPage({ params }: PageProps) {
    const { id } = await params;
    const countryName = id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    // Fetch ISO code for the flag using optimized static mapping
    const isoCode = getIsoCode(id);

    return (
        <div className="min-h-screen bg-notion-bg font-sans selection:bg-notion-text/10">
            <Header />

            <main className="mx-auto max-w-5xl px-4 sm:px-8 py-8 sm:py-12">
                {/* Navigation Breadcrumb */}
                <div className="mb-8 flex items-center justify-between">
                    <Link
                        href="/"
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-notion-text"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                </div>

                {/* Flag Icon */}
                <div className="mb-6 ml-2 h-20 w-20 overflow-hidden rounded-xl bg-transparent sm:h-24 sm:w-24">
                    <div className="flex h-full w-full items-center justify-center p-2">
                        {isoCode ? (
                            <img
                                src={`https://flagcdn.com/w320/${isoCode}.png`}
                                alt={countryName}
                                className="max-h-full max-w-full object-contain brightness-[0.97]"
                            />
                        ) : (
                            <MapPin className="h-8 w-8 text-notion-text-light" />
                        )}
                    </div>
                </div>

                {/* Title */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight text-notion-text sm:text-6xl">
                        {countryName}
                    </h1>
                </div>

                {/* Wiki Content (Photo-Based Categories) */}
                <div>
                    <CountryContent countryName={countryName} />
                </div>
            </main>
        </div>
    );
}
