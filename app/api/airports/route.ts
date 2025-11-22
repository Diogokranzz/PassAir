import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// Cache the airports in memory to avoid reading the file on every request
let airportsCache: any[] | null = null;

async function getAirports() {
    if (airportsCache) return airportsCache;

    try {
        const filePath = path.join(process.cwd(), "backend", "airports.json");
        const fileContent = await fs.readFile(filePath, "utf-8");
        airportsCache = JSON.parse(fileContent);
        return airportsCache;
    } catch (error) {
        console.error("Failed to load airports.json:", error);
        return [];
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q")?.toLowerCase() || "";

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, data: [] });
        }

        const airports = await getAirports();

        // Filter airports
        const results = airports?.filter((airport: any) => {
            const name = airport.name?.toLowerCase() || "";
            const iata = airport.iata?.toLowerCase() || "";
            const icao = airport.icao?.toLowerCase() || "";
            const city = airport.city?.toLowerCase() || "";
            const country = airport.country?.toLowerCase() || "";

            return (
                name.includes(query) ||
                iata.includes(query) ||
                icao.includes(query) ||
                city.includes(query) ||
                country.includes(query)
            );
        }).slice(0, 10); // Limit to 10 results

        return NextResponse.json({ success: true, data: results });
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to search airports" },
            { status: 500 }
        );
    }
}
