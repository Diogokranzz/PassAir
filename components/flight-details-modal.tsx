"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plane, Calendar, MapPin, Clock } from "lucide-react";
import Image from "next/image";

interface FlightDetailsModalProps {
    flight: any;
    isOpen: boolean;
    onClose: () => void;
}

export function FlightDetailsModal({ flight, isOpen, onClose }: FlightDetailsModalProps) {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && flight) {
            setDetails({
                ...flight,
                aircraft_model: flight.aircraft,
                image_url: null
            });

            fetchDetails(flight.id);
        } else {
            setDetails(null);
            setError(null);
        }
    }, [isOpen, flight]);

    const fetchDetails = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (flight.airline_icao) params.append("airline_icao", flight.airline_icao);
            if (flight.aircraft) params.append("aircraft", flight.aircraft);

            const res = await fetch(`/api/flights/${id}?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setDetails((prev: any) => ({
                    ...prev,
                    ...data.data
                }));
            } else {
                console.warn("Failed to load extra details:", data.error);
            }
        } catch (err) {
            console.error("Failed to fetch flight details:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="relative">

                            <div className="h-48 bg-zinc-800 relative overflow-hidden">
                                {details?.image_url ? (
                                    <Image
                                        src={details.image_url}
                                        alt={details.aircraft_model || "Aircraft Image"}
                                        fill
                                        className="object-cover"
                                        unoptimized={!details.image_url.startsWith('http')}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                                        <Plane className="w-16 h-16 text-white/10" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors backdrop-blur-md z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>


                            <div className="p-6 -mt-12 relative">
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8 text-red-400">
                                        {error}
                                    </div>
                                ) : details ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                {details.airline_logo && (
                                                    <div className="w-12 h-12 relative bg-white rounded-lg p-1">
                                                        <Image
                                                            src={details.airline_logo}
                                                            alt={details.airline}
                                                            fill
                                                            className="object-contain p-1"
                                                            unoptimized
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white mb-1">{details.airline}</h2>
                                                    <p className="text-blue-400 font-mono">{details.aircraft_model}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-medium inline-block">
                                                    {details.status}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> Origin
                                                </span>
                                                <p className="text-lg font-bold text-white">{details.origin}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                                    <MapPin className="w-3 h-3" /> Destination
                                                </span>
                                                <p className="text-lg font-bold text-white">{details.destination}</p>
                                            </div>
                                        </div>


                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
