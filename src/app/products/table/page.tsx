"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadJsonData } from "@/services/api";
import Header from "@/components/Header";
import ProductTable from "@/components/ProductTable";
import { JsonProduct } from "@/types";
import { useHydration } from "@/utils/useHydration";

export default function ProductTablePage() {
  const isHydrated = useHydration();
  const [editingProduct, setEditingProduct] = useState<JsonProduct | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["jsonData"],
    queryFn: loadJsonData,
  });

  // Flatten all products from all categories
  const allProducts =
    data?.categories.flatMap((category) => category.items) || [];

  const handleEditProduct = (product: JsonProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Quản lý sản phẩm
            </h1>
          </div>

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
                    Lỗi khi tải dữ liệu sản phẩm. Vui lòng thử lại sau.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && allProducts.length === 0 && (
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
                    Không tìm thấy sản phẩm nào
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && allProducts.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <ProductTable
                products={allProducts}
                categories={data?.categories || []}
                onEdit={handleEditProduct}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
