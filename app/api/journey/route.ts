import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Database file path
const dbPath = join(process.cwd(), 'data', 'journey.db');

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
let db: Database.Database | null = null;

function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    
    // Create table if not exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        user_id TEXT,
        app_name TEXT,
        event_type TEXT NOT NULL,
        path TEXT,
        action TEXT,
        timestamp INTEGER NOT NULL,
        time_spent INTEGER,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster queries
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_session_id ON events(session_id);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_event_type ON events(event_type);
    `);
  }
  return db;
}

const insertEvent = (db: Database.Database) => db.prepare(`
  INSERT INTO events (session_id, user_id, app_name, event_type, path, action, timestamp, time_spent, metadata)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export async function POST(request: NextRequest) {
  try {
    // Optional: Validate API key
    const apiKey = 
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.nextUrl.searchParams.get('apiKey');
    
    // You can set API_KEY in .env.local for production
    if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, userId, appName, events } = body;

    // Validate request body
    if (!sessionId || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: sessionId and events array required' },
        { status: 400 }
      );
    }

    // Get database connection
    const database = getDatabase();
    const insert = insertEvent(database);

    // Insert all events in a transaction for atomicity
    const insertMany = database.transaction((events: any[]) => {
      for (const event of events) {
        insert.run(
          sessionId,
          userId || null,
          appName || null,
          event.type,
          event.path || null,
          event.action || null,
          event.timestamp,
          event.timeSpent || null,
          event.metadata ? JSON.stringify(event.metadata) : null
        );
      }
    });

    insertMany(events);

    return NextResponse.json({
      success: true,
      inserted: events.length,
    });
  } catch (error) {
    console.error('Error processing journey events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to query events (for debugging/admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '100');

    const database = getDatabase();
    
    let query = 'SELECT * FROM events';
    const params: any[] = [];

    if (sessionId) {
      query += ' WHERE session_id = ?';
      params.push(sessionId);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    const stmt = database.prepare(query);
    const events = stmt.all(...params);

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Error querying events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

