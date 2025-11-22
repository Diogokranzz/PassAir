from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
flight_api_error = None
try:
    from FlightRadar24 import FlightRadar24API
except ImportError as e1:
    try:
        from FlightRadarAPI import FlightRadarAPI as FlightRadar24API
    except ImportError as e2:
        flight_api_error = f"Primary: {e1} | Fallback: {e2}"
import sys
import json
import uuid
import datetime


def get_live_departures_data(airport_iata="GRU"):
    if flight_api_error:
        return {"success": False, "error": f"Import Error: {flight_api_error}"}

    try:
        fr_api = FlightRadar24API()
        departures = []
        
        try:
            details = fr_api.get_airport_details(airport_iata)
            
            if 'airport' in details and 'pluginData' in details['airport']:
                plugin_data = details['airport']['pluginData']
                if 'schedule' in plugin_data and 'departures' in plugin_data['schedule']:
                    data = plugin_data['schedule']['departures']['data']
                    
                    for item in data:
                        flight = item.get('flight', {})
                        if not flight: continue
                        
                        identification = flight.get('identification', {})
                        airline = flight.get('airline') or {}
                        aircraft = flight.get('aircraft') or {}
                        status = flight.get('status', {}).get('text') or "Scheduled"
                        
                        times = flight.get('time', {})
                        scheduled_dep = times.get('scheduled', {}).get('departure')
                        scheduled_arr = times.get('scheduled', {}).get('arrival')
                        
                        duration_str = "N/A"
                        if scheduled_dep and scheduled_arr:
                            try:
                                dep_dt = datetime.datetime.fromtimestamp(scheduled_dep)
                                arr_dt = datetime.datetime.fromtimestamp(scheduled_arr)
                                diff = arr_dt - dep_dt
                                hours, remainder = divmod(diff.seconds, 3600)
                                minutes = remainder // 60
                                duration_str = f"{hours}h {minutes}m"
                            except:
                                pass

                        dep_time_str = "TBD"
                        if scheduled_dep:
                            dep_time_str = datetime.datetime.fromtimestamp(scheduled_dep).strftime('%H:%M')
                            
                        arr_time_str = "TBD"
                        if scheduled_arr:
                            arr_time_str = datetime.datetime.fromtimestamp(scheduled_arr).strftime('%H:%M')

                        airline_iata = airline.get('code', {}).get('iata')
                        airline_icao = airline.get('code', {}).get('icao')
                        
                        flight_number = identification.get('number', {}).get('default') or "N/A"
                        
                        # Fix "N/A" callsign by using flight number
                        callsign = identification.get('callsign')
                        if not callsign or callsign == "N/A":
                            callsign = flight_number

                        if not airline_icao and flight_number != "N/A":
                            import re
                            # Try to extract code from flight number
                            match = re.match(r'^([A-Z0-9]{2,3})\d+', flight_number)
                            if match:
                                code = match.group(1)
                                if len(code) == 3:
                                    airline_icao = code
                                elif len(code) == 2:
                                    # Common IATA to ICAO mapping for GRU airlines
                                    iata_map = {
                                        'LA': 'LAN', 'JJ': 'TAM', # LATAM
                                        'G3': 'GLO', # GOL
                                        'AD': 'AZU', # Azul
                                        'ET': 'ETH', # Ethiopian
                                        'TP': 'TAP', # TAP Portugal
                                        'AF': 'AFR', # Air France
                                        'KL': 'KLM', # KLM
                                        'IB': 'IBE', # Iberia
                                        'UX': 'AEA', # Air Europa
                                        'BA': 'BAW', # British Airways
                                        'LH': 'DLH', # Lufthansa
                                        'LX': 'SWR', # Swiss
                                        'TK': 'THY', # Turkish
                                        'QR': 'QTR', # Qatar
                                        'EK': 'UAE', # Emirates
                                        'AA': 'AAL', # American
                                        'UA': 'UAL', # United
                                        'DL': 'DAL', # Delta
                                        'AC': 'ACA', # Air Canada
                                        'AM': 'AMX', # Aeromexico
                                        'CM': 'CMP', # Copa
                                        'AV': 'AVA', # Avianca
                                        'AR': 'ARG', # Aerolineas Argentinas
                                        'H2': 'SKU', # Sky Airline
                                        'JA': 'JAT', # JetSmart
                                        'BO': 'BOL', # Boliviana
                                        'PY': 'SUR', # Surinam
                                    }
                                    airline_icao = iata_map.get(code)
                        
                        logo_code = airline_iata or airline_icao
                        # If we still don't have a logo code but have a flight number code, use that
                        if not logo_code and flight_number != "N/A":
                             import re
                             match = re.match(r'^([A-Z0-9]{2,3})\d+', flight_number)
                             if match:
                                 logo_code = match.group(1)

                        logo_url = f"https://pics.avs.io/200/200/{logo_code}.png" if logo_code else None

                        departures.append({
                            "id": identification.get('id') or str(uuid.uuid4()),
                            "callsign": callsign,
                            "flight_number": flight_number,
                            "origin": airport_iata,
                            "destination": flight.get('airport', {}).get('destination', {}).get('code', {}).get('iata') or "N/A",
                            "airline": airline.get('name') or "Unknown",
                            "airline_icao": airline_icao,
                            "airline_logo": logo_url,
                            "aircraft": aircraft.get('model', {}).get('text') or "N/A",
                            "status": status,
                            "duration": duration_str,
                            "departureTime": dep_time_str,
                            "arrivalTime": arr_time_str
                        })
        except Exception as e:
            pass

        if not departures:
            bounds = fr_api.get_bounds_by_point(-23.432, -46.469, 40000)
            flights = fr_api.get_flights(bounds=bounds)
            
            for f in flights:
                if f.origin_airport_iata == airport_iata:
                    departures.append({
                        "id": f.id or str(uuid.uuid4()),
                        "callsign": f.callsign or "N/A",
                        "flight_number": f.number or f.callsign or "N/A",
                        "origin": f.origin_airport_iata,
                        "destination": f.destination_airport_iata or "N/A",
                        "airline": f.airline_iata or f.airline_icao or "Unknown",
                        "airline_icao": f.airline_icao,
                        "airline_logo": f"https://pics.avs.io/200/200/{f.airline_iata}.png" if f.airline_iata else None,
                        "aircraft": f.aircraft_code or "N/A",
                        "status": "En Route" if f.on_ground == 0 else "On Ground",
                        "duration": "N/A",
                        "departureTime": "Now",
                        "arrivalTime": "TBD"
                    })

        return {"success": True, "data": departures[:6]}
        
    except Exception as e:
        return {"success": False, "error": str(e)}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urlparse(self.path).query
        params = parse_qs(query)
        airport = params.get('airport', ['GRU'])[0]
        
        result = get_live_departures_data(airport)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode('utf-8'))


if __name__ == "__main__":
    airport = sys.argv[1] if len(sys.argv) > 1 else "GRU"
    print(json.dumps(get_live_departures_data(airport)))
