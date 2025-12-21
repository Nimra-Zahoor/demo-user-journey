"use client";

import { useJourney } from "user-journey-analytics";
import Navigation from "../components/Navigation";

export default function About() {
  const { trackAction } = useJourney();

  const handleAction = (action: string) => {
    trackAction(action);
    alert(`Action tracked: ${action}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            About Page
          </h1>
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
            This is the About page. Page navigation is automatically tracked when you visit this page.
          </p>

          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              About Our Company
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We are a demo company showcasing the user-journey-analytics package. 
              This package helps you track user journeys in your Next.js applications 
              without any backend or external services.
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Test Actions on This Page
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleAction("About: Read More Clicked")}
                className="rounded-md bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700"
              >
                Read More
              </button>
              <button
                onClick={() => handleAction("About: Contact Team Clicked")}
                className="rounded-md bg-pink-600 px-6 py-3 text-white transition-colors hover:bg-pink-700"
              >
                Contact Team
              </button>
              <button
                onClick={() => handleAction("About: View History Clicked")}
                className="rounded-md bg-teal-600 px-6 py-3 text-white transition-colors hover:bg-teal-700"
              >
                View History
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

