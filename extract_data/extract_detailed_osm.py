import os
import subprocess
from datetime import datetime

# Ampang Jaya exact bounding box or approximate central radius
BBOX = "3.11,101.73,3.19,101.80"

def run_overpass_query(query_name, overpass_query, output_filename):
    print(f"Extracting {query_name}...")
    try:
        # Use curl to bypass python urllib headers issues with Overpass
        cmd = [
            'curl', '-s', '-X', 'POST', 'https://overpass-api.de/api/interpreter',
            '-d', overpass_query,
            '-o', output_filename
        ]
        subprocess.run(cmd, check=True)
        size = os.path.getsize(output_filename)
        print(f" -> Saved {output_filename} ({size // 1024} KB)")
        return True
    except Exception as e:
        print(f" -> Error extracting {query_name}: {e}")
        return False

def extract_detailed_osm():
    os.makedirs('public/data', exist_ok=True)
    
    # 1. Parks and Green Spaces
    parks_query = f"""
    [out:json][timeout:90];
    (
      way["leisure"="park"]({BBOX});
      way["leisure"="pitch"]({BBOX});
      way["landuse"="recreation_ground"]({BBOX});
      way["landuse"="forest"]({BBOX});
      way["natural"="wood"]({BBOX});
    );
    out geom;
    """
    
    # 2. Water Bodies (Lakes, Rivers)
    water_query = f"""
    [out:json][timeout:90];
    (
      way["natural"="water"]({BBOX});
      way["waterway"="river"]({BBOX});
      way["waterway"="stream"]({BBOX});
    );
    out geom;
    """
    
    # 3. POIs (Hospitals, Schools, Police, Commercial)
    pois_query = f"""
    [out:json][timeout:90];
    (
      node["amenity"="hospital"]({BBOX});
      node["amenity"="clinic"]({BBOX});
      node["amenity"="school"]({BBOX});
      node["amenity"="police"]({BBOX});
      node["amenity"="fire_station"]({BBOX});
      node["amenity"="place_of_worship"]({BBOX});
      node["shop"="mall"]({BBOX});
      node["shop"="supermarket"]({BBOX});
    );
    out geom;
    """

    queries = [
        ("Parks & Forests", parks_query, "public/data/ampang-parks.json"),
        ("Water Bodies", water_query, "public/data/ampang-water.json"),
        ("Points of Interest", pois_query, "public/data/ampang-pois.json")
    ]
    
    for name, q, out in queries:
        run_overpass_query(name, q, out)

if __name__ == "__main__":
    print(f"--- High-Detail OSM Extraction Started at {datetime.now()} ---")
    extract_detailed_osm()
    print("--- Extraction Complete ---")
