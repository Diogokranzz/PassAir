"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertTriangle, Info } from "lucide-react";

const PAGES = [
    {
        id: 1,
        title: "Safety On Board",
        subtitle: "Boeing 737-800",
        content: (
            <div className="space-y-4">
                <div className="flex justify-center mb-6">
                    <AlertTriangle className="w-16 h-16 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-center">Please pay attention</h3>
                <p className="text-center text-muted-foreground">
                    Your safety is our priority. Please read this card carefully before takeoff.
                </p>
            </div>
        ),
        image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: 2,
        title: "Emergency Exits",
        subtitle: "Locate your nearest exit",
        content: (
            <div className="space-y-4">
                <p>
                    There are 8 emergency exits on this aircraft. Take a moment to locate the one nearest to you.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>2 doors at the front</li>
                    <li>4 window exits over the wings</li>
                    <li>2 doors at the rear</li>
                </ul>
            </div>
        ),
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: 3,
        title: "Oxygen Masks",
        subtitle: "In case of decompression",
        content: (
            <div className="space-y-4">
                <p>
                    If cabin pressure drops, masks will fall automatically. Pull the mask down to start oxygen flow.
                </p>
                <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                    <p className="text-yellow-500 text-sm font-bold">
                        Put your own mask on before helping others.
                    </p>
                </div>
            </div>
        ),
        image: "https://images.unsplash.com/photo-1520437358207-323b43b50729?q=80&w=1000&auto=format&fit=crop",
    },
];

export function SafetyManual() {
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState(0);

    const paginate = (newDirection: number) => {
        if (currentPage + newDirection < 0 || currentPage + newDirection >= PAGES.length) return;
        setDirection(newDirection);
        setCurrentPage(currentPage + newDirection);
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            rotateY: direction > 0 ? 45 : -45,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            rotateY: 0,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            rotateY: direction < 0 ? 45 : -45,
        }),
    };

    return (
        <div className="w-full max-w-4xl mx-auto h-[600px] relative perspective-1000">
            <div className="absolute inset-0 flex items-center justify-between z-10 px-4 pointer-events-none">
                <button
                    onClick={() => paginate(-1)}
                    className={`p-2 rounded-full bg-black/50 backdrop-blur-md text-white pointer-events-auto hover:bg-black/70 transition-colors ${currentPage === 0 ? "opacity-0" : "opacity-100"
                        }`}
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                    onClick={() => paginate(1)}
                    className={`p-2 rounded-full bg-black/50 backdrop-blur-md text-white pointer-events-auto hover:bg-black/70 transition-colors ${currentPage === PAGES.length - 1 ? "opacity-0" : "opacity-100"
                        }`}
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>

            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-3xl bg-black/20 border border-white/10 backdrop-blur-xl shadow-2xl">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentPage}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                            rotateY: { duration: 0.4 },
                        }}
                        className="absolute w-full h-full flex flex-col md:flex-row bg-white dark:bg-zinc-900"
                    >
                        <div className="w-full h-2/5 md:w-1/2 md:h-full relative overflow-hidden border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800">
                            <img
                                src={PAGES[currentPage].image}
                                alt={PAGES[currentPage].title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                                <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{PAGES[currentPage].title}</h2>
                                <p className="text-sm md:text-lg opacity-80">{PAGES[currentPage].subtitle}</p>
                            </div>
                        </div>

                        <div className="w-full h-3/5 md:w-1/2 md:h-full p-6 md:p-12 flex flex-col justify-center bg-white dark:bg-zinc-900 text-black dark:text-white">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 md:mb-6 text-blue-500">
                                <Info className="w-5 h-5" />
                                <span className="text-sm font-bold tracking-widest uppercase">Safety Instructions</span>
                            </div>

                            <div className="prose dark:prose-invert max-w-none text-center md:text-left">
                                {PAGES[currentPage].content}
                            </div>

                            <div className="mt-auto pt-4 md:pt-8 flex justify-between items-center text-xs md:text-sm text-muted-foreground border-t border-gray-200 dark:border-zinc-800">
                                <span>Page {currentPage + 1} of {PAGES.length}</span>
                                <span>PassAir Safety</span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
