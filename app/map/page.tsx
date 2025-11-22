"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FlightSidebar } from "@/components/flight-sidebar";
import { AnimatePresence } from "framer-motion";

// Dynamically import the map component to avoid SSR issues with Leaflet
const FlightMap = dynamic(() => import("@/components/flight-map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#0a0a1a]">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-white font-medium">Loading Map Engine...</p>
            </div>
        </div>
    ),
});

interface Flight {
    id: string;
    callsign: string;
    latitude: number;
    longitude: number;
    heading: number;
    airline: string;
    origin: string;
    destination: string;
    aircraft: string;
    altitude: number;
    speed: number;
}

export default function MapPage() {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const [bounds, setBounds] = useState<{ minLat: number, maxLat: number, minLon: number, maxLon: number } | null>(null);

    const fetchFlights = async () => {
        // Don't set loading to true on refresh to keep map interactive
        if (flights.length === 0) setLoading(true);

        try {
            let url = "/api/flights";
            const params = new URLSearchParams();

            if (bounds) {
                params.append("min_lat", bounds.minLat.toString());
                params.append("max_lat", bounds.maxLat.toString());
                params.append("min_lon", bounds.minLon.toString());
                params.append("max_lon", bounds.maxLon.toString());
            }

            if (isMobile) {
                params.append("limit", "500");
            }

            if (Array.from(params).length > 0) {
                url += `?${params.toString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setFlights(data.data);
                setError("");
            } else {
                setError("Failed to load flight data");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
        const interval = setInterval(fetchFlights, 8000); // Refresh every 8 seconds
        return () => clearInterval(interval);
    }, [bounds]); // Re-fetch when bounds change

    return (
        <main className="h-screen bg-background flex flex-col overflow-hidden relative">
            <header className="absolute top-0 left-0 right-0 z-[1000] p-4 md:p-8 pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-4 bg-black/50 backdrop-blur-md p-2 pr-6 rounded-full border border-white/10">
                        <Link href="/" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">Global Map</h1>
                            <p className="text-xs text-muted-foreground">
                                {flights.length} Active Flights
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={fetchFlights}
                        className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-colors group"
                    >
                        <RefreshCw className={`w-6 h-6 text-blue-400 group-hover:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {error && (
                    <div className="mt-4 inline-block px-4 py-2 bg-red-500/80 backdrop-blur text-white text-sm rounded-lg animate-in fade-in slide-in-from-top-2">
                        {error} • <button onClick={fetchFlights} className="underline hover:text-white/80">Retry</button>
                    </div>
                )}
            </header>

            <div className="flex-1 relative bg-[#0a0a1a]">
                <FlightMap
                    flights={flights}
                    onFlightSelect={setSelectedFlight}
                    selectedFlightId={selectedFlight?.id}
                    onBoundsChange={setBounds}
                    isMobile={isMobile}
                />
            </div>

            <AnimatePresence>
                {selectedFlight && (
                    <FlightSidebar
                        flight={selectedFlight}
                        onClose={() => setSelectedFlight(null)}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
