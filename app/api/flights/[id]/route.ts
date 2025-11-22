import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const url = new URL(request.url);
        const airline_icao = url.searchParams.get("airline_icao") || "";
        const aircraft = url.searchParams.get("aircraft") || "";


        if (process.env.VERCEL_URL) {
            const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
            const host = process.env.VERCEL_URL;
            const apiUrl = `${protocol}://${host}/api/flight_details?id=${id}&airline_icao=${airline_icao}&aircraft=${aircraft}`;

            const res = await fetch(apiUrl);
            if (!res.ok) {
                throw new Error(`Failed to fetch from Python API: ${res.statusText}`);
            }
            const data = await res.json();
            if (!data.success) {
                return NextResponse.json({ success: false, error: data.error }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: data.data });
        }

        const scriptPath = path.join(process.cwd(), "api", "flight_details.py");

        const pythonCommand = "C:\\Users\\diogo\\AppData\\Local\\Microsoft\\WindowsApps\\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\\python.exe";
        const command = `"${pythonCommand}" "${scriptPath}" "${id}" "${airline_icao}" "${aircraft}"`;

        const { stdout, stderr } = await execAsync(command);

        if (stderr) {

        }

        const result = JSON.parse(stdout);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch flight details" },
            { status: 500 }
        );
    }
}
