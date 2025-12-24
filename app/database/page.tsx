"use client";

import { useState, useEffect } from "react";
import { useJourney } from "user-journey-analytics";
import Navigation from "../components/Navigation";

interface DatabaseEvent {
  id: number;
  session_id: string;
  user_id: string | null;
  app_name: string | null;
  event_type: string;
  path: string | null;
  action: string | null;
  timestamp: number;
  time_spent: number | null;
  metadata: string | null;
  created_at: string;
}

export default function DatabaseViewer() {
  const { trackAction } = useJourney();
  const [events, setEvents] = useState<DatabaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<{
    sessionId?: string;
    eventType?: string;
    limit?: number;
  }>({ limit: 100 });

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter.sessionId) params.append("sessionId", filter.sessionId);
      if (filter.limit) params.append("limit", filter.limit.toString());

      const response = await fetch(`/api/journey?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        // Check if it's a serverless environment error
        if (data.serverless) {
          throw new Error("SERVERLESS_ERROR");
        }
        throw new Error(data.message || data.error || "Failed to fetch events");
      }

      setEvents(data.events || []);
      trackAction("Database Viewer: Fetched Events", {
        eventCount: data.events?.length || 0,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch events";
      setError(errorMessage);
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Refresh every 5 seconds
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, [filter.sessionId, filter.limit]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "N/A";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const parseMetadata = (metadata: string | null) => {
    if (!metadata) return null;
    try {
      return JSON.parse(metadata);
    } catch {
      return null;
    }
  };

  const eventTypeStats = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueSessions = new Set(events.map((e) => e.session_id)).size;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Database Events Viewer
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View events stored in SQLite database from backend integration
              </p>
            </div>
            <button
              onClick={fetchEvents}
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Events
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {events.length}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Unique Sessions
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {uniqueSessions}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Page Views
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {eventTypeStats["page_view"] || 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Actions
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {eventTypeStats["action"] || 0}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Session ID
              </label>
              <input
                type="text"
                value={filter.sessionId || ""}
                onChange={(e) =>
                  setFilter({ ...filter, sessionId: e.target.value || undefined })
                }
                placeholder="Filter by session ID"
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Limit
              </label>
              <input
                type="number"
                value={filter.limit || 100}
                onChange={(e) =>
                  setFilter({ ...filter, limit: parseInt(e.target.value) || 100 })
                }
                min="1"
                max="1000"
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="rounded-lg bg-white shadow-lg dark:bg-gray-900">
          {loading ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              Loading events...
            </div>
          ) : error === "SERVERLESS_ERROR" ? (
            <div className="p-8">
              <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
                <h3 className="mb-3 text-lg font-semibold text-yellow-900 dark:text-yellow-200">
                  ⚠️ Database Not Available on Serverless Platforms
                </h3>
                <p className="mb-4 text-yellow-800 dark:text-yellow-300">
                  SQLite database is not available on serverless platforms like Vercel, Netlify, or AWS Lambda. 
                  These platforms have a read-only filesystem, which prevents SQLite from working.
                </p>
                <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-400">
                  <p><strong>This feature works in:</strong></p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Local development environment</li>
                    <li>Traditional server deployments (VPS, dedicated servers)</li>
                    <li>Docker containers with persistent volumes</li>
                  </ul>
                  <p className="mt-4"><strong>For serverless platforms, use:</strong></p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Cloud database services (PostgreSQL, MySQL, MongoDB)</li>
                    <li>Serverless databases (PlanetScale, Supabase, Neon)</li>
                    <li>External API endpoints for event storage</li>
                  </ul>
                </div>
                <p className="mt-4 text-sm text-yellow-700 dark:text-yellow-400">
                  <strong>Note:</strong> All other features of the package work perfectly on serverless platforms. 
                  Only the database storage feature requires a different setup.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              Error: {error}
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              No events found. Start interacting with the app to see events here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Path
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Time Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Metadata
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {events.map((event) => {
                    const metadata = parseMetadata(event.metadata);
                    return (
                      <tr
                        key={event.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {event.id}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              event.event_type === "page_view"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : event.event_type === "action"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            }`}
                          >
                            {event.event_type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                          {event.session_id.substring(0, 20)}...
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {event.path || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {event.action || "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {formatDuration(event.time_spent)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatTimestamp(event.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {metadata ? (
                            <details className="cursor-pointer">
                              <summary className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                View Metadata
                              </summary>
                              <pre className="mt-2 max-w-xs overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                                {JSON.stringify(metadata, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-gray-400">No metadata</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        {!error && (
          <div className="mt-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
            <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-200">
              About Database Events
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>
                Events are automatically sent to <code className="rounded bg-blue-100 px-1 dark:bg-blue-800">/api/journey</code> endpoint
              </li>
              <li>Events are batched (10 events or 30 seconds) for efficiency</li>
              <li>All metadata is preserved and stored in the database</li>
              <li>Events are stored in SQLite database at <code className="rounded bg-blue-100 px-1 dark:bg-blue-800">data/journey.db</code></li>
              <li>Page automatically refreshes every 5 seconds</li>
              <li className="mt-2 font-semibold text-yellow-700 dark:text-yellow-300">
                ⚠️ Note: SQLite doesn't work on serverless platforms (Vercel, Netlify, etc.)
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

