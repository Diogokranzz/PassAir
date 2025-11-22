"use client";

import { motion } from "framer-motion";
import { Plane, Clock, ArrowRight } from "lucide-react";

interface FlightCardProps {
    flight: {
        id: string;
        callsign: string;
        origin: string;
        destination: string;
        status: string;
        airline: string;
        departureTime: string;
        arrivalTime: string;
        duration: string;
    };
    index: number;
    onClick?: () => void;
}

export function FlightCard({ flight, index, onClick }: FlightCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 hover:bg-white/10 transition-colors cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                        {flight.callsign}
                    </span>
                    <h3 className="text-lg font-bold mt-2 text-white">{flight.airline}</h3>
                </div>
                <div className="text-right">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <p className="text-green-400 font-semibold">{flight.status}</p>
                </div>
            </div>

            <div className="flex items-center justify-between relative py-4">

                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10 -z-10" />

                <div className="text-center">
                    <p className="text-2xl font-bold text-white">{flight.origin}</p>
                    <p className="text-sm text-muted-foreground">{flight.departureTime}</p>
                </div>

                <div className="flex flex-col items-center bg-zinc-900/50 px-2 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                    <Plane className="w-4 h-4 text-blue-400 rotate-90 mb-1" />
                    <span className="text-xs text-muted-foreground mb-0.5">Duration</span>
                    <span className="text-sm font-mono text-white">{flight.duration}</span>
                </div>

                <div className="text-center">
                    <p className="text-2xl font-bold text-white">{flight.destination}</p>
                    <p className="text-sm text-muted-foreground">{flight.arrivalTime}</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>On Time</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                    className="text-sm text-blue-400 group-hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                    View Details <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
