from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sys
import json
try:
    from FlightRadar24 import FlightRadar24API
except ImportError:
    from FlightRadarAPI import FlightRadarAPI as FlightRadar24API
import concurrent.futures

class DummyFlight:
    def __init__(self, id):
        self.id = id


def get_flight_details_data(flight_id, airline_icao=None, aircraft_code=None):
    try:
        fr_api = FlightRadar24API()
        
        data = {}
        image_url = None

        if len(flight_id) <= 16:
            try:
                flight_obj = DummyFlight(flight_id)
                flight = fr_api.get_flight_details(flight_obj)
                
                if flight and "aircraft" in flight:
                    if "images" in flight["aircraft"] and flight["aircraft"]["images"]:
                        images = flight["aircraft"]["images"]
                        if "medium" in images and len(images["medium"]) > 0:
                            image_url = images["medium"][0]["src"]
                        elif "large" in images and len(images["large"]) > 0:
                            image_url = images["large"][0]["src"]
                    
                    if "airline" in flight and flight["airline"]:
                        data["airline"] = flight["airline"].get("name")
                    if "aircraft" in flight and flight["aircraft"]:
                        data["aircraft_model"] = flight["aircraft"].get("model", {}).get("text")
                    if "airport" in flight and flight["airport"]:
                        if "origin" in flight["airport"]:
                            data["origin"] = flight["airport"]["origin"].get("name")
                        if "destination" in flight["airport"]:
                            data["destination"] = flight["airport"]["destination"].get("name")
                    if "status" in flight and flight["status"]:
                        data["status"] = flight["status"].get("text")
            except Exception:
                pass

        if not image_url and airline_icao:
            try:
                flights = fr_api.get_flights(airline=airline_icao)
                flights = flights[:10]
                
                candidate_image = None
                fallback_image = None
                
                target_simplified = None
                if aircraft_code and aircraft_code != "N/A":
                    import re
                    match = re.search(r'(\d{3}|A3\d{2})', aircraft_code)
                    if match:
                        target_simplified = match.group(1)

                def check_candidate(f):
                    try:
                        details = fr_api.get_flight_details(f)
                        if 'aircraft' in details and 'images' in details['aircraft']:
                            images = details['aircraft']['images']
                            img_src = None
                            if 'medium' in images and images['medium']:
                                img_src = images['medium'][0]['src']
                            elif 'large' in images and images['large']:
                                img_src = images['large'][0]['src']
                            
                            if img_src:
                                return (f, img_src)
                    except:
                        pass
                    return None

                with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
                    results = list(executor.map(check_candidate, flights))

                for result in results:
                    if result:
                        f, img_src = result
                        
                        if not fallback_image:
                            fallback_image = img_src
                        
                        if target_simplified:
                            candidate_code = f.aircraft_code
                            
                            if target_simplified in candidate_code:
                                candidate_image = img_src
                                break
                            
                            if target_simplified == "A320" and "A20" in candidate_code:
                                candidate_image = img_src
                                break
                
                image_url = candidate_image or fallback_image
                                
            except Exception:
                pass

        if image_url:
            data["image_url"] = image_url
        
        return {"success": True, "data": data}

    except Exception as e:
        return {"success": False, "error": str(e)}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urlparse(self.path).query
        params = parse_qs(query)
        flight_id = params.get('id', [''])[0]
        airline_icao = params.get('airline_icao', [None])[0]
        aircraft_code = params.get('aircraft', [None])[0]
        
        if not flight_id:
             result = {"success": False, "error": "Missing flight ID"}
        else:
             result = get_flight_details_data(flight_id, airline_icao, aircraft_code)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode('utf-8'))


if __name__ == "__main__":
    if len(sys.argv) > 1:
        flight_id = sys.argv[1]
        airline_icao = sys.argv[2] if len(sys.argv) > 2 else None
        aircraft_code = sys.argv[3] if len(sys.argv) > 3 else None
        print(json.dumps(get_flight_details_data(flight_id, airline_icao, aircraft_code)))
    else:
        print(json.dumps({"success": False, "error": "No flight ID provided"}))
