import json
import random
import math

# Center of MRR2 and Jalan Ampang intersection
# [longitude, latitude]
center_lng = 101.7610
center_lat = 3.1550

# Routes defined by a few key waypoints
# We will interpolate points between them to create smooth paths
routes = [
    # Route 1: Jalan Ampang (Eastbound - KL to Ampang)
    [[101.748, 3.158], [101.758, 3.156], [101.761, 3.155], [101.770, 3.153], [101.780, 3.150]],
    # Route 2: Jalan Ampang (Westbound - Ampang to KL)
    [[101.780, 3.1502], [101.770, 3.1532], [101.761, 3.1552], [101.758, 3.1562], [101.748, 3.1582]],
    # Route 3: MRR2 (Northbound)
    [[101.758, 3.140], [101.760, 3.148], [101.761, 3.155], [101.762, 3.165], [101.763, 3.175]],
    # Route 4: MRR2 (Southbound)
    [[101.7628, 3.175], [101.7618, 3.165], [101.7608, 3.155], [101.7598, 3.148], [101.7578, 3.140]],
    # Route 5: Turn from Jalan Ampang to MRR2 South
    [[101.748, 3.158], [101.758, 3.156], [101.760, 3.155], [101.7598, 3.148], [101.7578, 3.140]],
    # Route 6: Turn from MRR2 North to Jalan Ampang East
    [[101.758, 3.140], [101.760, 3.148], [101.761, 3.155], [101.770, 3.153], [101.780, 3.150]]
]

def interpolate_route(waypoints, num_points):
    """Interpolate a smooth route between waypoints."""
    points = []
    total_segments = len(waypoints) - 1
    points_per_seg = num_points // total_segments
    
    for i in range(total_segments):
        start = waypoints[i]
        end = waypoints[i+1]
        for j in range(points_per_seg):
            fraction = j / float(points_per_seg)
            lng = start[0] + (end[0] - start[0]) * fraction
            lat = start[1] + (end[1] - start[1]) * fraction
            points.append([lng, lat])
    # Add final point
    points.append(waypoints[-1])
    return points

trips = []
NUM_VEHICLES = 300
SIMULATION_DURATION = 1000 # Time units

for i in range(NUM_VEHICLES):
    route_idx = random.randint(0, len(routes) - 1)
    base_route = routes[route_idx]
    
    # Introduce some slight lane variations so they don't completely overlap
    offset_lng = (random.random() - 0.5) * 0.0001
    offset_lat = (random.random() - 0.5) * 0.0001
    
    varied_route = [[p[0] + offset_lng, p[1] + offset_lat] for p in base_route]
    
    # Interpolate to 100 points
    num_points = 100
    path_points = interpolate_route(varied_route, num_points)
    
    # Generate timestamps
    # Start time between 0 and 500
    start_time = random.randint(0, SIMULATION_DURATION - 200)
    
    # Vehicle speed (time to traverse)
    # Simulate traffic jam at intersection (middle of the path)
    timestamps = []
    current_time = start_time
    
    for j in range(len(path_points)):
        # Base time increment
        time_inc = random.randint(2, 6)
        
        # If near the middle (intersection), slow down significantly (traffic jam)
        if 40 < j < 60:
            time_inc += random.randint(5, 15)
            
        current_time += time_inc
        timestamps.append(current_time)
        
    # Vehicle type (0: car, 1: bus/truck)
    v_type = 0 if random.random() < 0.9 else 1
    color = [255, 255, 255] if v_type == 0 else [255, 200, 0] # White cars, yellow buses
        
    trips.append({
        "vendor": v_type,
        "path": path_points,
        "timestamps": timestamps,
        "color": color
    })

# Output to JSON
with open('ampang_traffic_trips.json', 'w') as f:
    json.dump(trips, f)

print("Successfully generated 300 vehicle trips mimicking microscopic traffic.")
