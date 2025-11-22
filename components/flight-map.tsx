import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom Plane Icon (FlightRadar24 Style)
const createPlaneIcon = (heading: number, isSelected: boolean = false, isMobile: boolean = false) => {
    // Remove drop-shadow on mobile for performance
    const filterStyle = isMobile
        ? ""
        : "filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));";

    return L.divIcon({
        className: "custom-plane-icon",
        html: `<div style="transform: rotate(${heading}deg); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; transition: transform 0.5s linear;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isSelected ? '#ef4444' : '#fbbf24'}" stroke="${isSelected ? '#ffffff' : 'none'}" stroke-width="1" style="${filterStyle} width: 100%; height: 100%;">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
};

export interface Flight {
    id: string;
    callsign: string;
    latitude: number;
    longitude: number;
    heading: number;
    airline: string;
    origin: string;
    destination: string;
    aircraft: string;
    altitude: number;
    speed: number;
    vertical_speed?: number;
    on_ground?: number;
    airline_icao?: string;
}

interface MapProps {
    flights: Flight[];
    onFlightSelect?: (flight: Flight) => void;
    selectedFlightId?: string | null;
    onBoundsChange?: (bounds: { minLat: number, maxLat: number, minLon: number, maxLon: number }) => void;
    isMobile?: boolean;
}

function MapEvents({ onBoundsChange }: { onBoundsChange?: (bounds: any) => void }) {
    const map = useMapEvents({
        moveend: () => {
            if (onBoundsChange) {
                const bounds = map.getBounds();
                onBoundsChange({
                    minLat: bounds.getSouth(),
                    maxLat: bounds.getNorth(),
                    minLon: bounds.getWest(),
                    maxLon: bounds.getEast(),
                });
            }
        },
        load: () => {
            if (onBoundsChange) {
                const bounds = map.getBounds();
                onBoundsChange({
                    minLat: bounds.getSouth(),
                    maxLat: bounds.getNorth(),
                    minLon: bounds.getWest(),
                    maxLon: bounds.getEast(),
                });
            }
        }
    });

    // Trigger initial bounds on mount
    useEffect(() => {
        if (onBoundsChange) {
            const bounds = map.getBounds();
            onBoundsChange({
                minLat: bounds.getSouth(),
                maxLat: bounds.getNorth(),
                minLon: bounds.getWest(),
                maxLon: bounds.getEast(),
            });
        }
    }, [map, onBoundsChange]);

    return null;
}

export default function FlightMap({ flights, onFlightSelect, selectedFlightId, onBoundsChange, isMobile = false }: MapProps) {
    return (
        <MapContainer
            center={[20, 0]}
            zoom={3}
            style={{ height: "100%", width: "100%", background: "#0a0a1a" }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapEvents onBoundsChange={onBoundsChange} />

            {flights.map((flight) => (
                <Marker
                    key={flight.id}
                    position={[flight.latitude, flight.longitude]}
                    icon={createPlaneIcon(flight.heading, flight.id === selectedFlightId, isMobile)}
                    eventHandlers={{
                        click: () => onFlightSelect && onFlightSelect(flight),
                    }}
                >
                </Marker>
            ))}
        </MapContainer>
    );
}
