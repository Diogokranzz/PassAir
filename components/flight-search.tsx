"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plane, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";

export function FlightSearch() {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [date, setDate] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [originResults, setOriginResults] = useState<any[]>([]);
    const [destResults, setDestResults] = useState<any[]>([]);
    const [showOriginDropdown, setShowOriginDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);
    const [flightResults, setFlightResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const debouncedOrigin = useDebounce(origin, 300);
    const debouncedDest = useDebounce(destination, 300);

    useEffect(() => {
        if (debouncedOrigin && debouncedOrigin.length >= 2 && !debouncedOrigin.includes(" - ")) {
            searchAirports(debouncedOrigin, setOriginResults);
        } else {
            setOriginResults([]);
        }
    }, [debouncedOrigin]);

    useEffect(() => {
        if (debouncedDest && debouncedDest.length >= 2 && !debouncedDest.includes(" - ")) {
            searchAirports(debouncedDest, setDestResults);
        } else {
            setDestResults([]);
        }
    }, [debouncedDest]);

    const handleSearch = async () => {
        if (!origin || !destination || !date) {
            setError("Please fill in all fields (Origin, Destination, and Date)");
            return;
        }

        setError(null);

        setIsSearching(true);
        setHasSearched(true);
        setFlightResults([]);


        const getIata = (val: string) => {
            if (val.includes(" - ")) return val.split(" - ")[0];
            return val.length === 3 ? val.toUpperCase() : val;
        };

        const originIata = getIata(origin);
        const destIata = getIata(destination);

        try {
            const res = await fetch(`/api/search_flights?origin=${encodeURIComponent(originIata)}&dest=${encodeURIComponent(destIata)}&date=${date}`);
            const data = await res.json();
            if (data.success) {
                setFlightResults(data.data);
            } else {
                setError(data.error || "Failed to find flights");
            }
        } catch (error) {
            console.error("Flight search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const searchAirports = async (query: string, setResults: (results: any[]) => void) => {
        try {
            const res = await fetch(`/api/find_airports?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) {
                setResults(data.data);
            }
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOrigin(e.target.value);
        setShowOriginDropdown(true);
    };

    const handleDestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDestination(e.target.value);
        setShowDestDropdown(true);
    };

    const selectOrigin = (airport: any) => {
        setOrigin(`${airport.iata} - ${airport.name}`);
        setShowOriginDropdown(false);
    };

    const selectDest = (airport: any) => {
        setDestination(`${airport.iata} - ${airport.name}`);
        setShowDestDropdown(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto p-6"
        >
            <div className="glass-card p-4 md:p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none rounded-2xl" />

                <h2 className="text-3xl font-bold mb-8 text-center text-gradient">
                    Find Your Next Journey
                </h2>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                    <div className="md:col-span-4 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-400 transition-colors">
                            <Plane className="w-5 h-5 rotate-45" />
                        </div>
                        <input
                            type="text"
                            placeholder="From (e.g. JFK)"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            value={origin}
                            onChange={handleOriginChange}
                            onFocus={() => setShowOriginDropdown(true)}
                            onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                        />
                        {showOriginDropdown && originResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto shadow-xl">
                                {originResults.map((airport, idx) => (
                                    <button
                                        key={idx}
                                        className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                                        onClick={() => selectOrigin(airport)}
                                    >
                                        "use client";

                                        import {useState, useEffect} from "react";
                                        import {motion} from "framer-motion";
                                        import {Search, Plane, Calendar, MapPin} from "lucide-react";
                                        import {cn} from "@/lib/utils";
                                        import {useDebounce} from "@/hooks/use-debounce";
                                        import Image from "next/image";

                                        export function FlightSearch() {
    const [origin, setOrigin] = useState("");
                                        const [destination, setDestination] = useState("");
                                        const [date, setDate] = useState("");
                                        const [error, setError] = useState<string | null>(null);
                                        const [originResults, setOriginResults] = useState<any[]>([]);
                                        const [destResults, setDestResults] = useState<any[]>([]);
                                        const [showOriginDropdown, setShowOriginDropdown] = useState(false);
                                        const [showDestDropdown, setShowDestDropdown] = useState(false);
                                        const [flightResults, setFlightResults] = useState<any[]>([]);
                                        const [isSearching, setIsSearching] = useState(false);
                                        const [hasSearched, setHasSearched] = useState(false);

                                        const debouncedOrigin = useDebounce(origin, 300);
                                        const debouncedDest = useDebounce(destination, 300);

    useEffect(() => {
        if (debouncedOrigin && debouncedOrigin.length >= 2 && !debouncedOrigin.includes(" - ")) {
                                            searchAirports(debouncedOrigin, setOriginResults);
        } else {
                                            setOriginResults([]);
        }
    }, [debouncedOrigin]);

    useEffect(() => {
        if (debouncedDest && debouncedDest.length >= 2 && !debouncedDest.includes(" - ")) {
                                            searchAirports(debouncedDest, setDestResults);
        } else {
                                            setDestResults([]);
        }
    }, [debouncedDest]);

    const handleSearch = async () => {
        if (!origin || !destination || !date) {
                                            setError("Please fill in all fields (Origin, Destination, and Date)");
                                        return;
        }

                                        setError(null);

                                        setIsSearching(true);
                                        setHasSearched(true);
                                        setFlightResults([]);


        const getIata = (val: string) => {
            if (val.includes(" - ")) return val.split(" - ")[0];
                                        return val.length === 3 ? val.toUpperCase() : val;
        };

                                        const originIata = getIata(origin);
                                        const destIata = getIata(destination);

                                        try {
            const res = await fetch(`/api/search_flights?origin=${encodeURIComponent(originIata)}&dest=${encodeURIComponent(destIata)}&date=${date}`);
                                        const data = await res.json();
                                        if (data.success) {
                                            setFlightResults(data.data);
            } else {
                                            setError(data.error || "Failed to find flights");
            }
        } catch (error) {
                                            console.error("Flight search error:", error);
        } finally {
                                            setIsSearching(false);
        }
    };

    const searchAirports = async (query: string, setResults: (results: any[]) => void) => {
        try {
            const res = await fetch(`/api/find_airports?q=${encodeURIComponent(query)}`);
                                        const data = await res.json();
                                        if (data.success) {
                                            setResults(data.data);
            }
        } catch (error) {
                                            console.error("Search error:", error);
        }
    };

                                        const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                            setOrigin(e.target.value);
                                            setShowOriginDropdown(true);
    };

                                            const handleDestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                setDestination(e.target.value);
                                                setShowDestDropdown(true);
    };

    const selectOrigin = (airport: any) => {
                                                    setOrigin(`${airport.iata} - ${airport.name}`);
                                                setShowOriginDropdown(false);
    };

    const selectDest = (airport: any) => {
                                                    setDestination(`${airport.iata} - ${airport.name}`);
                                                setShowDestDropdown(false);
    };

                                                return (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="w-full max-w-4xl mx-auto p-6"
                                                >
                                                    <div className="glass-card p-4 md:p-8 relative">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none rounded-2xl" />

                                                        <h2 className="text-3xl font-bold mb-8 text-center text-gradient">
                                                            Find Your Next Journey
                                                        </h2>

                                                        {error && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm font-medium"
                                                            >
                                                                {error}
                                                            </motion.div>
                                                        )}

                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                                                            <div className="md:col-span-4 relative group">
                                                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-400 transition-colors">
                                                                    <Plane className="w-5 h-5 rotate-45" />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    placeholder="From (e.g. JFK)"
                                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                                    value={origin}
                                                                    onChange={handleOriginChange}
                                                                    onFocus={() => setShowOriginDropdown(true)}
                                                                    onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                                                                />
                                                                {showOriginDropdown && originResults.length > 0 && (
                                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto shadow-xl">
                                                                        {originResults.map((airport, idx) => (
                                                                            <button
                                                                                key={idx}
                                                                                className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                                                                                onClick={() => selectOrigin(airport)}
                                                                            >
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="font-bold text-blue-400 w-12">{airport.iata}</span>
                                                                                    <span className="text-sm text-white truncate">{airport.name}</span>
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground pl-12">
                                                                                    {airport.city}, {airport.country}
                                                                                </div>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>


                                                            <div className="md:col-span-4 relative group">
                                                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-purple-400 transition-colors">
                                                                    <MapPin className="w-5 h-5" />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    placeholder="To (e.g. LHR)"
                                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                                    value={destination}
                                                                    onChange={handleDestChange}
                                                                    onFocus={() => setShowDestDropdown(true)}
                                                                    onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                                                                />
                                                                {showDestDropdown && destResults.length > 0 && (
                                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto shadow-xl">
                                                                        {destResults.map((airport, idx) => (
                                                                            <button
                                                                                key={idx}
                                                                                className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                                                                                onClick={() => selectDest(airport)}
                                                                            >
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="font-bold text-purple-400 w-12">{airport.iata}</span>
                                                                                    <span className="text-sm text-white truncate">{airport.name}</span>
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground pl-12">
                                                                                    {airport.city}, {airport.country}
                                                                                </div>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>


                                                            <div className="md:col-span-3 relative group min-w-0">
                                                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-pink-400 transition-colors">
                                                                    <Calendar className="w-5 h-5" />
                                                                </div>
                                                                <input
                                                                    type="date"
                                                                    value={date}
                                                                    onChange={(e) => setDate(e.target.value)}
                                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all [color-scheme:dark] appearance-none min-w-0"
                                                                />
                                                            </div>


                                                            <div className="md:col-span-1">
                                                                <button
                                                                    onClick={handleSearch}
                                                                    disabled={isSearching}
                                                                    className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:hover:scale-100"
                                                                >
                                                                    {isSearching ? (
                                                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    ) : (
                                                                        <Search className="w-6 h-6 text-white" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>


                                                        {hasSearched && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                className="mt-8 border-t border-white/10 pt-8"
                                                            >
                                                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                                                    <Plane className="w-5 h-5 text-blue-400" />
                                                                    Available Flights
                                                                </h3>

                                                                {isSearching ? (
                                                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                                        <p className="text-muted-foreground">Searching for flights...</p>
                                                                    </div>
                                                                ) : flightResults.length === 0 ? (
                                                                    <div className="text-center text-muted-foreground py-8">
                                                                        { }
                                                                        { }
                                                                        <span className="opacity-50">Searching for live schedule...</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="grid gap-4">
                                                                        {flightResults.map((flight, idx) => (
                                                                            <motion.div
                                                                                key={idx}
                                                                                initial={{ opacity: 0, x: -20 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: idx * 0.1 }}
                                                                                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between group gap-4 w-full overflow-hidden"
                                                                            >
                                                                                <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                                                                                    <div className="w-12 h-12 bg-white rounded-lg p-2 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                                                                                        {flight.airline.logo ? (
                                                                                            <Image
                                                                                                src={flight.airline.logo}
                                                                                                alt={flight.airline.name}
                                                                                                fill
                                                                                                className="object-contain p-1"
                                                                                                unoptimized={!flight.airline.logo.startsWith('http')}
                                                                                            />
                                                                                        ) : (
                                                                                            <Plane className="w-6 h-6 text-black" />
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                                            <span className="font-bold text-white truncate">{flight.flight_number}</span>
                                                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 whitespace-nowrap">
                                                                                                {flight.status}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="text-sm text-muted-foreground truncate">
                                                                                            {flight.airline.name} • {flight.aircraft.model || "Aircraft info unavailable"}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="text-left sm:text-right pl-0 sm:pl-0">
                                                                                    <div className="text-lg font-bold text-white">
                                                                                        {new Date(flight.time.scheduled * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                    </div>
                                                                                    <div className="text-xs text-muted-foreground">
                                                                                        Scheduled Departure
                                                                                    </div>
                                                                                </div>
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                                );
}
