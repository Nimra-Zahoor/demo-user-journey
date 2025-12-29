"use client";

import { useState } from "react";
import Link from "next/link";
import { trackAction, exportJourney } from "user-journey-analytics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Navigation() {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: string) => {
    trackAction(`Navigation: Clicked ${page}`);
  };

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
    trackAction("Navigation: Exported JSON");
    setExportMenuOpen(false);
  };

  const handleExportCSV = () => {
    const data = exportJourney();
    let csvContent = "";

    csvContent += "Journey Data Export\n";
    csvContent += `App Name: ${data.appName || "N/A"}\n`;
    csvContent += `Session Start: ${formatTimestamp(data.sessionStart)}\n`;
    csvContent += `Total Pages: ${data.pages?.length || 0}\n`;
    csvContent += `Total Actions: ${data.actions?.length || 0}\n\n`;

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

    csvContent += "Tracked Actions\n";
    csvContent += "Action,Page,Time\n";
    if (data.actions && data.actions.length > 0) {
      data.actions.forEach((action: any) => {
        csvContent += `"${action.action}","${action.page}","${action.time}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journey-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackAction("Navigation: Exported CSV");
    setExportMenuOpen(false);
  };

  const handleExportPDF = () => {
    const data = exportJourney();
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("User Journey Report", 14, 20);

    doc.setFontSize(11);
    doc.text(`App Name: ${data.appName || "N/A"}`, 14, 30);
    doc.text(`Session Start: ${formatTimestamp(data.sessionStart)}`, 14, 36);
    doc.text(`Total Pages Visited: ${data.pages?.length || 0}`, 14, 42);
    doc.text(`Total Actions Tracked: ${data.actions?.length || 0}`, 14, 48);

    let yPosition = 58;

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

    doc.save(`journey-${Date.now()}.pdf`);
    trackAction("Navigation: Exported PDF");
    setExportMenuOpen(false);
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-lg font-semibold text-gray-900 dark:text-white"
              onClick={() => handleNavClick("Home")}
            >
              Demo App
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden lg:ml-8 lg:flex lg:items-center lg:space-x-4">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => handleNavClick("Home")}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => handleNavClick("About")}
              >
                About
              </Link>
              <Link
                href="/products"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => handleNavClick("Products")}
              >
                Products
              </Link>
              <Link
                href="/contact"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => handleNavClick("Contact")}
              >
                Contact
              </Link>
              <Link
                href="/journey"
                className="rounded-md px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                onClick={() => handleNavClick("Journey Viewer")}
              >
                View Journey
              </Link>
              <Link
                href="/features"
                className="rounded-md px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                onClick={() => handleNavClick("Features Demo")}
              >
                Features
              </Link>
            </div>
          </div>
          
          {/* Right side: Export and Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Export Dropdown - Hidden on mobile */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
                <span className="hidden sm:inline">Export Logs</span>
              </button>

              {exportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setExportMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg bg-white shadow-xl dark:bg-gray-800">
                    <div className="p-2">
                      <button
                        onClick={handleExportJSON}
                        className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-gray-300 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-600"
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
                        Export as JSON
                      </button>

                      <button
                        onClick={handleExportCSV}
                        className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-600"
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
                        Export as CSV
                      </button>

                      <button
                        onClick={handleExportPDF}
                        className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-red-600"
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
                        Export as PDF
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 py-4 dark:border-gray-700 lg:hidden">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="rounded-md px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => {
                  handleNavClick("Home");
                  setMobileMenuOpen(false);
                }}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="rounded-md px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => {
                  handleNavClick("About");
                  setMobileMenuOpen(false);
                }}
              >
                About
              </Link>
              <Link
                href="/products"
                className="rounded-md px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => {
                  handleNavClick("Products");
                  setMobileMenuOpen(false);
                }}
              >
                Products
              </Link>
              <Link
                href="/contact"
                className="rounded-md px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => {
                  handleNavClick("Contact");
                  setMobileMenuOpen(false);
                }}
              >
                Contact
              </Link>
              <Link
                href="/journey"
                className="rounded-md px-4 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                onClick={() => {
                  handleNavClick("Journey Viewer");
                  setMobileMenuOpen(false);
                }}
              >
                View Journey
              </Link>
              <Link
                href="/features"
                className="rounded-md px-4 py-2 text-base font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                onClick={() => {
                  handleNavClick("Features Demo");
                  setMobileMenuOpen(false);
                }}
              >
                Features
              </Link>
              {/* Mobile Export Options */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  onClick={handleExportJSON}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-base text-gray-700 hover:bg-green-50 hover:text-green-700 dark:text-gray-300 dark:hover:bg-green-900/20 dark:hover:text-green-400"
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
                  Export as JSON
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-base text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
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
                  Export as CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-base text-gray-700 hover:bg-red-50 hover:text-red-700 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
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
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


