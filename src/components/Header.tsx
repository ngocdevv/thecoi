"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useHydration } from "@/utils/useHydration";

export default function Header() {
  const pathname = usePathname();
  const isHydrated = useHydration();
  const { totalItems } = useCart();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <nav className="flex space-x-8">
            <Link
              href="/products/table"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === "/products/table"
                  ? "border-indigo-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Sản phẩm
            </Link>
            <Link
              href="/orders"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === "/orders"
                  ? "border-indigo-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Đơn hàng
            </Link>
          </nav>

          {/* Giỏ hàng */}
          <div className="flex items-center">
            <Link
              href="/cart"
              className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                pathname === "/cart"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Giỏ hàng
              {isHydrated && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
