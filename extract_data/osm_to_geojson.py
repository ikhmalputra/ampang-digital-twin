import json
import sys

def convert_osm_to_geojson(input_file, output_file):
    with open(input_file, 'r') as f:
        data = json.load(f)
        
    features = []
    for element in data.get('elements', []):
        tags = element.get('tags', {})
        
        if element['type'] == 'node':
            features.append({
                "type": "Feature",
                "properties": tags,
                "geometry": {
                    "type": "Point",
                    "coordinates": [element['lon'], element['lat']]
                }
            })
        elif element['type'] == 'way':
            if 'geometry' in element:
                coords = [[n['lon'], n['lat']] for n in element['geometry']]
                
                # Check if it's a polygon (first and last node are the same)
                is_polygon = len(coords) > 2 and coords[0] == coords[-1]
                
                geom_type = "Polygon" if is_polygon else "LineString"
                geom_coords = [coords] if is_polygon else coords
                
                features.append({
                    "type": "Feature",
                    "properties": tags,
                    "geometry": {
                        "type": geom_type,
                        "coordinates": geom_coords
                    }
                })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open(output_file, 'w') as f:
        json.dump(geojson, f)

if __name__ == "__main__":
    convert_osm_to_geojson(sys.argv[1], sys.argv[2])
