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

class DummyFlight:
    def __init__(self, id):
        self.id = id


def get_flight_details_data(flight_id, airline_icao=None, aircraft_code=None):
    if flight_api_error:
        return {"success": False, "error": f"Import Error: {flight_api_error}"}

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
                    
                    # Extract airline logo if available in details
                    if "airline" in flight and flight["airline"]:
                        airline_data = flight["airline"]
                        airline_iata = airline_data.get("code", {}).get("iata")
                        airline_icao_code = airline_data.get("code", {}).get("icao")
                        logo_code = airline_iata or airline_icao_code
                        if logo_code:
                            data["airline_logo"] = f"https://pics.avs.io/200/200/{logo_code}.png"

            except Exception:
                pass

        if not image_url and airline_icao:
            try:
                # Fallback: Search for other flights by this airline to find a matching aircraft image
                flights = fr_api.get_flights(airline=airline_icao)
                flights = flights[:15] # Check up to 15 flights
                
                candidate_image = None
                fallback_image = None
                
                target_simplified = None
                if aircraft_code and aircraft_code != "N/A":
                    import re
                    # Extract core aircraft code (e.g., B738 from B738MAX)
                    match = re.search(r'([A-Z0-9]{3,4})', aircraft_code)
                    if match:
                        target_simplified = match.group(1)

                def check_candidate(f):
                    try:
                        # We need to get details to see images
                        details = fr_api.get_flight_details(f)
                        if 'aircraft' in details and 'images' in details['aircraft']:
                            images = details['aircraft']['images']
                            img_src = None
                            if 'medium' in images and len(images['medium']) > 0:
                                img_src = images['medium'][0]['src']
                            elif 'large' in images and len(images['large']) > 0:
                                img_src = images['large'][0]['src']
                            
                            if img_src:
                                return (f, img_src)
                    except:
                        pass
                    return None

                with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                    results = list(executor.map(check_candidate, flights))

                for result in results:
                    if result:
                        f_obj, img_src = result
                        
                        # Keep the first image found as a generic fallback
                        if not fallback_image:
                            fallback_image = img_src
                        
                        # If we have a target aircraft code, try to match it
                        if target_simplified:
                            candidate_code = f_obj.aircraft_code or ""
                            
                            # Exact or partial match
                            if target_simplified in candidate_code or candidate_code in target_simplified:
                                candidate_image = img_src
                                break
                            
                            # Specific handling for common families
                            if "A32" in target_simplified and "A32" in candidate_code: # A320 family
                                candidate_image = img_src
                                break
                            if "B73" in target_simplified and "B73" in candidate_code: # B737 family
                                candidate_image = img_src
                                break
                
                image_url = candidate_image or fallback_image
                                
            except Exception as e:
                # print(f"Fallback search error: {e}")
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
