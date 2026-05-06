import json
import math

# Center of Flood (Sungai Ampang)
center_lng = 101.7610
center_lat = 3.1550

flood_data = []

# Generate a grid
grid_size = 20
cell_size = 0.0005

for x in range(grid_size):
    for y in range(grid_size):
        lng = center_lng + (x - grid_size/2) * cell_size
        lat = center_lat + (y - grid_size/2) * cell_size
        
        # Distance from river center
        dist = math.sqrt((x - grid_size/2)**2 + (y - grid_size/2)**2)
        
        # Generate time-series depths
        depths = []
        for t in range(100): # 100 time steps
            # Water spreads outwards over time
            # If time is greater than distance * some factor, water starts rising
            if t > dist * 3:
                # Depth increases based on how close to center and how much time has passed
                depth = min(5, (t - dist * 3) * 0.1) 
            else:
                depth = 0
            depths.append(depth)
            
        flood_data.append({
            "position": [lng, lat],
            "depths": depths,
            "distance": dist
        })

with open('public/data/ampang_flood_sim.json', 'w') as f:
    json.dump(flood_data, f)
print("Flood simulation data generated.")
