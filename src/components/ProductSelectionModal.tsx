"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadJsonData } from "@/services/api";
import { JsonProduct } from "@/types";
import Image from "next/image";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (
    product: JsonProduct,
    quantity: number,
    selectedOptions: Record<number, number>
  ) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<JsonProduct | null>(
    null
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [step, setStep] = useState<"list" | "detail">("list");

  const { data, isLoading } = useQuery({
    queryKey: ["jsonData"],
    queryFn: loadJsonData,
  });

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedProduct(null);
      setSelectedOptions({});
      setQuantity(1);
      setTotalPrice(0);
      setStep("list");
    }
  }, [isOpen]);

  // Calculate total price when options or quantity changes
  useEffect(() => {
    if (!selectedProduct) return;

    let basePrice = selectedProduct.price;

    // Add price of selected options
    Object.entries(selectedOptions).forEach(([customizeId, optionId]) => {
      const customizeItem = selectedProduct.customize_item.find(
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
  }, [selectedProduct, selectedOptions, quantity]);

  // Get all products from all categories
  const allProducts =
    data?.categories.flatMap((category) => category.items) || [];

  // Filter products based on search term
  const filteredProducts = searchTerm
    ? allProducts.filter((product) =>
        product.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allProducts;

  // Handle product selection
  const handleSelectProduct = (product: JsonProduct) => {
    setSelectedProduct(product);

    // Initialize selected options with default values
    const initialOptions: Record<number, number> = {};
    product.customize_item.forEach((item) => {
      if (item.is_required) {
        const defaultOption = item.customize_options.find(
          (opt) => opt.is_default
        );
        if (defaultOption) {
          initialOptions[item.customize_id] = defaultOption.customize_option_id;
        } else if (item.customize_options.length > 0) {
          initialOptions[item.customize_id] =
            item.customize_options[0].customize_option_id;
        }
      }
    });

    setSelectedOptions(initialOptions);
    setStep("detail");
  };

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

  // Check if all required options are selected
  const areRequiredOptionsSelected = () => {
    if (!selectedProduct) return false;

    const requiredCustomizeItems = selectedProduct.customize_item.filter(
      (item) => item.is_required
    );

    return requiredCustomizeItems.every(
      (item) => selectedOptions[item.customize_id] !== undefined
    );
  };

  // Handle add to order
  const handleAddToOrder = () => {
    if (!selectedProduct || !areRequiredOptionsSelected()) return;

    onAddProduct(selectedProduct, quantity, selectedOptions);
    onClose();
  };

  // Render product list
  const renderProductList = () => (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy sản phẩm nào
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.restaurant_item_id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelectProduct(product)}
            >
              <div className="flex items-center">
                {product.item_image && (
                  <div className="flex-shrink-0 h-16 w-16 relative mr-4">
                    <Image
                      src={product.item_image}
                      alt={product.item_name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {product.item_name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {product.item_details}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render product detail
  const renderProductDetail = () => {
    if (!selectedProduct) return null;

    return (
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            onClick={() => setStep("list")}
          >
            <svg
              className="mr-1 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Quay lại
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {selectedProduct.item_image && (
            <div className="flex-shrink-0 h-40 w-40 relative mb-4 md:mb-0 md:mr-6">
              <Image
                src={selectedProduct.item_image}
                alt={selectedProduct.item_name}
                fill
                className="object-cover rounded-md"
              />
            </div>
          )}
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {selectedProduct.item_name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedProduct.item_details}
            </p>
            <p className="mt-2 text-lg font-medium text-gray-900">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(selectedProduct.price)}
            </p>
          </div>
        </div>

        {/* Customize options */}
        {selectedProduct.customize_item.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900">Tùy chọn</h3>
            {selectedProduct.customize_item.map((customizeItem) => (
              <div key={customizeItem.customize_id} className="space-y-2">
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-900">
                    {customizeItem.customize_item_name}
                  </h4>
                  {customizeItem.is_required && (
                    <span className="ml-1 text-xs text-red-500">*</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {customizeItem.customize_options.map((option) => (
                    <div
                      key={option.customize_option_id}
                      className={`border rounded-md p-2 cursor-pointer ${
                        selectedOptions[customizeItem.customize_id] ===
                        option.customize_option_id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-300"
                      }`}
                      onClick={() =>
                        handleOptionSelect(
                          customizeItem.customize_id,
                          option.customize_option_id
                        )
                      }
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {option.customize_option_name}
                        </span>
                        {option.customize_price > 0 && (
                          <span className="text-xs text-indigo-600">
                            +
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(option.customize_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity */}
        <div className="space-y-2">
          <h3 className="text-base font-medium text-gray-900">Số lượng</h3>
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 border border-gray-300 rounded-md"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="mx-4 text-gray-900">{quantity}</span>
            <button
              type="button"
              className="p-2 border border-gray-300 rounded-md"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Total price */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-medium text-gray-900">
              Tổng tiền:
            </span>
            <span className="text-lg font-medium text-indigo-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  {step === "list" ? "Chọn sản phẩm" : "Chi tiết sản phẩm"}
                </h3>
                <div className="mt-4">
                  {step === "list"
                    ? renderProductList()
                    : renderProductDetail()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {step === "detail" && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleAddToOrder}
                disabled={!areRequiredOptionsSelected()}
              >
                Thêm vào đơn hàng
              </button>
            )}
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {step === "list" ? "Đóng" : "Hủy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
