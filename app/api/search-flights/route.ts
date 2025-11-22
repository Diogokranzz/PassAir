import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin");
    const dest = searchParams.get("dest");

    if (!origin || !dest) {
        return NextResponse.json({ success: false, error: "Missing origin or destination" }, { status: 400 });
    }


    const originCode = origin.split(" - ")[0].trim();
    const destCode = dest.split(" - ")[0].trim();

    try {

        if (process.env.VERCEL_URL) {
            const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
            const host = process.env.VERCEL_URL;
            const url = `${protocol}://${host}/api/search_flights?origin=${originCode}&dest=${destCode}`;

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`Failed to fetch from Python API: ${res.statusText}`);
            }
            const data = await res.json();
            return NextResponse.json(data);
        }


        const scriptPath = path.join(process.cwd(), "api", "search_flights.py");
        const pythonCommand = "C:\\Users\\diogo\\AppData\\Local\\Microsoft\\WindowsApps\\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\\python.exe";
        const command = `"${pythonCommand}" "${scriptPath}" "${originCode}" "${destCode}"`;

        const { stdout, stderr } = await execAsync(command);

        if (stderr) {

        }

        try {
            const result = JSON.parse(stdout);
            return NextResponse.json(result);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Stdout:", stdout);
            return NextResponse.json({ success: false, error: "Invalid response from backend", details: stdout }, { status: 500 });
        }

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
