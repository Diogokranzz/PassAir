import { NextResponse } from "next/server";
import { getLiveDepartures } from "@/lib/flight-service";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const airport = url.searchParams.get("airport") || "GRU";

        const result = await getLiveDepartures(airport);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json(result, { status: 500 });
        }
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
