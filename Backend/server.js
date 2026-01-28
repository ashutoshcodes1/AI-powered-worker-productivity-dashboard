const express = require('express');
const cors = require('cors');
const { db, clearAndReseedData } = require('./database');
const {
  calculateWorkerMetrics,
  calculateWorkstationMetrics,
  calculateFactoryMetrics
} = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Factory Productivity Dashboard API',
    version: '1.0.0',
    endpoints: [
      'POST /events',
      'GET /metrics/workers',
      'GET /metrics/workstations',
      'GET /metrics/factory',
      'POST /admin/seed'
    ]
  });
});

app.post('/events', (req, res) => {
  try {
    const event = req.body;

    if (!event.timestamp || !event.event_type) {
      return res.status(400).json({
        error: 'Missing required fields: timestamp and event_type are required'
      });
    }

    const validEventTypes = ['working', 'idle', 'absent', 'product_count'];
    if (!validEventTypes.includes(event.event_type)) {
      return res.status(400).json({
        error: `Invalid event_type. Must be one of: ${validEventTypes.join(', ')}`
      });
    }

    const stmt = db.prepare(`
      INSERT INTO events (timestamp, worker_id, workstation_id, event_type, confidence, count)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      event.timestamp,
      event.worker_id || null,
      event.workstation_id || null,
      event.event_type,
      event.confidence || null,
      event.count || 1
    );

    res.status(201).json({
      message: 'Event ingested successfully',
      event_id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error ingesting event:', error);
    res.status(500).json({
      error: 'Failed to ingest event',
      details: error.message
    });
  }
});

app.get('/metrics/workers', (req, res) => {
  try {
    const metrics = calculateWorkerMetrics();
    res.json({
      total_workers: metrics.length,
      workers: metrics
    });
  } catch (error) {
    console.error('Error calculating worker metrics:', error);
    res.status(500).json({
      error: 'Failed to calculate worker metrics',
      details: error.message
    });
  }
});

app.get('/metrics/workstations', (req, res) => {
  try {
    const metrics = calculateWorkstationMetrics();
    res.json({
      total_workstations: metrics.length,
      workstations: metrics
    });
  } catch (error) {
    console.error('Error calculating workstation metrics:', error);
    res.status(500).json({
      error: 'Failed to calculate workstation metrics',
      details: error.message
    });
  }
});

app.get('/metrics/factory', (req, res) => {
  try {
    const metrics = calculateFactoryMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error calculating factory metrics:', error);
    res.status(500).json({
      error: 'Failed to calculate factory metrics',
      details: error.message
    });
  }
});

app.post('/admin/seed', (req, res) => {
  try {
    clearAndReseedData();
    res.json({
      message: 'Database reseeded successfully with dummy data'
    });
  } catch (error) {
    console.error('Error reseeding database:', error);
    res.status(500).json({
      error: 'Failed to reseed database',
      details: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Factory Dashboard API running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/`);
});
