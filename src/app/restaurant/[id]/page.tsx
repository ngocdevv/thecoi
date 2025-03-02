"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRestaurantById } from "@/services/api";
import Header from "@/components/Header";
import CategorySection from "@/components/CategorySection";
import ProductEditModal from "@/components/ProductEditModal";
import { Product } from "@/types";
import { useHydration } from "@/utils/useHydration";

// Define the correct type for the component props
interface RestaurantPageProps {
  params: {
    id: string;
  };
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const isHydrated = useHydration();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: restaurant,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["restaurant", params.id],
    queryFn: () => fetchRestaurantById(params.id),
  });

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    // In a real application, this would call an API to update the product
    console.log("Saving product:", updatedProduct);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Only render the full content after hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Error loading restaurant. Please try again later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {restaurant && !isLoading && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p className="mt-1 text-gray-500">{restaurant.description}</p>
                )}
                {restaurant.address && (
                  <p className="mt-2 text-sm text-gray-500">
                    {restaurant.address}
                  </p>
                )}
              </div>

              {restaurant.categories.length === 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        No categories found for this restaurant.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  {restaurant.categories.map((category) => (
                    <CategorySection
                      key={category.id}
                      category={category}
                      onEditProduct={handleEditProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ProductEditModal
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
