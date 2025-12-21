"use client";

import { useJourney } from "user-journey-analytics";
import Navigation from "./components/Navigation";

export default function Home() {
  const { trackAction } = useJourney();

  const handleButtonClick = (action: string) => {
    trackAction(action);
    alert(`Action tracked: ${action}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Welcome to Journey Tracker Demo
          </h1>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            This is the home page. Navigate between pages and click buttons to test the journey tracking functionality.
          </p>

          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Test Action Tracking
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleButtonClick("Button: Get Started Clicked")}
                className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
              >
                Get Started
              </button>
              <button
                onClick={() => handleButtonClick("Button: Learn More Clicked")}
                className="rounded-md bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
              >
                Learn More
              </button>
              <button
                onClick={() => handleButtonClick("Button: Sign Up Clicked")}
                className="rounded-md bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
              >
                Sign Up
              </button>
              <button
                onClick={() => handleButtonClick("Button: View Features Clicked")}
                className="rounded-md bg-orange-600 px-6 py-3 text-white transition-colors hover:bg-orange-700"
              >
                View Features
              </button>
            </div>
          </div>

          <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-800">
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
              Testing Instructions:
            </h3>
            <ul className="list-inside list-disc space-y-1 text-gray-600 dark:text-gray-400">
              <li>Click the buttons above to track actions</li>
              <li>Navigate to different pages using the navigation bar</li>
              <li>Visit the "View Journey" page to see all tracked data</li>
              <li>Try refreshing the page - data should persist (persist=true)</li>
              <li>Try opening a new tab - should start a new session</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
