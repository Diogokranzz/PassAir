"use client";

import { motion } from "framer-motion";
import { X, Plane, Navigation, Clock, Calendar } from "lucide-react";
import { Flight } from "./flight-map";
import { useState, useEffect } from "react";

interface FlightSidebarProps {
    flight: Flight | null;
    onClose: () => void;
}

interface FlightDetails {
    airline: string;
    aircraft_model: string;
    origin: string;
    destination: string;
    status: string;
    image_url: string | null;
}

export function FlightSidebar({ flight, onClose }: FlightSidebarProps) {
    const [details, setDetails] = useState<FlightDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (flight) {
            setLoading(true);
            setDetails(null);
            const params = new URLSearchParams();
            if (flight.airline_icao) params.append("airline_icao", flight.airline_icao);
            if (flight.aircraft) params.append("aircraft", flight.aircraft);

            fetch(`/api/flights/${flight.id}?${params.toString()}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setDetails(data.data);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [flight]);

    if (!flight) return null;

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-96 bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-[2000] overflow-y-auto"
        >
            { }
            <div className="h-48 bg-zinc-800 relative">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <img
                        src={details?.image_url || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop"}
                        alt="Aircraft"
                        className="w-full h-full object-cover opacity-80"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 -mt-12 relative">
                { }
                <div className="bg-zinc-800/50 border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-md shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">{flight.callsign}</h2>
                            <p className="text-blue-400 font-medium">{details?.airline || flight.airline}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-zinc-400 uppercase tracking-wider">Aircraft</span>
                            <p className="text-white font-mono">{details?.aircraft_model || flight.aircraft}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between relative py-6">
                        {/* Route Line */}
                        <div className="absolute left-[10%] right-[10%] top-1/2 h-0.5 bg-zinc-700 -z-10" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 p-1 rounded-full border border-zinc-700">
                            <Plane className="w-4 h-4 text-yellow-500 rotate-90" />
                        </div>

                        <div className="text-center max-w-[100px]">
                            <p className="text-lg font-bold text-white leading-tight">{details?.origin || flight.origin}</p>
                            <p className="text-xs text-zinc-500 mt-1">Origin</p>
                        </div>
                        <div className="text-center max-w-[100px]">
                            <p className="text-lg font-bold text-white leading-tight">{details?.destination || flight.destination}</p>
                            <p className="text-xs text-zinc-500 mt-1">Destination</p>
                        </div>
                    </div>
                </div>

                { }
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Navigation className="w-4 h-4" />
                            <span className="text-xs">Altitude</span>
                        </div>
                        <p className="text-xl font-bold text-white">{flight.altitude} <span className="text-sm font-normal text-zinc-500">ft</span></p>
                    </div>
                    <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">Speed</span>
                        </div>
                        <p className="text-xl font-bold text-white">{flight.speed} <span className="text-sm font-normal text-zinc-500">kts</span></p>
                    </div>
                </div>

                { }
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Flight Status</h3>
                    <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <div className={`w-2 h-12 rounded-full ${details?.status ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <div>
                            <p className="text-white font-medium">{details?.status || "En Route"}</p>
                            <p className="text-sm text-zinc-500">Live Status</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
