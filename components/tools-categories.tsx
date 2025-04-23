"use client";

import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface ToolsCategoriesProps {
  categories: Category[];
  onCategoryChange: (categoryId: string) => void;
}

export default function ToolsCategories({ categories, onCategoryChange }: ToolsCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
    
    // Scroll to section if it exists
    if (categoryId !== "all") {
      const element = document.getElementById(categoryId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Scroll back to top of tools section
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-12">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium ${
            activeCategory === category.id
              ? "bg-primary text-white border-primary"
              : "bg-white border-gray-200 hover:bg-gray-100"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
} 