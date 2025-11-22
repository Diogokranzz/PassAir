from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            query_params = parse_qs(urlparse(self.path).query)
            q = query_params.get('q', [''])[0].lower()
            
            if not q or len(q) < 2:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "data": []}).encode('utf-8'))
                return

            
            json_path = os.path.join(os.path.dirname(__file__), 'data', 'airports.json')
            
            with open(json_path, 'r', encoding='utf-8') as f:
                airports = json.load(f)
            
           
            results = []
            count = 0
            limit = 10
            
            for airport in airports:
                
                if (q in airport['iata'].lower() or 
                    q in airport['name'].lower() or 
                    q in airport['city'].lower()):
                    
                    results.append(airport)
                    count += 1
                    if count >= limit:
                        break
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "data": results}).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
