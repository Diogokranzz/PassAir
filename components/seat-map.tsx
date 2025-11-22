"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ROWS = 30;
const SEATS_PER_ROW = ["A", "B", "C", "D", "E", "F"];

export function SeatMap() {
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

    // Mock occupied seats
    const occupiedSeats = ["1A", "2C", "5F", "10D", "15B"];

    const toggleSeat = (seatId: string) => {
        if (occupiedSeats.includes(seatId)) return;
        setSelectedSeat(selectedSeat === seatId ? null : seatId);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Fuselage Shape */}
            <div className="absolute inset-0 bg-zinc-100 pointer-events-none" />

            <div className="relative z-10 p-8 h-[600px] overflow-y-auto scrollbar-hide">
                <div className="flex justify-between mb-8 sticky top-0 bg-zinc-100/95 backdrop-blur z-20 py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-white border border-gray-300" />
                        <span className="text-xs text-gray-500">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500" />
                        <span className="text-xs text-gray-500">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-300" />
                        <span className="text-xs text-gray-500">Occupied</span>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {/* A B C  AISLE  D E F */}
                    {Array.from({ length: ROWS }).map((_, rowIndex) => {
                        const rowNum = rowIndex + 1;
                        return (
                            <div key={rowNum} className="contents">
                                {SEATS_PER_ROW.map((col, colIndex) => {
                                    const seatId = `${rowNum}${col}`;
                                    const isOccupied = occupiedSeats.includes(seatId);
                                    const isSelected = selectedSeat === seatId;

                                    // Add aisle gap
                                    const isAisle = colIndex === 3;

                                    return (
                                        <>
                                            {isAisle && <div className="w-4 text-center text-xs text-gray-300 flex items-center justify-center">{rowNum}</div>}
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => toggleSeat(seatId)}
                                                disabled={isOccupied}
                                                className={cn(
                                                    "w-8 h-10 rounded-t-lg rounded-b-md transition-colors relative",
                                                    isOccupied ? "bg-gray-300 cursor-not-allowed" :
                                                        isSelected ? "bg-blue-500 shadow-lg shadow-blue-500/30" : "bg-white border border-gray-200 hover:border-blue-300"
                                                )}
                                            >
                                                <span className={cn(
                                                    "text-[10px] font-bold absolute top-1 left-1/2 -translate-x-1/2",
                                                    isSelected ? "text-white" : "text-gray-400"
                                                )}>
                                                    {col}
                                                </span>
                                            </motion.button>
                                        </>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
