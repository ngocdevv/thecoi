"use client";

import { Category, Product } from "@/types";
import ProductCard from "./ProductCard";

interface CategorySectionProps {
  category: Category;
  onEditProduct?: (product: Product) => void;
}

export default function CategorySection({
  category,
  onEditProduct,
}: CategorySectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.name}</h2>
      {category.description && (
        <p className="text-gray-600 mb-4">{category.description}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {category.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={onEditProduct}
          />
        ))}
      </div>
    </div>
  );
}
