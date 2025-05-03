"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Zap } from "lucide-react";
import Link from "next/link";
import ToolsCategories from "@/components/tools-categories";
import { ToolConfig } from "@/lib/config/tools";

interface Category {
  id: string;
  name: string;
}

interface ToolsGridProps {
  tools: ToolConfig[];
  categories: Category[];
  onCategoryChange?: (category: string) => void;
}

export default function ToolsGrid({ tools, categories, onCategoryChange }: ToolsGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTools = activeCategory === "all" 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  // Handle category change and notify parent component if callback is provided
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  // Initial notification to parent
  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(activeCategory);
    }
  }, []);

  return (
    <>
      <ToolsCategories 
        categories={categories} 
        onCategoryChange={handleCategoryChange} 
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div 
            key={tool.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md relative flex flex-col h-full"
          >
            {tool.isHot && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                <Flame className="h-3 w-3 mr-1" />
                HOT
              </div>
            )}
            {tool.isNew && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                NEW
              </div>
            )}
            <div className={`h-40 flex items-center justify-center bg-gradient-to-r ${tool.color} dark:from-blue-900/20 dark:to-indigo-900/20`}>
              {tool.icon}
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div>
                <h2 className="text-xl font-bold mb-2 dark:text-white">{tool.title}</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {tool.description}
                </p>
              </div>
              <div className="mt-auto pt-4">
                <Button asChild className="w-full">
                  <Link href={`/${tool.id}`} className="flex items-center justify-center gap-2" aria-label={`Use ${tool.title}`}>
                    Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}