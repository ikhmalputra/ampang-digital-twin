import json

# Center of MPAJ HQ for BIM
center_lng = 101.7550
center_lat = 3.1300

bim_data = {
    "floors": [],
    "hvac": []
}

# Generate 10 Floors (PolygonLayer)
for i in range(10):
    elevation = i * 4 # 4 meters per floor
    size = 0.0003
    polygon = [
        [center_lng - size, center_lat - size, elevation],
        [center_lng + size, center_lat - size, elevation],
        [center_lng + size, center_lat + size, elevation],
        [center_lng - size, center_lat + size, elevation],
        [center_lng - size, center_lat - size, elevation]
    ]
    bim_data["floors"].append({
        "polygon": polygon,
        "level": i,
        "elevation": elevation,
        "color": [255, 255, 255, 80] if i % 2 == 0 else [200, 200, 255, 80]
    })

# Generate HVAC Pipes (PathLayer in 3D)
for i in range(10):
    elevation = i * 4 + 3 # Just below ceiling
    # Main duct
    bim_data["hvac"].append({
        "path": [
            [center_lng - 0.0002, center_lat, elevation],
            [center_lng + 0.0002, center_lat, elevation]
        ],
        "type": "main",
        "color": [255, 100, 100, 255]
    })
    # Branch ducts
    bim_data["hvac"].append({
        "path": [
            [center_lng, center_lat - 0.0002, elevation],
            [center_lng, center_lat + 0.0002, elevation]
        ],
        "type": "branch",
        "color": [100, 100, 255, 255]
    })
    
# Vertical shaft
bim_data["hvac"].append({
    "path": [
        [center_lng - 0.0001, center_lat - 0.0001, 0],
        [center_lng - 0.0001, center_lat - 0.0001, 40]
    ],
    "type": "shaft",
    "color": [100, 255, 100, 255]
})

with open('public/data/ampang_bim_mock.json', 'w') as f:
    json.dump(bim_data, f)
print("BIM data generated.")
