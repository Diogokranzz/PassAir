"use client";

import { SafetyManual } from "@/components/safety-manual";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SafetyPage() {
    return (
        <main className="min-h-screen bg-background p-4 md:p-8 flex flex-col">
            <header className="mb-8 flex items-center gap-4">
                <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Aircraft Safety</h1>
                    <p className="text-muted-foreground">Interactive Safety Card • Boeing 737-800</p>
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center">
                <SafetyManual />
            </div>
        </main>
    );
}
