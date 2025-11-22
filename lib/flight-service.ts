import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function getLiveDepartures(airport: string = "GRU") {
    try {

        if (process.env.VERCEL_URL) {
            const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
            const host = process.env.VERCEL_URL; // Vercel automatically sets this
            const url = `${protocol}://${host}/api/live_departures?airport=${airport}`;
            console.log(`Fetching from Python API: ${url}`);
            const res = await fetch(url);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to fetch from Python API (${res.status}): ${text}`);
            }
            return await res.json();
        }


        const scriptPath = path.join(process.cwd(), "api", "live_departures.py");

        const pythonCommand = "C:\\Users\\diogo\\AppData\\Local\\Microsoft\\WindowsApps\\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\\python.exe";
        const command = `"${pythonCommand}" "${scriptPath}" "${airport}"`;

        const { stdout, stderr } = await execAsync(command);

        if (stderr) {

        }

        try {
            const result = JSON.parse(stdout);
            return result;
        } catch (e) {
            console.error("Failed to parse JSON:", stdout);
            return { success: false, error: "Invalid response from backend" };
        }
    } catch (error) {
        console.error("Flight Service Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
