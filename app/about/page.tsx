// Server Component - demonstrates server-side usage
import Navigation from "../components/Navigation";
import TrackButton from "../components/TrackButton";

export default function About() {

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-4 sm:p-6 md:p-8 shadow-lg dark:bg-gray-900">
          <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            About Page (Server Component)
          </h1>
          <p className="mb-6 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            This page is a <strong>server component</strong> (no "use client" directive). It uses client button components that call <code className="bg-gray-100 px-1 py-0.5 rounded">trackAction</code> directly. Page navigation is automatically tracked when you visit this page.
          </p>
          <div className="mb-4 rounded-md bg-blue-50 p-3 sm:p-4 dark:bg-blue-900/20">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Direct exports work in both server and client components. This demonstrates using them in a server component with client-side buttons.
            </p>
          </div>

          <div className="mb-6 sm:mb-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200">
              About Our Company
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              We are a demo company showcasing the user-journey-analytics package. 
              This package helps you track user journeys in your Next.js applications 
              without any backend or external services.
            </p>
          </div>

          <div className="mb-6 sm:mb-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Test Actions (Client Buttons in Server Component)
            </h2>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <TrackButton
                action="About: Read More Clicked"
                metadata={{ page: "/about", buttonType: "read-more" }}
                className="rounded-md bg-indigo-600 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-white transition-colors hover:bg-indigo-700"
              >
                Read More
              </TrackButton>
              <TrackButton
                action="About: Contact Team Clicked"
                metadata={{ page: "/about", buttonType: "contact-team" }}
                className="rounded-md bg-pink-600 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-white transition-colors hover:bg-pink-700"
              >
                Contact Team
              </TrackButton>
              <TrackButton
                action="About: View History Clicked"
                metadata={{ page: "/about", buttonType: "view-history" }}
                className="rounded-md bg-teal-600 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-white transition-colors hover:bg-teal-700"
              >
                View History
              </TrackButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

