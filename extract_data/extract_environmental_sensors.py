import json
import os
import random
from datetime import datetime, timedelta

def generate_environmental_sensors():
    os.makedirs('public/data', exist_ok=True)
    
    # 1. JPS Water Level Sensors (Simulated real-time data for Ampang Rivers)
    water_sensors = [
        {"id": "WL01", "name": "Sg. Ampang at Ampang Point", "lat": 3.1583, "lon": 101.7514, "type": "River Level", "threshold": 28.5},
        {"id": "WL02", "name": "Sg. Klang at MRR2", "lat": 3.1650, "lon": 101.7580, "type": "River Level", "threshold": 26.0},
        {"id": "WL03", "name": "Sg. Sering at Ukay Perdana", "lat": 3.1850, "lon": 101.7630, "type": "River Level", "threshold": 32.0},
        {"id": "WL04", "name": "Sg. Kerayong at Bukit Antarabangsa", "lat": 3.1900, "lon": 101.7680, "type": "River Level", "threshold": 45.0}
    ]

    water_features = []
    for sensor in water_sensors:
        # Simulate live water level fluctuating around the danger threshold
        current_level = round(sensor["threshold"] * random.uniform(0.7, 1.05), 2)
        status = "Normal"
        color = "#22c55e" # Green
        if current_level > sensor["threshold"] * 0.9:
            status = "Alert"
            color = "#eab308" # Yellow
        if current_level >= sensor["threshold"]:
            status = "Danger"
            color = "#ef4444" # Red
            
        water_features.append({
            "type": "Feature",
            "properties": {
                "id": sensor["id"],
                "name": sensor["name"],
                "type": sensor["type"],
                "level": current_level,
                "threshold": sensor["threshold"],
                "status": status,
                "color": color,
                "last_updated": datetime.now().isoformat()
            },
            "geometry": {
                "type": "Point",
                "coordinates": [sensor["lon"], sensor["lat"]]
            }
        })

    with open('public/data/live-water-levels.geojson', 'w') as f:
        json.dump({"type": "FeatureCollection", "features": water_features}, f)

    # 2. APIMS Air Quality Sensors (Simulated real-time data for Ampang)
    aqi_sensors = [
        {"id": "AQ01", "name": "APIMS Station - Ampang Jaya", "lat": 3.1495, "lon": 101.7631, "type": "Air Quality"},
        {"id": "AQ02", "name": "APIMS Station - Cheras/Pandan", "lat": 3.1310, "lon": 101.7500, "type": "Air Quality"},
        {"id": "AQ03", "name": "APIMS Station - Melawati", "lat": 3.1950, "lon": 101.7550, "type": "Air Quality"}
    ]

    aqi_features = []
    for sensor in aqi_sensors:
        # Simulate live AQI
        current_aqi = int(random.uniform(30, 85))
        status = "Good"
        color = "#22c55e" # Green
        if current_aqi > 50:
            status = "Moderate"
            color = "#eab308" # Yellow
        if current_aqi > 100:
            status = "Unhealthy"
            color = "#f97316" # Orange
            
        aqi_features.append({
            "type": "Feature",
            "properties": {
                "id": sensor["id"],
                "name": sensor["name"],
                "type": sensor["type"],
                "aqi": current_aqi,
                "status": status,
                "color": color,
                "last_updated": datetime.now().isoformat()
            },
            "geometry": {
                "type": "Point",
                "coordinates": [sensor["lon"], sensor["lat"]]
            }
        })

    with open('public/data/live-aqi.geojson', 'w') as f:
        json.dump({"type": "FeatureCollection", "features": aqi_features}, f)

    print(" -> Saved live-water-levels.geojson")
    print(" -> Saved live-aqi.geojson")

if __name__ == "__main__":
    generate_environmental_sensors()