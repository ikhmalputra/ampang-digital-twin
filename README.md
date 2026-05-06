# Digital Twin Ampang Jaya & Local Authority Digital Brain

![MPAJ Logo](public/mpaj-logo.jpg)

## Overview

The **Digital Twin Ampang Jaya** is an Intelligent Command Centre built for Majlis Perbandaran Ampang Jaya (MPAJ). This platform provides a virtual replica of the area's physical and digital assets to enable real-time monitoring, analysis, and simulation for better decision-making under the Smart City framework.

This project focuses on providing 3D visualization for operational intelligence, real-time data integration, and predictive analysis to transition Ampang Jaya from reactive governance to predictive, data-driven, and intelligent city management.

## Key Features

- **3D Visualization & Mapping**: Detailed 3D model of Ampang Jaya, covering residential areas, commercial hubs, transport (Ampang LRT stations), public spaces, and critical infrastructure.
- **Intelligent Command Centre (ICC)**: A centralized dashboard for daily municipal operations, control of smart infrastructure, and scenario modeling.
- **Real-Time Data Integration**: Connection with IoT sensors for traffic monitoring, flood detection (Sungai Ampang), air quality, and waste management.
- **Simulation & Predictive Analysis**: Flood modeling, traffic flow simulation, and development impact assessment.
- **Smart Planning & Community Services**: Tools for development control, facility mapping, public engagement, and emergency response.

## Tech Stack

This project is built using modern web technologies tailored for high-performance geospatial visualization and user interface design:

- **Framework**: [Next.js](https://nextjs.org/) 15 (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Geospatial & 3D**:
  - [deck.gl](https://deck.gl/)
  - [Mapbox GL JS](https://www.mapbox.com/) / [MapLibre GL JS](https://maplibre.org/)
  - [Leaflet](https://leafletjs.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "ampang digital twin"
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The repository is structured to separate the frontend application logic from data extraction and processing pipelines:

- `/app`: Next.js App Router pages and API routes (dashboard, air-quality, traffic, etc.). Includes the main layout, CSS, and API integrations for OpenStreetMap (`/api/osm`) and Realtime data (`/api/realtime`).
- `/components`: Reusable React components. Includes:
  - `/command-center`: Domain-specific components like `city-map.tsx`, `layer-controls.tsx`, `alerts-panel.tsx`.
  - `/dashboard`: General dashboard layouts and metric cards.
  - `/ui`: Generic UI elements built with [shadcn/ui](https://ui.shadcn.com/) and Radix UI.
- `/lib`: Utility functions and map data configurations.
- `/hooks`: Custom React hooks (e.g., `use-mobile.ts`, `use-toast.ts`).
- `/public`: Static assets including geospatial data (GeoJSON files for boundaries, rivers, and realtime data) and images.
- `/extract_data`: Python scripts and JSON outputs for fetching external data.
  - `extract_datagovmy_weather.py`: Fetches weather forecasts and warnings from data.gov.my.
  - `extract_prasarana_gtfs.py`: Real-time public transport data for Rapid Bus & MRT feeder.
  - `extract_traffic_environment.py`: CCTV, air quality, and river level extraction.
  - `extract_sentinel1.py`: Extracts radar imagery and environmental data.
- `/styles`: Global CSS styles.

## Deployment & Production

The application utilizes **Vercel Analytics** to track usage in production. 

To create a production build:
```bash
npm run build
# and to start the production server
npm run start
```

## Goals & Smart City Alignment

This initiative aligns with the **Penarafan Bandar Pintar Malaysia**, aiming to propel MPAJ through the stages of Smart City adoption (Early Adopter → Developing → Leading → Visionary). The platform will help MPAJ achieve key indicators for smart city compliance (MS ISO 37122:2019).

## License

This project is proprietary and confidential. All rights reserved by the respective owners.
