"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadJsonData } from "@/services/api";
import { JsonProduct, JsonCustomizeItem, JsonCustomizeOption } from "@/types";
import Header from "@/components/Header";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useHydration } from "@/utils/useHydration";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

// Define the correct type for the component props
interface ProductDetailProps {
  params: {
    id: string;
  };
}

export default function ProductDetail({ params }: ProductDetailProps) {
  const router = useRouter();
  const isHydrated = useHydration();
  const productId = parseInt(params.id);
  const { addToCart } = useCart();

  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["jsonData"],
    queryFn: loadJsonData,
  });

  // Find the product by ID
  const product = data?.categories
    .flatMap((category) => category.items)
    .find((item) => item.restaurant_item_id === productId);

  // Calculate total price when options or quantity changes
  useEffect(() => {
    if (!product) return;

    let basePrice = product.price;

    // Add price of selected options
    Object.entries(selectedOptions).forEach(([customizeId, optionId]) => {
      const customizeItem = product.customize_item.find(
        (item) => item.customize_id === parseInt(customizeId)
      );

      if (customizeItem) {
        const option = customizeItem.customize_options.find(
          (opt) => opt.customize_option_id === optionId
        );

        if (option) {
          basePrice += option.customize_price;
        }
      }
    });

    setTotalPrice(basePrice * quantity);
  }, [product, selectedOptions, quantity]);

  // Handle option selection
  const handleOptionSelect = (customizeId: number, optionId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [customizeId]: optionId,
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity, selectedOptions);
    setAddedToCart(true);
    setShowToast(true);

    // Reset added to cart status after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);

    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Check if required options are selected
  const areRequiredOptionsSelected = () => {
    if (!product) return false;

    const requiredCustomizeItems = product.customize_item.filter(
      (item) => item.is_required
    );

    return requiredCustomizeItems.every(
      (item) => selectedOptions[item.customize_id] !== undefined
    );
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

  if (isLoading) {
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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
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
                    Không tìm thấy sản phẩm. Vui lòng thử lại sau.
                  </p>
                  <button
                    onClick={() => router.push("/products/table")}
                    className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                  >
                    Quay lại danh sách sản phẩm
                  </button>
                </div>
              </div>
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
          <div className="mb-6">
            <button
              onClick={() => router.push("/products/table")}
              className="flex items-center text-indigo-600 hover:text-indigo-900"
            >
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Quay lại danh sách sản phẩm
            </button>
          </div>

          {/* Toast Notification */}
          {showToast && (
            <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
              <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
                <svg
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <p className="font-bold">Thêm vào giỏ hàng thành công!</p>
                  <p className="text-sm">
                    {quantity} x {product.item_name} đã được thêm vào giỏ hàng
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => router.push("/cart")}
                      className="text-xs bg-white text-green-500 px-2 py-1 rounded hover:bg-green-100"
                    >
                      Xem giỏ hàng
                    </button>
                    <button
                      onClick={() => setShowToast(false)}
                      className="text-xs text-white border border-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {addedToCart && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Đã thêm sản phẩm vào giỏ hàng!
                  </p>
                  <Link
                    href="/cart"
                    className="mt-2 text-sm font-medium text-green-700 hover:text-green-600"
                  >
                    Xem giỏ hàng
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Product Image */}
              <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src={product.item_image_compressed_web || product.item_image}
                  alt={product.item_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Product Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {product.item_name}
                </h1>
                <p className="mt-2 text-gray-600">{product.item_details}</p>
                <div className="mt-4">
                  <span className="text-xl font-semibold text-indigo-600">
                    {product.display_price}
                  </span>
                  {product.offers_discount && (
                    <span className="ml-2 text-gray-500 line-through">
                      {product.display_old_price}
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Nhà hàng
                  </h2>
                  <p className="mt-1 text-gray-600">
                    {product.restaurant_name}
                  </p>
                  <p className="text-gray-600">{product.restaurant_address}</p>
                </div>

                {/* Nutritional Info */}
                {(product.calories > 0 ||
                  product.carbs > 0 ||
                  product.fats > 0 ||
                  product.proteins > 0) && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Thông tin dinh dưỡng
                    </h2>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      {product.calories > 0 && (
                        <div>
                          <span className="text-gray-500">Calories:</span>{" "}
                          <span className="font-medium">
                            {product.calories}
                          </span>
                        </div>
                      )}
                      {product.carbs > 0 && (
                        <div>
                          <span className="text-gray-500">Carbs:</span>{" "}
                          <span className="font-medium">{product.carbs}g</span>
                        </div>
                      )}
                      {product.fats > 0 && (
                        <div>
                          <span className="text-gray-500">Fats:</span>{" "}
                          <span className="font-medium">{product.fats}g</span>
                        </div>
                      )}
                      {product.proteins > 0 && (
                        <div>
                          <span className="text-gray-500">Proteins:</span>{" "}
                          <span className="font-medium">
                            {product.proteins}g
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customization Options */}
            {product.customize_item.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Tùy chọn
                </h2>

                {product.customize_item.map((customizeItem) => (
                  <div key={customizeItem.customize_id} className="mb-6">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {customizeItem.customize_item_name}
                      </h3>
                      {customizeItem.is_required && (
                        <span className="ml-2 text-sm text-red-600">
                          (Bắt buộc)
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-3">
                      {customizeItem.customize_options.map((option) => (
                        <div
                          key={option.customize_option_id}
                          className="flex items-center"
                        >
                          <input
                            id={`option-${option.customize_option_id}`}
                            name={`customize-${customizeItem.customize_id}`}
                            type={
                              customizeItem.is_check_box ? "checkbox" : "radio"
                            }
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={
                              selectedOptions[customizeItem.customize_id] ===
                              option.customize_option_id
                            }
                            onChange={() =>
                              handleOptionSelect(
                                customizeItem.customize_id,
                                option.customize_option_id
                              )
                            }
                          />
                          <label
                            htmlFor={`option-${option.customize_option_id}`}
                            className="ml-3 text-sm text-gray-700 flex justify-between w-full"
                          >
                            <span>{option.customize_option_name}</span>
                            {option.customize_price > 0 && (
                              <span className="text-gray-500">
                                +{option.customize_display_price}
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="border-t border-gray-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="p-2 border border-gray-300 rounded-md"
                    disabled={quantity <= 1}
                  >
                    <svg
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <span className="mx-4 text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    <svg
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>

                <div className="text-xl font-semibold text-indigo-600">
                  Tổng:{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalPrice)}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!areRequiredOptionsSelected()}
                className={`mt-6 w-full py-3 px-4 rounded-md text-white font-medium ${
                  areRequiredOptionsSelected()
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Thêm vào giỏ hàng
              </button>
              {!areRequiredOptionsSelected() && (
                <p className="mt-2 text-sm text-red-600">
                  Vui lòng chọn các tùy chọn bắt buộc
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
