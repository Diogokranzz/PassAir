"use client";

import { useState, useEffect } from "react";
import { FlightSearch } from "@/components/flight-search";
import { FlightCard } from "@/components/flight-card";
import { FlightDetailsModal } from "@/components/flight-details-modal";
import { motion } from "framer-motion";
import Link from "next/link";

interface HomeClientProps {
    initialFlights?: any[];
}

export function HomeClient({ initialFlights = [] }: HomeClientProps) {
    const [flights, setFlights] = useState<any[]>(initialFlights);
    const [loading, setLoading] = useState(true);
    const [selectedFlight, setSelectedFlight] = useState<any>(null);

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                const res = await fetch('/api/live-departures?airport=GRU');
                const data = await res.json();
                if (data.success) {
                    setFlights(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch live departures:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFlights();
    }, []);

    return (
        <main className="min-h-screen pb-20">

            <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4">
                        <span className="text-white">PASS</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">AIR</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Experience the future of air travel. Real-time tracking, premium comfort, and advanced safety.
                    </p>
                </motion.div>

                <FlightSearch />
            </section>


            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-white">Live Departures (GRU)</h2>
                    <div className="flex items-center gap-4 self-start md:self-auto">
                        <Link href="/safety" className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            Safety Manual
                        </Link>
                        <Link href="/map" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            View Global Map
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (

                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="glass-card p-6 h-[200px] animate-pulse">
                                <div className="flex justify-between mb-4">
                                    <div className="h-6 w-20 bg-white/10 rounded" />
                                    <div className="h-6 w-16 bg-white/10 rounded" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-8 w-3/4 bg-white/10 rounded mx-auto" />
                                    <div className="h-4 w-1/2 bg-white/10 rounded mx-auto" />
                                </div>
                            </div>
                        ))
                    ) : (
                        flights.map((flight, index) => (
                            <FlightCard
                                key={flight.id}
                                flight={{
                                    id: flight.id,
                                    callsign: flight.callsign,
                                    origin: flight.origin,
                                    destination: flight.destination,
                                    status: flight.status,
                                    airline: flight.airline,
                                    departureTime: flight.departureTime,
                                    arrivalTime: flight.arrivalTime,
                                    duration: flight.duration
                                }}
                                index={index}
                                onClick={() => setSelectedFlight({
                                    id: flight.id,
                                    callsign: flight.callsign,
                                    origin: flight.origin,
                                    destination: flight.destination,
                                    status: flight.status,
                                    airline: flight.airline,
                                    airline_icao: flight.airline_icao,
                                    airline_logo: flight.airline_logo,
                                    aircraft: flight.aircraft,
                                    departureTime: flight.departureTime,
                                    arrivalTime: flight.arrivalTime,
                                    duration: flight.duration
                                })}
                            />
                        )))}
                </div>
            </section>

            <FlightDetailsModal
                flight={selectedFlight}
                isOpen={!!selectedFlight}
                onClose={() => setSelectedFlight(null)}
            />
        </main>
    );
}
