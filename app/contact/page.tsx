"use client";

import { useState } from "react";
import { useJourney } from "user-journey-analytics";
import Navigation from "../components/Navigation";

export default function Contact() {
  const { trackAction } = useJourney();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (field: string, value: string) => {
    trackAction(`Contact: Typed in ${field} field`);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackAction("Contact: Form Submitted");
    alert("Form submitted! (This is a demo - action tracked)");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Contact Page
          </h1>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Fill out the form below. Each field interaction is tracked.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Your message"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Send Message
            </button>
          </form>

          <div className="mt-8 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Every field interaction and form submission is tracked. 
              Check the Journey Viewer to see all tracked actions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

