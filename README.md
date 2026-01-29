AI-Powered Worker Productivity Dashboard

Live Application

Frontend Dashboard:
https://ai-powered-worker-productivity-dashboard-ore4.onrender.com

Backend API:
https://worker-backend-xszq.onrender.com

GitHub Repository:
https://github.com/ashutoshcodes1/AI-powered-worker-productivity-dashboard.git


1. Project Overview

This project is a production-style full-stack web application that demonstrates how AI-powered CCTV systems can be used to monitor worker activity and compute productivity metrics in a manufacturing factory.

The AI/computer vision system itself is out of scope. It is assumed to already exist and generate structured events.
This application focuses on:

Ingesting AI-generated events

Persisting them in a database

Computing productivity metrics

Displaying them in a dashboard

The system is implemented using a sample factory setup with 6 workers and 6 workstations, as specified in the assignment.

2. Architecture (Edge → Backend → Dashboard)
Edge (AI CCTV Cameras)

AI cameras detect worker activity and emit structured JSON events

Example event types:

working

idle

absent

product_count

Each event contains:

Timestamp

Worker ID

Workstation ID

Event type

Confidence score

Product count (for production events)

Backend

Implemented using Node.js

Receives events via REST APIs

Stores all events in a SQLite database

Computes worker-level, workstation-level, and factory-level metrics

Exposes metric APIs for the frontend

Dockerized for local execution

Frontend Dashboard

Implemented using Next.js

Fetches metrics from backend APIs

Displays:

Factory-level summary metrics

Worker-level productivity table

Workstation-level productivity table

Supports filtering by worker and workstation

Periodically refreshes data

3. Sample Setup

The application is pre-configured with:

6 workers (worker_id, name)

6 workstations (station_id, name)

Dummy events are seeded into the database so that the dashboard shows meaningful metrics on first run.
Dummy data can be refreshed or additional events can be added using backend APIs, without editing the database or frontend code.

4. Backend APIs
Event Ingestion API
POST /events


Example payload:

{
  "timestamp": "2026-01-15T10:15:00Z",
  "worker_id": "W1",
  "workstation_id": "S3",
  "event_type": "working",
  "confidence": 0.93,
  "count": 1
}

Metrics APIs

GET /metrics/factory

GET /metrics/workers

GET /metrics/workstations

5. Database Design

The system uses SQLite with the following tables:

Workers

worker_id

name

Workstations

station_id

name

Events

timestamp

worker_id

workstation_id

event_type

confidence

count

All AI events are persisted and used for metric calculations.

6. Metric Definitions and Assumptions
Time-Based Assumption

Each working or idle event represents the worker or workstation state until the next event for the same entity.

Duration = difference between consecutive event timestamps

Events are sorted by timestamp before computing metrics.

Worker-Level Metrics

Total Active Time (minutes)
Sum of durations where the worker is in working state

Total Idle Time (minutes)
Sum of durations where the worker is in idle state

Utilization Percentage

active_time / (active_time + idle_time) × 100


Total Units Produced
Sum of count from product_count events

Units per Hour

units_produced / active_hours

Workstation-Level Metrics

Occupancy Time (minutes)
Time the workstation is in working state

Utilization Percentage

occupied_time / (occupied_time + idle_time) × 100


Total Units Produced

Throughput Rate (units per hour)

units_produced / occupied_hours


Unique Workers
Number of distinct workers who used the workstation

Factory-Level Metrics

Total productive time (derived from worker activity)

Total production count

Average production rate across workers/workstations

Average utilization across workers

Active workers (defined as workers with at least one event in the observed time window)

Active workstations (defined as workstations with at least one event in the observed time window)

7. Handling System Challenges
Intermittent Connectivity

Events are timestamped at the source

Backend processes events whenever they arrive

Metrics are recomputed from stored data

Duplicate Events

Duplicate events can be detected using a combination of timestamp, worker ID, workstation ID, and event type

Current implementation assumes reasonable upstream behavior

Out-of-Order Timestamps

Events are sorted by timestamp before metric computation

Ensures correct time-based calculations even if events arrive late

8. Model Lifecycle (Conceptual)
Model Versioning

Include a model_version field in event payloads

Track metrics per model version

Model Drift Detection

Monitor trends such as:

Decreasing confidence scores

Increased idle time

Reduced throughput

Retraining Triggers

Sustained drop in confidence

Consistent decrease in productivity metrics

Increased misclassification indicators

9. Scalability
Scaling from 5 to 100+ Cameras

Stateless backend APIs

Horizontal scaling behind a load balancer

Centralized or distributed event storage

Multi-Site Scaling

Add site_id to events

Compute metrics per site

Aggregate metrics across sites in a central dashboard

10. Containerization and Running Locally
Backend
docker build -t factory-backend .
docker run -p 3000:3000 factory-backend


Backend API will be available at:

http://localhost:3000

Frontend
npm install
npm run dev


Frontend runs at:

http://localhost:3001

11. Tools Used

Backend: Node.js, SQLite, Docker

Frontend: Next.js

UI generation: v0

Backend scaffolding: Bolt

12. Conclusion

This project satisfies all requirements of the technical assessment:

AI event ingestion

Persistent storage

Time-based productivity metrics

Worker, workstation, and factory-level views

Usable dashboard with filtering

Dockerized backend

Clear assumptions and scalability considerations