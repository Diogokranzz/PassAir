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

        # Final Fallback: Static images for common airline/aircraft combinations
        if not image_url and airline_icao:
            STATIC_IMAGES = {
                "LAN_A32": "https://cdn.jetphotos.com/400/5/889433_1745494364.jpg?v=0", # LATAM A320 fam
                "TAM_A32": "https://cdn.jetphotos.com/400/5/889433_1745494364.jpg?v=0", # LATAM A320 fam
                "GLO_B73": "https://cdn.jetphotos.com/400/5/1166417_1755987529.jpg?v=0", # GOL 737 fam
                "AZU_E19": "https://cdn.jetphotos.com/400/5/818842_1758043089.jpg?v=0", # Azul E195
                "AZU_AT7": "https://cdn.jetphotos.com/400/6/1353548_1752808693.jpg?v=0", # Azul ATR
                "AZU_A32": "https://cdn.jetphotos.com/400/6/58970_1697983802.jpg?v=0",  # Azul A320
                "ETH_B78": "https://cdn.jetphotos.com/400/5/449518_1760903836.jpg?v=0", # Ethiopian 787
                "ETH_B77": "https://cdn.jetphotos.com/400/6/78609_1709488842.jpg?v=0", # Ethiopian 777
                "TAP_A33": "https://cdn.jetphotos.com/400/5/441714_1761435923.jpg?v=0", # TAP A330
                "TAP_A32": "https://cdn.jetphotos.com/400/6/22683_1666548866.jpg?v=0", # TAP A321
                "AVA_A32": "https://cdn.jetphotos.com/400/6/1162486_1755630182.jpg?v=0", # Avianca A320
                "AAL_B77": "https://cdn.jetphotos.com/400/6/59532_1683418982.jpg?v=0", # American 777
                "UAL_B77": "https://cdn.jetphotos.com/400/6/37635_1695085682.jpg?v=0", # United 777
                "DAL_A33": "https://cdn.jetphotos.com/400/6/95562_1694905682.jpg?v=0", # Delta A330
            }
            
            # Try to match simplified keys
            ac_code_simple = ""
            if aircraft_code:
                import re
                match = re.search(r'([A-Z0-9]{3})', aircraft_code)
                if match:
                    ac_code_simple = match.group(1)
            
            key = f"{airline_icao}_{ac_code_simple}"
            
            # Try exact match first (though keys are simplified)
            if key in STATIC_IMAGES:
                image_url = STATIC_IMAGES[key]
            else:
                # Try partial match
                for k, url in STATIC_IMAGES.items():
                    parts = k.split('_')
                    if len(parts) == 2:
                        if parts[0] == airline_icao and parts[1] in (aircraft_code or ""):
                            image_url = url
                            break

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
