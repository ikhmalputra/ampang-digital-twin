CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS citizen_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS live_sensors (
    sensor_id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(50),
    location GEOMETRY(Point, 4326),
    latest_reading JSONB,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert mock sensor
INSERT INTO live_sensors (sensor_id, type, location, latest_reading)
VALUES (
    'AQI-001', 
    'air_quality', 
    ST_SetSRID(ST_MakePoint(101.7610, 3.1550), 4326),
    '{"pm25": 45, "status": "Moderate"}'
);
