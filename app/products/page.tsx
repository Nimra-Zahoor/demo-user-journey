"use client";

import { trackAction } from "user-journey-analytics";
import Navigation from "../components/Navigation";

export default function Products() {

  const products = [
    { id: 1, name: "Product A", price: "$99" },
    { id: 2, name: "Product B", price: "$149" },
    { id: 3, name: "Product C", price: "$199" },
  ];

  const handleProductClick = (product: { id: number; name: string; price: string }) => {
    trackAction(`Products: Clicked ${product.name}`, {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: "electronics",
      actionType: "view_details",
    });
    alert(`Product clicked: ${product.name}`);
  };

  const handleAddToCart = (product: { id: number; name: string; price: string }) => {
    trackAction(`Products: Add to Cart - ${product.name}`, {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: "electronics",
      actionType: "add_to_cart",
      timestamp: Date.now(),
    });
    alert(`Added to cart: ${product.name}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-4 sm:p-6 md:p-8 shadow-lg dark:bg-gray-900">
          <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Products Page
          </h1>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Browse our products. Each interaction is tracked for journey analysis.
          </p>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-gray-200 p-4 sm:p-6 dark:border-gray-700"
              >
                <h3 className="mb-2 text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {product.name}
                </h3>
                <p className="mb-4 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {product.price}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleProductClick(product)}
                    className="rounded-md bg-gray-200 px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="rounded-md bg-blue-600 px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-blue-700"
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

