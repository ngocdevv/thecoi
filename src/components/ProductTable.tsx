"use client";

import { useState } from "react";
import { JsonProduct, JsonCategory } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface ProductTableProps {
  products: JsonProduct[];
  categories: JsonCategory[];
  onEdit?: (product: JsonProduct) => void;
}

export default function ProductTable({
  products,
  categories,
  onEdit,
}: ProductTableProps) {
  const [sortField, setSortField] = useState<keyof JsonProduct | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const itemsPerPage = 10;

  // Create a map of category IDs to category names for quick lookup
  const categoryMap = categories.reduce((map, category) => {
    map[category.category_id] = category.category_name;
    return map;
  }, {} as Record<number, string>);

  // Find category name for a product
  const getCategoryName = (product: JsonProduct): string => {
    // Find the category that contains this product
    const category = categories.find((cat) =>
      cat.items.some(
        (item) => item.restaurant_item_id === product.restaurant_item_id
      )
    );
    return category ? category.category_name : "Không có danh mục";
  };

  // Filter products based on search term
  const filteredProducts = searchTerm
    ? products.filter(
        (product) =>
          product.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.item_details
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.restaurant_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getCategoryName(product)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : products;

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;

    // Special case for category sorting
    if (sortField === ("category" as any)) {
      const categoryA = getCategoryName(a);
      const categoryB = getCategoryName(b);
      return sortDirection === "asc"
        ? categoryA.localeCompare(categoryB)
        : categoryB.localeCompare(categoryA);
    }

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof JsonProduct | "category") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field as keyof JsonProduct);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof JsonProduct | "category") => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const handleImageError = (productId: number) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          className="px-4 py-2 border border-gray-300 rounded-md w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("item_image")}
            >
              Hình ảnh
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("item_name")}
            >
              Tên sản phẩm {renderSortIcon("item_name")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("category")}
            >
              Danh mục {renderSortIcon("category")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("restaurant_name")}
            >
              Nhà hàng {renderSortIcon("restaurant_name")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("price")}
            >
              Giá {renderSortIcon("price")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("is_active")}
            >
              Trạng thái {renderSortIcon("is_active")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedProducts.map((product) => (
            <tr key={product.restaurant_item_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/products/${product.restaurant_item_id}`}>
                  {product.item_image &&
                  !imageErrors[product.restaurant_item_id] ? (
                    <div className="h-12 w-12 relative">
                      <Image
                        src={
                          product.item_image_compressed_web ||
                          product.item_image
                        }
                        alt={product.item_name}
                        fill
                        className="object-cover rounded-md"
                        onError={() =>
                          handleImageError(product.restaurant_item_id)
                        }
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded-md">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </Link>
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/products/${product.restaurant_item_id}`}
                  className="hover:text-indigo-600"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {product.item_name}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {product.item_details}
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {getCategoryName(product)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {product.restaurant_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {product.display_price}
                </div>
                {product.offers_discount && (
                  <div className="text-sm text-gray-500 line-through">
                    {product.display_old_price}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.is_active ? "Hoạt động" : "Không hoạt động"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Link
                    href={`/products/${product.restaurant_item_id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Xem
                  </Link>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 ml-2"
                    >
                      Sửa
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-300"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Trước
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-300"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredProducts.length
                  )}
                </span>{" "}
                trong số{" "}
                <span className="font-medium">{filteredProducts.length}</span>{" "}
                kết quả
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    currentPage === 1
                      ? "text-gray-300"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Trước</span>
                  &larr;
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum = currentPage;
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  if (pageNum <= 0 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === pageNum
                          ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    currentPage === totalPages
                      ? "text-gray-300"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Sau</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
