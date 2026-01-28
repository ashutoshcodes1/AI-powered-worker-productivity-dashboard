const { db } = require('./database');

function calculateWorkerMetrics() {
  const workers = db.prepare('SELECT * FROM workers').all()

  return workers.map(worker => {
    // 1. Get all events for worker ordered by time
    const events = db.prepare(`
      SELECT event_type, timestamp, count
      FROM events
      WHERE worker_id = ?
      ORDER BY timestamp ASC
    `).all(worker.worker_id)

    let activeSeconds = 0
    let idleSeconds = 0
    let unitsProduced = 0

    // 2. Loop through events and compute durations
    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i]
      const next = events[i + 1]

      const durationSeconds =
        (new Date(next.timestamp) - new Date(current.timestamp)) / 1000

      if (current.event_type === 'working') {
        activeSeconds += durationSeconds
      }

      if (current.event_type === 'idle') {
        idleSeconds += durationSeconds
      }

      if (current.event_type === 'product_count') {
        unitsProduced += current.count || 0
      }
    }

    const activeHours = activeSeconds / 3600
    const utilization =
      activeSeconds + idleSeconds > 0
        ? (activeSeconds / (activeSeconds + idleSeconds)) * 100
        : 0

    const avgConfidence = db.prepare(`
      SELECT AVG(confidence) as avg_conf
      FROM events
      WHERE worker_id = ?
    `).get(worker.worker_id)

    return {
      worker_id: worker.worker_id,
      name: worker.name,
      active_minutes: Math.round(activeSeconds / 60),
      idle_minutes: Math.round(idleSeconds / 60),
      utilization_percentage: parseFloat(utilization.toFixed(2)),
      units_produced: unitsProduced,
      units_per_hour: activeHours > 0 ? parseFloat((unitsProduced / activeHours).toFixed(2)) : 0,
      average_confidence: avgConfidence.avg_conf
        ? parseFloat(avgConfidence.avg_conf.toFixed(3))
        : 0
    }
  })
}

function calculateWorkstationMetrics() {
  const workstations = db.prepare('SELECT * FROM workstations').all()

  return workstations.map(station => {
    const events = db.prepare(`
      SELECT event_type, timestamp, count
      FROM events
      WHERE workstation_id = ?
      ORDER BY timestamp ASC
    `).all(station.station_id)

    let occupiedSeconds = 0
    let idleSeconds = 0
    let unitsProduced = 0

    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i]
      const next = events[i + 1]

      const durationSeconds =
        (new Date(next.timestamp) - new Date(current.timestamp)) / 1000

      if (current.event_type === 'working') {
        occupiedSeconds += durationSeconds
      }

      if (current.event_type === 'idle') {
        idleSeconds += durationSeconds
      }

      if (current.event_type === 'product_count') {
        unitsProduced += current.count || 0
      }
    }

    const occupiedHours = occupiedSeconds / 3600
    const utilization =
      occupiedSeconds + idleSeconds > 0
        ? (occupiedSeconds / (occupiedSeconds + idleSeconds)) * 100
        : 0

    const uniqueWorkers = db.prepare(`
      SELECT COUNT(DISTINCT worker_id) as count
      FROM events
      WHERE workstation_id = ?
    `).get(station.station_id)

    return {
      station_id: station.station_id,
      name: station.name,
      occupancy_minutes: Math.round(occupiedSeconds / 60),
      utilization_percentage: parseFloat(utilization.toFixed(2)),
      units_produced: unitsProduced,
      throughput_per_hour:
        occupiedHours > 0
          ? parseFloat((unitsProduced / occupiedHours).toFixed(2))
          : 0,
      unique_workers: uniqueWorkers.count
    }
  })
}

function calculateFactoryMetrics() {
  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get();
  const totalProducts = db.prepare(`
    SELECT SUM(count) as total
    FROM events
    WHERE event_type = 'product_count'
  `).get();

  const eventsByType = db.prepare(`
    SELECT event_type, COUNT(*) as count
    FROM events
    GROUP BY event_type
  `).all();

  const eventCounts = {};
  eventsByType.forEach(e => {
    eventCounts[e.event_type] = e.count;
  });

  const workingCount = eventCounts.working || 0;
  const idleCount = eventCounts.idle || 0;
  const totalActiveEvents = workingCount + idleCount;

  const overallEfficiency = totalActiveEvents > 0
    ? ((workingCount / totalActiveEvents) * 100).toFixed(2)
    : 0;

  const avgConfidence = db.prepare('SELECT AVG(confidence) as avg FROM events').get();

  const timeRange = db.prepare(`
    SELECT MIN(timestamp) as first, MAX(timestamp) as last
    FROM events
  `).get();

  return {
    total_events: totalEvents.count,
    total_products: totalProducts.total || 0,
    working_events: workingCount,
    idle_events: idleCount,
    absent_events: eventCounts.absent || 0,
    overall_efficiency_percentage: parseFloat(overallEfficiency),
    average_confidence: avgConfidence.avg ? parseFloat(avgConfidence.avg.toFixed(3)) : 0,
    total_workers: 6,
    total_workstations: 6,
    earliest_event: timeRange.first,
    latest_event: timeRange.last
  };
}

module.exports = {
  calculateWorkerMetrics,
  calculateWorkstationMetrics,
  calculateFactoryMetrics
};
