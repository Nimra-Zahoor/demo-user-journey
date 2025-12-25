"use client";

import { useJourney } from "user-journey-analytics";
import Navigation from "./components/Navigation";

export default function Home() {
  const { trackAction } = useJourney();

  const handleButtonClick = (action: string, buttonType: string) => {
    trackAction(action, {
      buttonType,
      page: "/",
      timestamp: Date.now(),
      userAgent: navigator.userAgent.substring(0, 50),
    });
    alert(`Action tracked: ${action}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-4 sm:p-6 md:p-8 shadow-lg dark:bg-gray-900">
          <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Welcome to Journey Tracker Demo
          </h1>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            This is the home page. Navigate between pages and click buttons to test the journey tracking functionality.
          </p>

          <div className="mb-6 sm:mb-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Test Action Tracking
            </h2>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button
                onClick={() => handleButtonClick("Button: Get Started Clicked", "primary")}
                className="rounded-md bg-blue-600 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-white transition-colors hover:bg-blue-700"
              >
                Get Started
              </button>
              <button
                onClick={() => handleButtonClick("Button: Learn More Clicked", "secondary")}
                className="rounded-md bg-green-600 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-white transition-colors hover:bg-green-700"
              >
                Learn More
              </button>
              <button
                onClick={() => handleButtonClick("Button: Sign Up Clicked", "cta")}
                className="rounded-md bg-purple-600 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-white transition-colors hover:bg-purple-700"
              >
                Sign Up
              </button>
              <button
                onClick={() => handleButtonClick("Button: View Features Clicked", "info")}
                className="rounded-md bg-orange-600 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-white transition-colors hover:bg-orange-700"
              >
                View Features
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-3 sm:p-4 dark:bg-blue-900/20">
              <h3 className="mb-2 text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-200">
                🎉 New Features Available:
              </h3>
              <ul className="list-inside list-disc space-y-1 text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                <li>
                  <a href="/features" className="font-medium underline hover:text-blue-900 dark:hover:text-blue-200">
                    Features Demo Page
                  </a> - See all package features in action
                </li>
                <li>Action tracking with metadata on all pages</li>
                <li>Manual flush to backend functionality</li>
              </ul>
            </div>
            <div className="rounded-md bg-gray-100 p-3 sm:p-4 dark:bg-gray-800">
              <h3 className="mb-2 text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                Testing Instructions:
              </h3>
              <ul className="list-inside list-disc space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <li>Click the buttons above to track actions with metadata</li>
                <li>Navigate to different pages using the navigation bar</li>
                <li>Visit the "Features" page to see all package features</li>
                <li>Visit the "View Journey" page to see all tracked data</li>
                <li>Try refreshing the page - data should persist (persist=true)</li>
                <li>Try opening a new tab - should start a new session</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
