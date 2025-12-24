"use client";

import { useState } from "react";
import { useJourney } from "user-journey-analytics";
import Navigation from "../components/Navigation";

export default function Features() {
  const { trackAction, flush, exportJourney } = useJourney();
  const [flushStatus, setFlushStatus] = useState<string>("");
  const [formData, setFormData] = useState({
    productName: "",
    productId: "",
    price: "",
    category: "",
  });

  // Demo: Action tracking with metadata
  const handleActionWithMetadata = () => {
    trackAction("Features: Button Clicked with Metadata", {
      buttonId: "demo-button",
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    });
    alert("Action tracked with metadata! Check the Journey Viewer to see the metadata.");
  };

  // Demo: Product tracking with metadata
  const handleProductAction = (action: string) => {
    trackAction(`Product: ${action}`, {
      productId: formData.productId || "demo-product",
      productName: formData.productName || "Demo Product",
      price: parseFloat(formData.price) || 0,
      category: formData.category || "electronics",
      currency: "USD",
    });
    alert(`Product action "${action}" tracked with metadata!`);
  };

  // Demo: Manual flush
  const handleManualFlush = async () => {
    setFlushStatus("Flushing...");
    try {
      await flush();
      setFlushStatus("✅ Events flushed successfully!");
      trackAction("Features: Manual Flush Completed");
      setTimeout(() => setFlushStatus(""), 3000);
    } catch (error) {
      setFlushStatus("❌ Failed to flush events");
      console.error("Flush error:", error);
      setTimeout(() => setFlushStatus(""), 3000);
    }
  };

  // Demo: Form interactions with metadata
  const handleFormFieldFocus = (field: string) => {
    trackAction(`Form: ${field} Field Focused`, {
      fieldName: field,
      formType: "product-form",
      hasValue: !!formData[field as keyof typeof formData],
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackAction("Form: Product Form Submitted", {
      formData: {
        productName: formData.productName,
        productId: formData.productId,
        price: formData.price,
        category: formData.category,
      },
      formType: "product-form",
      timestamp: Date.now(),
    });
    alert("Form submitted with metadata! Check the Journey Viewer.");
    setFormData({ productName: "", productId: "", price: "", category: "" });
  };

  // Demo: Export journey
  const handleExportJourney = () => {
    const data = exportJourney();
    console.log("Exported Journey Data:", data);
    alert(`Journey exported! Check console. Total actions: ${data.actions?.length || 0}`);
    trackAction("Features: Journey Exported", {
      totalPages: data.pages?.length || 0,
      totalActions: data.actions?.length || 0,
      totalPageVisits: data.pageVisits?.length || 0,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Features Demo
          </h1>
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
            This page demonstrates all features of the user-journey-analytics package.
          </p>
        </div>

        <div className="space-y-8">
          {/* Feature 1: Action Tracking with Metadata */}
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              1. Action Tracking with Metadata
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Track actions with custom metadata for detailed analytics. Metadata is stored
              with each action and can be exported or sent to your backend.
            </p>
            <button
              onClick={handleActionWithMetadata}
              className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Track Action with Metadata
            </button>
            <div className="mt-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Metadata included:</strong> buttonId, timestamp, userAgent, screenWidth, screenHeight
              </p>
            </div>
          </div>

          {/* Feature 2: Product Tracking with Metadata */}
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              2. Product Tracking with Metadata
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Track product interactions with detailed metadata (productId, price, category, etc.).
            </p>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    onFocus={() => handleFormFieldFocus("productName")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Product Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    onFocus={() => handleFormFieldFocus("productId")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Product ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    onFocus={() => handleFormFieldFocus("price")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="99.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    onFocus={() => handleFormFieldFocus("category")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="electronics"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleProductAction("View Details")}
                  className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                >
                  Track: View Details
                </button>
                <button
                  type="button"
                  onClick={() => handleProductAction("Add to Cart")}
                  className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                >
                  Track: Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => handleProductAction("Add to Wishlist")}
                  className="rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
                >
                  Track: Add to Wishlist
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Submit Form (Track)
                </button>
              </div>
            </form>
          </div>

          {/* Feature 3: Manual Flush */}
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              3. Manual Flush to Backend
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Manually flush pending events to your backend API. Events are automatically batched
              and sent, but you can trigger an immediate flush if needed.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleManualFlush}
                className="rounded-md bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700"
              >
                Flush Events to Backend
              </button>
              {flushStatus && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {flushStatus}
                </span>
              )}
            </div>
            <div className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Events are automatically flushed every 30 seconds or after
                10 events. This button allows you to manually trigger a flush immediately.
              </p>
            </div>
          </div>

          {/* Feature 4: Export Journey */}
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              4. Export Journey Data
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Export the complete journey data including all pages, actions, and metadata.
            </p>
            <button
              onClick={handleExportJourney}
              className="rounded-md bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
            >
              Export Journey (Check Console)
            </button>
            <div className="mt-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Exported data includes:</strong> appName, sessionStart, pages, actions
                (with metadata), pageVisits (with timeSpent), timestamps
              </p>
            </div>
          </div>

          {/* Feature 5: Automatic Page Tracking */}
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              5. Automatic Page Tracking
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Page navigation is automatically tracked when you visit different pages. Time spent
              on each page is calculated automatically.
            </p>
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>✅ Active:</strong> This page visit was automatically tracked. Navigate to
                other pages to see more page views in the Journey Viewer.
              </p>
            </div>
          </div>

          {/* Feature 6: Backend Integration */}
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              6. Backend Integration (SQLite)
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Events are automatically sent to your backend API endpoint (<code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">/api/journey</code>)
              and stored in SQLite database. Visit the Database Events page to view stored events.
            </p>
            <div className="rounded-md bg-purple-50 p-4 dark:bg-purple-900/20">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <strong>Backend Features:</strong>
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-purple-700 dark:text-purple-300">
                <li>Automatic batching (10 events or 30 seconds)</li>
                <li>Reliable delivery using sendBeacon()</li>
                <li>SQLite database storage</li>
                <li>Event metadata preserved</li>
                <li>Session tracking</li>
              </ul>
            </div>
            <div className="mt-4">
              <a
                href="/database"
                className="inline-block rounded-md bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
              >
                View Database Events →
              </a>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Package Features Summary
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md bg-white p-4 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">✅ Implemented</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Automatic page tracking</li>
                  <li>Manual action tracking</li>
                  <li>Action tracking with metadata</li>
                  <li>Time spent per page</li>
                  <li>Backend integration (SQLite)</li>
                  <li>Event batching</li>
                  <li>Manual flush</li>
                  <li>Export journey (JSON/CSV/PDF)</li>
                  <li>Persistence (localStorage)</li>
                  <li>Session tracking (sessionStorage)</li>
                </ul>
              </div>
              <div className="rounded-md bg-white p-4 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">📊 Analytics</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Page visit tracking</li>
                  <li>User action tracking</li>
                  <li>Time spent analytics</li>
                  <li>Session analytics</li>
                  <li>Custom metadata support</li>
                  <li>Export capabilities</li>
                  <li>Database storage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

