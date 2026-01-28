const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'factory.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      worker_id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workstations (
      station_id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      worker_id TEXT,
      workstation_id TEXT,
      event_type TEXT NOT NULL,
      confidence REAL,
      count INTEGER DEFAULT 1,
      FOREIGN KEY (worker_id) REFERENCES workers(worker_id),
      FOREIGN KEY (workstation_id) REFERENCES workstations(station_id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_events_worker ON events(worker_id);
    CREATE INDEX IF NOT EXISTS idx_events_workstation ON events(workstation_id);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
  `);

  const workerCount = db.prepare('SELECT COUNT(*) as count FROM workers').get();
  if (workerCount.count === 0) {
    console.log('Initializing database with seed data...');
    seedData();
  }
}

function seedData() {
  const workers = [
    { worker_id: 'W1', name: 'John Smith' },
    { worker_id: 'W2', name: 'Sarah Johnson' },
    { worker_id: 'W3', name: 'Michael Chen' },
    { worker_id: 'W4', name: 'Emily Davis' },
    { worker_id: 'W5', name: 'David Martinez' },
    { worker_id: 'W6', name: 'Lisa Anderson' }
  ];

  const workstations = [
    { station_id: 'S1', name: 'Assembly Line A' },
    { station_id: 'S2', name: 'Assembly Line B' },
    { station_id: 'S3', name: 'Quality Control' },
    { station_id: 'S4', name: 'Packaging Station' },
    { station_id: 'S5', name: 'Welding Station' },
    { station_id: 'S6', name: 'Testing Station' }
  ];

  const insertWorker = db.prepare('INSERT INTO workers (worker_id, name) VALUES (?, ?)');
  const insertStation = db.prepare('INSERT INTO workstations (station_id, name) VALUES (?, ?)');
  const insertEvent = db.prepare('INSERT INTO events (timestamp, worker_id, workstation_id, event_type, confidence, count) VALUES (?, ?, ?, ?, ?, ?)');

  const insertMany = db.transaction(() => {
    for (const worker of workers) {
      insertWorker.run(worker.worker_id, worker.name);
    }

    for (const station of workstations) {
      insertStation.run(station.station_id, station.name);
    }

    const eventTypes = ['working', 'idle', 'absent', 'product_count'];
    const now = new Date();

    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const worker = workers[Math.floor(Math.random() * workers.length)];
      const station = workstations[Math.floor(Math.random() * workstations.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const confidence = 0.7 + Math.random() * 0.3;
      const count = eventType === 'product_count' ? Math.floor(Math.random() * 10) + 1 : 1;

      insertEvent.run(
        timestamp.toISOString(),
        worker.worker_id,
        station.station_id,
        eventType,
        confidence,
        count
      );
    }
  });

  insertMany();
  console.log('Seed data inserted successfully');
}

function clearAndReseedData() {
  db.exec(`
    DELETE FROM events;
    DELETE FROM workers;
    DELETE FROM workstations;
  `);
  seedData();
}

initializeDatabase();

module.exports = { db, seedData, clearAndReseedData };
