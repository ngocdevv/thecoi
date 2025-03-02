"use client";

import { Product } from "@/types";
import Image from "next/image";
import { formatCurrency } from "@/utils/format";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
}

export default function ProductCard({ product, onEdit }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {product.image && (
        <div className="relative h-48 w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-medium text-indigo-600">
            {formatCurrency(product.price)}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
