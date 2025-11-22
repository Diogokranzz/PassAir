from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sys
import json

flight_api_error = None
try:
    from FlightRadar24 import FlightRadar24API
except ImportError:
    try:
        from FlightRadarAPI import FlightRadarAPI as FlightRadar24API
    except ImportError as e:
        flight_api_error = str(e)


def get_flights_in_bounds(min_lat=None, max_lat=None, min_lon=None, max_lon=None, limit=1500):
    if flight_api_error:
        return {"success": False, "error": f"Import Error: {flight_api_error}"}

    try:
        fr_api = FlightRadar24API()
        
        if min_lat and max_lat and min_lon and max_lon:
            bounds = f"{max_lat},{min_lat},{min_lon},{max_lon}"
            flights = fr_api.get_flights(bounds=bounds)
        else:
            flights = fr_api.get_flights()

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
                "airline": f.airline_iata or "Unknown",
                "aircraft": f.aircraft_code or "N/A",
                "origin": f.origin_airport_iata or "N/A",
                "destination": f.destination_airport_iata or "N/A"
            })
            count += 1
            
        return {"success": True, "data": flight_data}

    except Exception as e:
        return {"success": False, "error": str(e)}


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
