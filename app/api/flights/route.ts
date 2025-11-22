import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const minLat = url.searchParams.get("min_lat");
        const maxLat = url.searchParams.get("max_lat");
        const minLon = url.searchParams.get("min_lon");
        const maxLon = url.searchParams.get("max_lon");
        const limit = url.searchParams.get("limit") || "1500";


        if (process.env.VERCEL_URL) {
            const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
            const host = process.env.VERCEL_URL;
            let apiUrl = `${protocol}://${host}/api/flight_service?limit=${limit}`;

            if (minLat && maxLat && minLon && maxLon) {
                apiUrl += `&min_lat=${minLat}&max_lat=${maxLat}&min_lon=${minLon}&max_lon=${maxLon}`;
            }

            const res = await fetch(apiUrl);
            if (!res.ok) {
                throw new Error(`Failed to fetch from Python API: ${res.statusText}`);
            }
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error);
            }
            return NextResponse.json({ success: true, data: data.data });
        }


        const scriptPath = path.join(process.cwd(), "api", "flight_service.py");
        const pythonCommand = "C:\\Users\\diogo\\AppData\\Local\\Microsoft\\WindowsApps\\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\\python.exe";

        let command = `"${pythonCommand}" "${scriptPath}"`;
        if (minLat && maxLat && minLon && maxLon) {
            command += ` ${minLat} ${maxLat} ${minLon} ${maxLon} ${limit}`;
        }

        const { stdout, stderr } = await execAsync(command);

        if (stderr) {

        }

        const result = JSON.parse(stdout);

        if (!result.success) {
            throw new Error(result.error);
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch flights via Python backend" },
            { status: 500 }
        );
    }
}
