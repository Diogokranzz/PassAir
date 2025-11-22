from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sys
import json
import random

flight_api_error = None
try:
    from FlightRadar24 import FlightRadar24API
except ImportError as e1:
    try:
        from FlightRadarAPI import FlightRadarAPI as FlightRadar24API
    except ImportError as e2:
        flight_api_error = f"Primary: {e1} | Fallback: {e2}"

def get_mock_flights():
    
    return [
        {
            "id": "mock1", "callsign": "LA3418", "latitude": -23.43, "longitude": -46.47, "heading": 45,
            "altitude": 35000, "ground_speed": 450, "speed": 450, "airline": "LA", "airline_icao": "TAM", "aircraft": "A320",
            "origin": "GRU", "destination": "POA", "flight_number": "LA3418"
        },
        {
            "id": "mock2", "callsign": "TP89", "latitude": 38.77, "longitude": -9.13, "heading": 200,
            "altitude": 38000, "ground_speed": 480, "speed": 480, "airline": "TP", "airline_icao": "TAP", "aircraft": "A330",
            "origin": "LIS", "destination": "GRU", "flight_number": "TP89"
        },
        {
            "id": "mock3", "callsign": "AA950", "latitude": 40.64, "longitude": -73.77, "heading": 180,
            "altitude": 12000, "ground_speed": 300, "speed": 300, "airline": "AA", "airline_icao": "AAL", "aircraft": "B777",
            "origin": "JFK", "destination": "GRU", "flight_number": "AA950"
        },
        {
            "id": "mock4", "callsign": "G31234", "latitude": -22.81, "longitude": -43.24, "heading": 270,
            "altitude": 28000, "ground_speed": 420, "speed": 420, "airline": "G3", "airline_icao": "GLO", "aircraft": "B738",
            "origin": "GIG", "destination": "CGH", "flight_number": "G31234"
        }
    ]

def get_flights_in_bounds(min_lat=None, max_lat=None, min_lon=None, max_lon=None, limit=1500):
    
    if flight_api_error:
        return {"success": True, "data": get_mock_flights(), "message": f"API Error, using mock. {flight_api_error}"}

    try:
        fr_api = FlightRadar24API()
        
        flights = []
        try:
            if min_lat and max_lat and min_lon and max_lon:
                bounds = f"{max_lat},{min_lat},{min_lon},{max_lon}"
                flights = fr_api.get_flights(bounds=bounds)
            else:
                flights = fr_api.get_flights()
        except Exception as api_err:
            print(f"API Call Error: {api_err}")
           

       
        if not flights:
             
             return {"success": True, "data": get_mock_flights(), "message": "No flights from API, using mock data"}

        flight_data = []
        count = 0
        limit = int(limit)

        for f in flights:
            if count >= limit: break
            
            flight_data.append({
                "id": f.id,
                "callsign": f.callsign or "N/A",
                "latitude": f.latitude,
                "longitude": f.longitude,
                "heading": f.heading,
                "altitude": f.altitude,
                "ground_speed": f.ground_speed,
                "speed": f.ground_speed,
                "airline": f.airline_iata or "Unknown",
                "airline_icao": f.airline_icao or "",
                "aircraft": f.aircraft_code or "N/A",
                "origin": f.origin_airport_iata or "N/A",
                "destination": f.destination_airport_iata or "N/A",
                "flight_number": f.number or "N/A"
            })
            count += 1
            
        return {"success": True, "data": flight_data, "count": len(flight_data)}

    except Exception as e:
       
        return {"success": True, "data": get_mock_flights(), "message": f"Exception: {str(e)}, using mock data"}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urlparse(self.path).query
        params = parse_qs(query)
        
        min_lat = params.get('min_lat', [None])[0]
        max_lat = params.get('max_lat', [None])[0]
        min_lon = params.get('min_lon', [None])[0]
        max_lon = params.get('max_lon', [None])[0]
        limit = params.get('limit', [1500])[0]
        
        result = get_flights_in_bounds(min_lat, max_lat, min_lon, max_lon, limit)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode('utf-8'))


if __name__ == "__main__":
    min_lat = sys.argv[1] if len(sys.argv) > 1 else None
    max_lat = sys.argv[2] if len(sys.argv) > 2 else None
    min_lon = sys.argv[3] if len(sys.argv) > 3 else None
    max_lon = sys.argv[4] if len(sys.argv) > 4 else None
    limit = sys.argv[5] if len(sys.argv) > 5 else 1500
    
    print(json.dumps(get_flights_in_bounds(min_lat, max_lat, min_lon, max_lon, limit)))
