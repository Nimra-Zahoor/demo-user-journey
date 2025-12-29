"use client";

import { useState, useEffect } from "react";
import { exportJourney, clearJourney, trackAction, flush } from "user-journey-analytics";
import Navigation from "../components/Navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function JourneyViewer() {
  const [journeyData, setJourneyData] = useState<any>(null);
  const [flushStatus, setFlushStatus] = useState<string>("");

  const refreshData = () => {
    const data = exportJourney();
    setJourneyData(data);
    trackAction("Journey Viewer: Refreshed Data");
  };

  useEffect(() => {
    refreshData();
    // Refresh data every 2 seconds to show real-time updates
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (!ms) return "N/A";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const handleExportJSON = () => {
    const data = exportJourney();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journey-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackAction("Journey Viewer: Exported JSON");
  };

  const handleExportCSV = () => {
    const data = exportJourney();
    let csvContent = "";

    // Add header
    csvContent += "Journey Data Export\n";
    csvContent += `App Name: ${data.appName || "N/A"}\n`;
    csvContent += `Session Start: ${formatTimestamp(data.sessionStart)}\n`;
    csvContent += `Total Pages: ${data.pages?.length || 0}\n`;
    csvContent += `Total Actions: ${data.actions?.length || 0}\n\n`;

    // Pages Visited
    csvContent += "Pages Visited\n";
    csvContent += "Page,Timestamp\n";
    if (data.pages && data.pages.length > 0) {
      data.pages.forEach((page: string) => {
        const timestamp = data.timestamps?.[page]
          ? formatTimestamp(data.timestamps[page])
          : "N/A";
        csvContent += `"${page}","${timestamp}"\n`;
      });
    }
    csvContent += "\n";

    // Page Visits with Time Spent
    csvContent += "Page Visits with Time Spent\n";
    csvContent += "Path,Timestamp,Time Spent (ms),Time Spent (formatted)\n";
    if (data.pageVisits && data.pageVisits.length > 0) {
      data.pageVisits.forEach((visit: any) => {
        const timeSpent = visit.timeSpent !== undefined ? visit.timeSpent : "N/A";
        const timeSpentFormatted = visit.timeSpent !== undefined ? formatDuration(visit.timeSpent) : "N/A";
        csvContent += `"${visit.path}","${formatTimestamp(visit.timestamp)}","${timeSpent}","${timeSpentFormatted}"\n`;
      });
    }
    csvContent += "\n";

    // Actions
    csvContent += "Tracked Actions\n";
    csvContent += "Action,Page,Time\n";
    if (data.actions && data.actions.length > 0) {
      data.actions.forEach((action: any) => {
        csvContent += `"${action.action}","${action.page}","${action.time}"\n`;
      });
    }

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journey-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackAction("Journey Viewer: Exported CSV");
  };

  const handleExportPDF = () => {
    const data = exportJourney();
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("User Journey Report", 14, 20);

    // App Info
    doc.setFontSize(11);
    doc.text(`App Name: ${data.appName || "N/A"}`, 14, 30);
    doc.text(`Session Start: ${formatTimestamp(data.sessionStart)}`, 14, 36);
    doc.text(`Total Pages Visited: ${data.pages?.length || 0}`, 14, 42);
    doc.text(`Total Actions Tracked: ${data.actions?.length || 0}`, 14, 48);

    let yPosition = 58;

    // Pages Visited Table
    if (data.pages && data.pages.length > 0) {
      doc.setFontSize(14);
      doc.text("Pages Visited", 14, yPosition);
      yPosition += 8;

      const pagesData = data.pages.map((page: string) => [
        page,
        data.timestamps?.[page] ? formatTimestamp(data.timestamps[page]) : "N/A",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Page", "Timestamp"]],
        body: pagesData,
        theme: "striped",
        headStyles: { fillColor: [66, 139, 202] },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Page Visits with Time Spent Table
    if (data.pageVisits && data.pageVisits.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text("Page Visits with Time Spent", 14, yPosition);
      yPosition += 8;

      const visitsData = data.pageVisits.map((visit: any) => [
        visit.path,
        formatTimestamp(visit.timestamp),
        visit.timeSpent !== undefined ? formatDuration(visit.timeSpent) : "N/A",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Path", "Timestamp", "Time Spent"]],
        body: visitsData,
        theme: "striped",
        headStyles: { fillColor: [66, 139, 202] },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Actions Table
    if (data.actions && data.actions.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text("Tracked Actions", 14, yPosition);
      yPosition += 8;

      const actionsData = data.actions.map((action: any) => [
        action.action,
        action.page,
        action.time,
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Action", "Page", "Time"]],
        body: actionsData,
        theme: "striped",
        headStyles: { fillColor: [66, 139, 202] },
      });
    }

    // Save PDF
    doc.save(`journey-${Date.now()}.pdf`);
    trackAction("Journey Viewer: Exported PDF");
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all journey data?")) {
      clearJourney();
      refreshData();
      trackAction("Journey Viewer: Cleared Journey");
      alert("Journey data cleared!");
    }
  };

  const handleFlush = async () => {
    setFlushStatus("Flushing...");
    try {
      await flush();
      setFlushStatus("✅ Events flushed successfully!");
      trackAction("Journey Viewer: Manual Flush Completed");
      setTimeout(() => setFlushStatus(""), 3000);
    } catch (error) {
      setFlushStatus("❌ Failed to flush events");
      console.error("Flush error:", error);
      setTimeout(() => setFlushStatus(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8 md:py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-4 sm:p-6 md:p-8 shadow-lg dark:bg-gray-900">
          <div className="mb-6 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Journey Viewer
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                View and export your tracked user journey data
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
              <button
                onClick={refreshData}
                className="rounded-md bg-gray-600 px-3 py-2 sm:px-4 text-xs sm:text-sm text-white transition-colors hover:bg-gray-700"
              >
                Refresh
              </button>
              <button
                onClick={handleFlush}
                className="rounded-md bg-indigo-600 px-3 py-2 sm:px-4 text-xs sm:text-sm text-white transition-colors hover:bg-indigo-700"
                title="Flush events to backend"
              >
                Flush to Backend
              </button>
              {flushStatus && (
                <span className="flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {flushStatus}
                </span>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportJSON}
                  className="rounded-md bg-green-600 px-3 py-2 text-xs sm:text-sm text-white transition-colors hover:bg-green-700"
                  title="Export as JSON"
                >
                  Export JSON
                </button>
                <button
                  onClick={handleExportCSV}
                  className="rounded-md bg-blue-600 px-3 py-2 text-xs sm:text-sm text-white transition-colors hover:bg-blue-700"
                  title="Export as CSV"
                >
                  Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="rounded-md bg-red-600 px-3 py-2 text-xs sm:text-sm text-white transition-colors hover:bg-red-700"
                  title="Export as PDF"
                >
                  Export PDF
                </button>
              </div>
              <button
                onClick={handleClear}
                className="rounded-md bg-red-600 px-3 py-2 sm:px-4 text-xs sm:text-sm text-white transition-colors hover:bg-red-700"
              >
                Clear Journey
              </button>
            </div>
          </div>

          {journeyData ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Summary Section */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    App Name
                  </h3>
                  <p className="mt-1 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white break-words">
                    {journeyData.appName || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    Pages Visited
                  </h3>
                  <p className="mt-1 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {journeyData.pages?.length || 0}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    Actions Tracked
                  </h3>
                  <p className="mt-1 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {journeyData.actions?.length || 0}
                  </p>
                </div>
              </div>

              {/* Session Start */}
              <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
                <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Session Start
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 break-words">
                  {formatTimestamp(journeyData.sessionStart)}
                </p>
              </div>

              {/* Pages Visited */}
              <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
                <h3 className="mb-4 text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Pages Visited ({journeyData.pages?.length || 0})
                </h3>
                <div className="space-y-2">
                  {journeyData.pages?.map((page: string, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <span className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white break-words">
                        {page}
                      </span>
                      {journeyData.timestamps?.[page] && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(journeyData.timestamps[page])}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Page Visits with Time Spent */}
              <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
                <h3 className="mb-4 text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Page Visits with Time Spent ({journeyData.pageVisits?.length || 0})
                </h3>
                <div className="space-y-2">
                  {journeyData.pageVisits?.map(
                    (visit: any, index: number) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md bg-gray-50 p-3 dark:bg-gray-800"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="font-mono text-xs sm:text-sm font-semibold text-gray-900 dark:text-white break-words">
                            {visit.path}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(visit.timestamp)}
                          </span>
                        </div>
                        {visit.timeSpent !== undefined && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 sm:px-3 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200 self-start sm:self-auto">
                            {formatDuration(visit.timeSpent)}
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
                <h3 className="mb-4 text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Tracked Actions ({journeyData.actions?.length || 0})
                </h3>
                <div className="space-y-2">
                  {journeyData.actions?.map((action: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words">
                          {action.action}
                        </span>
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                          on {action.page}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {action.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw JSON */}
              <details className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
                <summary className="cursor-pointer text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Raw JSON Data
                </summary>
                <pre className="mt-4 overflow-auto rounded-md bg-gray-100 p-3 sm:p-4 text-xs dark:bg-gray-800">
                  {JSON.stringify(journeyData, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 p-6 sm:p-8 text-center dark:border-gray-700">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                No journey data available. Start navigating and interacting with
                the app to see tracked data here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

