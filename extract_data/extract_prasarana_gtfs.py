import urllib.request
import os
from datetime import datetime

def download_gtfs_realtime():
    print("Fetching GTFS Realtime Vehicle Positions from data.gov.my...")
    
    # RapidKL Buses and MRT Feeder buses operate around Ampang
    categories = ['rapid-bus-kl', 'rapid-bus-mrtfeeder']
    
    for category in categories:
        url = f"https://api.data.gov.my/gtfs-realtime/vehicle-position/prasarana?category={category}"
        output_file = f"prasarana_{category}_realtime.pb"
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = response.read()
                
                with open(output_file, 'wb') as f:
                    f.write(data)
                
                print(f"Saved {len(data)} bytes to '{output_file}'")
                
        except Exception as e:
            print(f"Error fetching {category}: {e}")

if __name__ == "__main__":
    print(f"--- GTFS Data Extraction Started at {datetime.now()} ---")
    download_gtfs_realtime()
    print("--- GTFS Data Extraction Complete ---")
    print("Note: The downloaded files are in Protocol Buffer (.pb) format.")
    print("To decode them in Python, you can install the 'gtfs-realtime-bindings' package.")
    print("Command: pip install gtfs-realtime-bindings")
