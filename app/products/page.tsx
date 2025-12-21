"use client";

import { useJourney } from "user-journey-tracker";
import Navigation from "../components/Navigation";

export default function Products() {
  const { trackAction } = useJourney();

  const products = [
    { id: 1, name: "Product A", price: "$99" },
    { id: 2, name: "Product B", price: "$149" },
    { id: 3, name: "Product C", price: "$199" },
  ];

  const handleProductClick = (productName: string) => {
    trackAction(`Products: Clicked ${productName}`);
    alert(`Product clicked: ${productName}`);
  };

  const handleAddToCart = (productName: string) => {
    trackAction(`Products: Add to Cart - ${productName}`);
    alert(`Added to cart: ${productName}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Products Page
          </h1>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Browse our products. Each interaction is tracked for journey analysis.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-gray-200 p-6 dark:border-gray-700"
              >
                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {product.name}
                </h3>
                <p className="mb-4 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {product.price}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleProductClick(product.name)}
                    className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(product.name)}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

