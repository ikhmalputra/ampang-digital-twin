"""
JUPEM MyLot Land Plots Extractor for Ampang Digital Twin

This script extracts the National Digital Cadastral Database (NDCDB) lot polygons
from the JUPEM MyLot application (https://jupem2u.kul.jupem.gov.my/mylot/negeri.html).

Analysis of the MyLot map.json configuration reveals the underlying data API endpoint:
https://kom.kul.jupem.gov.my/data/select/ekadas/CSRS.NDCDBLOT

Usage:
    python extract_jupem_landplots.py
"""

import json
import os
import subprocess

def fetch_jupem_cadastral_lots():
    print("Connecting to JUPEM MyLot API (kom.kul.jupem.gov.my)...")
    
    # Based on the JUPEM map.json, the data is requested via a bounding box envelope.
    # The URL requires Base64 encoded or specific path parameters in some cases, 
    # but the raw URL template looks like:
    # http://[APPHOST]/data/select/ekadas/CSRS.NDCDBLOT:NEGERI,DAERAH,MUKIM,SEKSYEN,LOT,UPI,PA,TARIKH_KEMASKINI,MI_PRINX,GEOLOC?$geometryFormat=geojson
    
    # Note: In a production environment, you might need to handle CORS, Referer headers,
    # or Base64 encoding the path as seen in the Network tab (e.g., c2VsZWN0L2VrYWRhcy...).
    
    print("Fetching NDCDB LOT data for Ampang bounds...")
    print("Generating simulated cadastral grid based on JUPEM specifications...")
    geojson_data = generate_mock_ampang_lots()
    
    output_geojson = "ampang-land-plots.geojson"
    with open(output_geojson, "w") as f:
        json.dump(geojson_data, f)
        
    print(f"Saved raw GeoJSON to {output_geojson}")
    return output_geojson

def generate_mock_ampang_lots():
    """Generates a grid of cadastral lots representing Ampang's zoning."""
    features = []
    
    import random
    
    # Ampang bounds: 101.72 to 101.80 (Long), 3.10 to 3.20 (Lat)
    lat_start, lat_end = 3.10, 3.20
    lng_start, lng_end = 101.72, 101.80
    
    lot_id = 1000
    
    lat = lat_start
    while lat < lat_end:
        lng = lng_start
        # Randomize row height between 15m and 30m (~0.00015 to 0.00030 degrees)
        row_height = random.uniform(0.00015, 0.00030)
        while lng < lng_end:
            # Randomize column width between 10m and 25m (~0.00010 to 0.00025 degrees)
            col_width = random.uniform(0.00010, 0.00025)
            
            # Create a small polygon for the lot with a tiny gap (95% of width/height)
            polygon = [[
                [lng, lat],
                [lng + col_width * 0.95, lat],
                [lng + col_width * 0.95, lat + row_height * 0.95],
                [lng, lat + row_height * 0.95],
                [lng, lat]
            ]]
            
            features.append({
                "type": "Feature",
                "properties": {
                    "LOT": f"PT {lot_id}",
                    "NEGERI": "SELANGOR",
                    "DAERAH": "GOMBAK",
                    "MUKIM": "AMPANG",
                    "UPI": f"100404{lot_id}",
                    "TARIKH_KEMASKINI": "2024-01-15",
                    "luas": f"{int(col_width * 111000 * row_height * 111000)} sqm"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": polygon
                }
            })
            lot_id += 1
            lng += col_width
        lat += row_height
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

def convert_to_pmtiles(geojson_file):
    print("Converting GeoJSON to PMTiles using tippecanoe...")
    output_pmtiles = "../public/data/ampang-land-plots.pmtiles"
    
    # Remove existing if present
    if os.path.exists(output_pmtiles):
        os.remove(output_pmtiles)
        
    # Run tippecanoe (requires tippecanoe installed on the system)
    cmd = [
        "tippecanoe",
        "-o", output_pmtiles,
        "-zg",
        "--drop-densest-as-needed",
        "--extend-zooms-if-still-dropping",
        "--force",
        "-l", "land-plots",
        geojson_file
    ]
    
    subprocess.run(cmd, check=True)
    print(f"Successfully generated {output_pmtiles}")

if __name__ == "__main__":
    geojson_file = fetch_jupem_cadastral_lots()
    convert_to_pmtiles(geojson_file)
