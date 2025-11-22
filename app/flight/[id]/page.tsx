"use client";

import { SeatMap } from "@/components/seat-map";
import { motion } from "framer-motion";
import { ArrowLeft, Plane } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function FlightPage() {
    const params = useParams();
    const flightId = params.id;

    return (
        <main className="min-h-screen bg-background p-4 md:p-8 flex flex-col">
            <header className="mb-8 flex items-center gap-4">
                <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Select Your Seat</h1>
                    <p className="text-muted-foreground">Flight {flightId} • Boeing 737-800</p>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Flight Info */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Flight Information</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Airline</span>
                                <span className="text-white">GOL Linhas Aéreas</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Aircraft</span>
                                <span className="text-white">Boeing 737-800</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="text-white">8h 35m</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-blue-500/10 border-blue-500/20">
                        <h3 className="text-lg font-bold text-blue-400 mb-2">Premium Economy</h3>
                        <p className="text-sm text-blue-200/80 mb-4">
                            Enjoy extra legroom and priority boarding.
                        </p>
                        <button className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors">
                            Upgrade for $45
                        </button>
                    </div>
                </div>

                {/* Seat Map */}
                <div className="flex justify-center">
                    <SeatMap />
                </div>
            </div>
        </main>
    );
}
