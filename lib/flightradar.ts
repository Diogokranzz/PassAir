import { FlightRadar24API } from "flightradar24-client";

// Initialize the API client
// Note: If the library export is different, we might need to adjust.
// For now, assuming standard class export or default export.
const frApi = new FlightRadar24API();

export interface Flight {
    id: string;
    callsign: string;
    origin: string;
    destination: string;
    aircraft: string;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    heading: number;
}

export async function getLiveFlights(zone?: string): Promise<Flight[]> {
    try {
        // This is a hypothetical usage based on common patterns.
        // We might need to adjust based on actual library API.
        const flights = await frApi.getFlights(zone);
        return flights.map((f: any) => ({
            id: f.id,
            callsign: f.callsign,
            origin: f.origin_airport_iata,
            destination: f.destination_airport_iata,
            aircraft: f.aircraft_code,
            latitude: f.latitude,
            longitude: f.longitude,
            altitude: f.altitude,
            speed: f.ground_speed,
            heading: f.heading,
        }));
    } catch (error) {
        console.error("Error fetching flights:", error);
        return [];
    }
}

export async function getAirports() {
    try {
        const airports = await frApi.getAirports();
        return airports;
    } catch (error) {
        console.error("Error fetching airports:", error);
        return [];
    }
}
