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
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">
                BE Food Manager
              </h1>
            </div>
            <nav className="ml-6 flex space-x-8">
              <Link
                href="/products/table"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/products/table"
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Quản lý sản phẩm
              </Link>
              <Link
                href="/orders"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/orders"
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Quản lý đơn hàng
              </Link>
            </nav>
          </div>

          {/* Giỏ hàng */}
          <div className="flex items-center">
            <Link
              href="/cart"
              className={`relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                pathname === "/cart"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              <svg
                className="h-6 w-6 mr-1"
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
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full">
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
