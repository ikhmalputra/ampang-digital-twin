import paho.mqtt.client as mqtt
import time
import json
import random

BROKER = "localhost"
PORT = 1883
TOPIC = "ampang/sensors/water_level"

client = mqtt.Client()
client.connect(BROKER, PORT, 60)

print(f"Connected to MQTT Broker at {BROKER}:{PORT}")
print(f"Publishing to topic: {TOPIC}")

base_level = 10.0

try:
    while True:
        # Simulate slight water level fluctuations
        level = base_level + random.uniform(-0.5, 0.8)
        status = "Normal"
        if level > 12.0:
            status = "Warning"
        if level > 14.0:
            status = "Critical"

        payload = {
            "sensor_id": "SgAmpang-01",
            "water_level_m": round(level, 2),
            "status": status,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

        client.publish(TOPIC, json.dumps(payload))
        print(f"Published: {payload}")
        time.sleep(5) # Publish every 5 seconds
except KeyboardInterrupt:
    print("Simulation stopped.")
    client.disconnect()