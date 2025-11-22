from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sys
import json
import concurrent.futures

flight_api_error = None
try:
    from FlightRadar24 import FlightRadar24API
except ImportError as e1:
    try:
        from FlightRadarAPI import FlightRadarAPI as FlightRadar24API
    except ImportError as e2:
        flight_api_error = f"Primary: {e1} | Fallback: {e2}"


def search_flights_data(origin, dest, date_str=None):
    if flight_api_error:
        return {"success": False, "error": f"Import Error: {flight_api_error}"}

    try:
        fr_api = FlightRadar24API()
        
        flights_found = []
        
        def get_date_from_ts(ts):
            if not ts: return None
            import datetime
            return datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')

        def fetch_page(page):
            try:
               
                return fr_api.get_airport_details(origin, page=page)
            except:
                return None

        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            results = list(executor.map(fetch_page, range(1, 7)))

        for details in results:
            if not details: continue
            
            if 'airport' in details and 'pluginData' in details['airport']:
                plugin_data = details['airport']['pluginData']
                if 'schedule' in plugin_data and 'departures' in plugin_data['schedule']:
                    departures = plugin_data['schedule']['departures']['data']
                    
                    for item in departures:
                        flight = item.get('flight', {})
                        if not flight: continue
                        
                        flight_dest = flight.get('airport', {}).get('destination', {}).get('code', {}).get('iata')
                        
                        
                        if flight_dest == dest:
                            airline = flight.get('airline') or {}
                            aircraft = flight.get('aircraft') or {}
                            status = flight.get('status') or {}
                            times = flight.get('time') or {}
                            identification = flight.get('identification') or {}
                            
                            
                            scheduled_ts = times.get('scheduled', {}).get('departure')
                            if date_str and scheduled_ts:
                                flight_date = get_date_from_ts(scheduled_ts)
                                
                                if flight_date != date_str:
                                    
                                    pass 
                            
                            airline_iata = airline.get('code', {}).get('iata')
                            airline_icao = airline.get('code', {}).get('icao')
                            
                            
                            logo_url = None
                            if airline_iata:
                                logo_url = f"https://pics.avs.io/200/200/{airline_iata}.png"
                            elif airline_icao:
                                
                                pass

                            flights_found.append({
                                "id": identification.get('id'),
                                "flight_number": identification.get('number', {}).get('default'),
                                "airline": {
                                    "name": airline.get('name'),
                                    "code": airline_iata,
                                    "logo": logo_url
                                },
                                "aircraft": {
                                    "model": aircraft.get('model', {}).get('text'),
                                    "code": aircraft.get('model', {}).get('code')
                                },
                                "time": {
                                    "scheduled": scheduled_ts,
                                    "estimated": times.get('estimated', {}).get('departure'),
                                    "real": times.get('real', {}).get('departure')
                                },
                                "status": status.get('text')
                            })
        
       
        unique_flights = []
        seen = set()
        for f in flights_found:
            key = f"{f['flight_number']}_{f['time']['scheduled']}"
            if key not in seen:
                seen.add(key)
                unique_flights.append(f)
                
        return {"success": True, "data": unique_flights}
        
    except Exception as e:
        return {"success": False, "error": str(e)}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urlparse(self.path).query
        params = parse_qs(query)
        origin = params.get('origin', [''])[0]
        dest = params.get('dest', [''])[0]
        date_str = params.get('date', [None])[0]
        
        if not origin or not dest:
             result = {"success": False, "error": "Missing origin or destination"}
        else:
             result = search_flights_data(origin, dest, date_str)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode('utf-8'))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Missing arguments"}))
    else:
        origin = sys.argv[1]
        dest = sys.argv[2]
        date_str = sys.argv[3] if len(sys.argv) > 3 else None
        print(json.dumps(search_flights_data(origin, dest, date_str)))
