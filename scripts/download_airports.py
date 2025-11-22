import requests
import json
import os

def download_airports():
    url = "https://raw.githubusercontent.com/mwgg/Airports/master/airports.json"
    print(f"Downloading airports from {url}...")
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        processed_airports = []
        for code, details in data.items():
            if details.get('iata'):
                processed_airports.append({
                    "iata": details['iata'],
                    "name": details['name'],
                    "city": details['city'],
                    "country": details['country'],
                    "lat": details['lat'],
                    "lon": details['lon']
                })
        
        
        processed_airports.sort(key=lambda x: x['iata'])
        
        output_dir = "api/data"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        output_file = os.path.join(output_dir, "airports.json")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(processed_airports, f, ensure_ascii=False, indent=None) # Minified
            
        print(f"Saved {len(processed_airports)} airports to {output_file}")
        
    except Exception as e:
        print(f"Failed to download airports: {e}")

if __name__ == "__main__":
    download_airports()
