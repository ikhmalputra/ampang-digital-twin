import urllib.request
import json
import os
from datetime import datetime

# Ampang is located in Selangor / Kuala Lumpur area
# We will fetch the latest weather forecast and warnings

def fetch_weather_forecast():
    print("Fetching Weather Forecast from data.gov.my...")
    url = "https://api.data.gov.my/weather/forecast"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
            # Filter for Kuala Lumpur / Selangor (specifically Ampang if available)
            kl_selangor_forecasts = []
            for item in data:
                location = item.get('location', {}).get('location_name', '')
                if 'Kuala Lumpur' in location or 'Ampang' in location:
                    kl_selangor_forecasts.append(item)
            
            with open('ampang_weather_forecast.json', 'w') as f:
                json.dump(kl_selangor_forecasts, f, indent=4)
            print(f"Saved {len(kl_selangor_forecasts)} forecast records to 'ampang_weather_forecast.json'")
            
            # Print a quick summary for Ampang if it exists, else KL
            for f in kl_selangor_forecasts:
                loc_name = f.get('location', {}).get('location_name', '')
                if 'Ampang' in loc_name or 'Kuala Lumpur' in loc_name:
                    print(f"Summary for {loc_name}:")
                    print(f" - Date: {f.get('date')}")
                    print(f" - Morning: {f.get('morning_forecast')}")
                    print(f" - Afternoon: {f.get('afternoon_forecast')}")
                    print(f" - Night: {f.get('night_forecast')}")
                    print(f" - Min Temp: {f.get('min_temp')}°C, Max Temp: {f.get('max_temp')}°C\n")
                    
    except Exception as e:
        print(f"Error fetching forecast: {e}")

def fetch_weather_warnings():
    print("Fetching Weather Warnings from data.gov.my...")
    url = "https://api.data.gov.my/weather/warning"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
            with open('weather_warnings.json', 'w') as f:
                json.dump(data, f, indent=4)
            print(f"Saved {len(data)} warning records to 'weather_warnings.json'")
            
    except Exception as e:
        print(f"Error fetching warnings: {e}")

if __name__ == "__main__":
    print(f"--- Data Extraction Started at {datetime.now()} ---")
    fetch_weather_forecast()
    fetch_weather_warnings()
    print("--- Data Extraction Complete ---")
