"use client";

import { useState } from "react";
import { useJourney } from "user-journey-analytics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportButton() {
  const { exportJourney, trackAction } = useJourney();
  const [isOpen, setIsOpen] = useState(false);

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
    trackAction("Export: Downloaded JSON");
    setIsOpen(false);
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
    trackAction("Export: Downloaded CSV");
    setIsOpen(false);
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
    trackAction("Export: Downloaded PDF");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Main Export Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
          title="Export Journey Data"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="font-medium">Export</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <div className="absolute bottom-full right-0 mb-2 w-48 rounded-lg bg-white shadow-xl dark:bg-gray-800">
              <div className="p-2">
                <button
                  onClick={handleExportJSON}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-gray-300 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Export as JSON</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-2m3 2v-2m3-4H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2zM7 7h10M7 11h10"
                    />
                  </svg>
                  <span>Export as CSV</span>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Export as PDF</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

