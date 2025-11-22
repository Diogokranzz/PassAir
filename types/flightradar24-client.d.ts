declare module 'flightradar24-client' {
    export class FlightRadar24API {
        constructor();
        getFlights(zone?: string): Promise<any[]>;
        getAirports(): Promise<any[]>;
        getAirlines(): Promise<any[]>;
        getZones(): Promise<any[]>;
    }
}
