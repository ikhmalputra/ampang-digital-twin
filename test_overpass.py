import urllib.request
import urllib.parse
import json

overpass_url = "http://overpass-api.de/api/interpreter"
overpass_query = """
[out:json];
area["name"="Ampang Jaya"]->.searchArea;
(
  way["landuse"](area.searchArea);
  relation["landuse"](area.searchArea);
);
out geom;
"""
data = urllib.parse.urlencode({'data': overpass_query}).encode('utf-8')
req = urllib.request.Request(overpass_url, data=data)
with urllib.request.urlopen(req) as response:
    result = json.loads(response.read().decode('utf-8'))
    print(f"Got {len(result.get('elements', []))} elements")
